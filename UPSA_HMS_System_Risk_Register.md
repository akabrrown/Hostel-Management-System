**UPSA HOSTEL MANAGEMENT SYSTEM**  
System Risk Register  
_Failure Modes, Edge Cases & Data-Integrity Issues to Fix Before and After Launch_  
A working checklist of everything that can go wrong, why, and how to fix it  
**University of Professional Studies, Accra (UPSA)**  
July 2026

1\. About This Document
=======================

The functional and technical documentation describe how the system is supposed to behave. This document describes how it can misbehave — every realistic failure mode, race condition, human-error scenario, and edge case that a booking system like this can run into once real students, real porters, and real money are involved.  
Each issue below includes: the scenario itself, why it happens, a priority rating, and a recommended fix. Use this as a working checklist — go through it category by category and confirm each fix is either already built, planned, or explicitly accepted as a known limitation.

1.1 Priority Definitions
------------------------

| **Priority** | **Meaning** |
| --- | --- |
| **Critical** | Can cause double-booking, financial loss, a security breach, or data corruption that's hard to reverse. Fix before launch. |
| **High** | Causes real operational disruption or student/staff frustration, but doesn't corrupt data or lose money directly. Fix soon after launch if not before. |
| **Medium** | An inconvenience, edge case, or data-quality issue. Track it and fix opportunistically. |

2\. Concurrency & Double-Booking Issues
---------------------------------------

The single most important category for a booking system. This is what you were specifically worried about — and it's a solved problem if handled at the database level, not just in application code.

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| Two students click "Book" on the same room within milliseconds of each other; both requests pass the availability check before either one commits. | The check ("is this room available?") and the action ("book it") are two separate steps with a gap between them — a classic race condition. Without a database-level lock, both requests can read "available" at the same time. | **Critical** | Wrap the entire booking flow in a single database transaction using PostgreSQL SERIALIZABLE isolation, plus a UNIQUE constraint on (room\_id, booking\_period) so a duplicate allocation is physically impossible even if the application logic has a bug. |
| A room shows "Available" on a student's screen, but it was actually taken seconds ago — they book it anyway and only find out it failed after clicking pay. | Cached or slightly stale data on the frontend; availability wasn't re-checked at the exact moment of booking. | **High** | Re-validate room availability server-side at the moment of booking (not just on page load), and show a clear "this room was just taken, please choose another" message instead of a generic error. |
| 50+ students hit "Reserve" for the same limited pool of rooms at the exact moment bookings open (semester-start rush), and the server crashes or times out under load. | No rate limiting or queuing on the booking endpoint; the database can't process that many simultaneous write transactions. | **Critical** | Rate-limit the booking/reservation endpoint per student (e.g. 5 requests/minute), use connection pooling (PgBouncer), and consider a short server-side queue for the first few minutes of a booking window so requests are processed in order instead of all colliding at once. |
| A student ends up with two active bookings at once — one via reservation, one via direct booking — because nothing stops them from doing both. | The reservation and direct-booking flows are independent and don't check each other before confirming. | **Critical** | Before creating any new reservation or booking, check whether the student already has an active (non-cancelled, non-completed) booking for the current booking period, and block a second one. |
| An administrator manually allocates a room to a reservation, but that exact room was already taken by someone else's direct booking a minute earlier. | Manual admin actions bypass the same automatic checks that protect the student-facing booking flow. | **Critical** | Route admin room-allocation actions through the same locking/validation logic as student bookings — never let an admin action write directly to a room's status without going through the same guarded process. |
| A student's payment succeeds on the school finance platform at the exact moment their reservation's hold expires — the room gets released to someone else while their money is already gone. | The reservation-expiry job and the payment-confirmation webhook are racing against each other with no coordination. | **Critical** | When a payment-confirmed webhook arrives for an expired reservation, don't silently drop it — flag it for manual admin review and hold the room, rather than letting it get reassigned. Treat "paid but expired" as an exception queue, not a dead end. |

3\. Payment & Finance Sync Issues
---------------------------------

The HMS and the School Finance System are two separate systems talking over a network — anything that can go wrong between two systems, will, eventually.

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| The Finance System confirms a payment, but the webhook never reaches the HMS (network drop, server restart, timeout). | Webhooks are "fire and forget" by default — if the HMS is down or slow for even a few seconds, the notification can be lost forever. | **Critical** | Have the Finance System retry failed webhooks automatically, and additionally run a periodic reconciliation job that polls the Finance System for any invoices marked paid that the HMS still shows as unpaid. |
| The same payment webhook gets delivered twice (common with most webhook systems), and the booking gets processed twice — duplicate notifications, or worse, duplicate room allocation. | Webhook senders often retry on any non-200 response, even if the first delivery actually succeeded. | **Critical** | Make the payment handler idempotent: store the Finance System's unique payment\_reference, and if a webhook arrives with a reference already processed, acknowledge it silently without repeating any side effects. |
| A student pays for a booking that has already been cancelled or expired by the time the payment lands. | No real-time check between the finance platform and the live HMS booking state at the moment of payment. | **High** | When a payment confirmation arrives for a cancelled/expired booking, don't discard it — route it to an admin exception queue for manual resolution (refund or reinstate), and never just lose track of the money. |
| A student pays a different amount than what was invoiced (short payment, or a manual/partial payment on the finance side). | The system assumes payment = full invoice amount and doesn't compare amounts. | **High** | Compare the confirmed payment amount against the invoice amount before marking a booking "Paid" — flag any mismatch for admin review instead of auto-approving. |
| A student wants a refund after cancelling a paid booking, but there's no defined process — money and room status get out of sync. | The functional design doesn't currently include a refund workflow. | **High** | Define an explicit refund flow: HMS notifies the Finance System of a cancellation-after-payment, Finance System processes the refund on their end, and the HMS tracks a 'Refund Pending / Refunded' status separately from 'Cancelled'. |
| The Finance System is down or slow, and every new booking attempt fails or hangs while waiting for an invoice to be created. | The booking flow makes a synchronous call to an external system and blocks on the response. | **High** | Make invoice creation asynchronous: confirm the booking as "Pending Payment" immediately, queue the invoice request, and update the student once the invoice is actually created — never let a slow external system freeze the booking experience. |
| Two invoices accidentally get created for the same booking (e.g. a student double-clicks "Pay" or a retry fires twice). | No uniqueness check before creating a new invoice request. | **Medium** | Check for an existing open invoice for a booking before creating a new one; reuse it instead of duplicating. |

4\. Reservation & Booking Lifecycle Issues
------------------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| The scheduled job that expires overdue reservations fails silently (crashes, server restart, queue stuck) — expired reservations pile up and block rooms indefinitely. | Background jobs can fail without anyone noticing unless they're actively monitored. | **Critical** | Add monitoring/alerting on the reservation-expiry job specifically — if it hasn't run successfully in over an hour during business hours, alert an admin. Also allow admins to manually force-expire a reservation as a manual override. |
| A student cancels a reservation after already paying, but there's no automatic reconciliation — the room gets released but the payment sits unresolved. | Cancellation and refund are treated as unrelated events. | **High** | When a paid reservation is cancelled, automatically create a refund-pending record and notify an admin, rather than just silently releasing the room. |
| A booking gets approved and paid, but the student never shows up to check in — the room sits reserved indefinitely with no one in it and no one else able to book it. | No no-show policy or timeout is defined after approval. | **Medium** | Define a check-in deadline after approval (e.g. first week of semester); if it passes with no check-in, notify an admin to decide whether to release the room. |
| The same student somehow ends up with two separate accounts (e.g. registered once, then again with a slightly different index-number format). | No strict duplicate-detection on registration beyond the exact index number string. | **Medium** | Normalize index numbers on input (strip prefixes/whitespace/case) before checking for an existing account, and block registration if a close match already exists. |
| A student wants to change rooms or swap with a roommate after booking, and there's no supported flow for it — it either doesn't happen or gets handled entirely outside the system. | Feature not part of the original scope. | **Medium** | Add an admin-mediated room-transfer action that moves a student from one room/booking to another while keeping full history, instead of requiring a cancel-and-rebook that loses the audit trail. |

5\. Room Allocation & Room Status Issues
----------------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A room's stated capacity is 4, but a manual override lets a 5th student get checked into it. | Manual admin/porter actions don't re-validate capacity against current occupancy. | **High** | Enforce capacity as a hard database constraint (reject any check-in that would exceed room capacity) rather than trusting the UI to prevent it. |
| A room shows "Available" while a student is still living in it, because the previous check-out step was skipped or done incorrectly. | Room status is a manual field set by porter action, not derived automatically from occupancy records. | **Critical** | Derive room status automatically from actual occupancy/check-out records rather than letting it be set independently — a room can't become "Available" while an active, non-checked-out occupant record still exists for it. |
| A room is reopened for booking right after being marked "Maintenance," before the repair is actually confirmed complete. | No verification step between "maintenance requested" and "maintenance resolved" before the room reopens. | **Medium** | Require a porter or admin to explicitly confirm resolution (tied to the maintenance\_requests record) before a room can transition out of Maintenance status. |
| An admin locks a room for a reason while a student is mid-way through booking it — the student's payment goes through for a room that's now locked. | No real-time lock check between the start and end of the booking/payment flow. | **High** | Re-check room status immediately before finalizing payment confirmation; if the room was locked in the meantime, route to the same exception queue used for expired-but-paid reservations. |

6\. Room Key Tracking Issues
----------------------------

This module replaces a paper sign-book with a digital one — but a digital system is only as reliable as the humans updating it.

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A porter forgets to log a key handover — the system shows the key "With Student" when it's actually back with the porter, or vice versa. | The system depends entirely on the porter remembering to record every physical handover; there's no automatic detection. | **High** | Make key logging a mandatory, single-tap part of the physical handover itself (not an afterthought) — e.g. require the log entry before the porter's session can move to the next task — and give porters a fast "correct a mistake" action instead of forcing them to work around a wrong status. |
| A key is handed to the wrong student because a porter mis-identifies them (same surname, rushed morning, etc.). | Verification relies on the porter's manual judgement with no secondary check. | **High** | Require the porter to pull up the specific student's record (by index number or photo) before releasing a key, rather than relying on recognition alone — surfacing the student's photo on the release screen helps a lot. |
| A student insists they returned their key, but there's no log entry — a dispute with no evidence either way. | No secondary confirmation on the student's side of the transaction. | **Medium** | Let the student see and confirm each key transaction in their own app in real time; if a student disputes a status, an admin can review the full immutable transaction log together with them. |
| A hostel has more than one physical key per room (spare/master keys), but the system only tracks a single key record per room. | The schema assumes one key per room. | **Medium** | Track each physical key as its own record (key\_code) linked to a room, so spares and masters are individually accounted for instead of conflated into one status. |
| Porter shift changes and key custody isn't properly transferred in the system — the outgoing porter is still shown as "responsible" for keys the incoming porter now physically holds. | No shift-handover step exists in the current design. | **Medium** | Add a simple shift-handover action where an outgoing porter's held-key count is confirmed and transferred to the incoming porter, logged as its own transaction type. |

7\. Check-in / Check-out Issues
-------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A student who never shows up to check in is never flagged — their room sits blocked with no automatic follow-up. | No-show handling isn't defined. | **Medium** | See the no-show fix in Section 4; surface a "paid but not checked in" report for admins to review periodically. |
| A porter checks a student out without confirming the room key was actually returned, leaving the key status stuck at "With Student" after the student has already left campus. | Check-out and key-return aren't enforced as linked steps. | **High** | Require key-return confirmation as part of the check-out flow itself — the porter can't complete a check-out until the key transaction shows "With Porter". |
| The semester-end batch check-out accidentally checks out students who shouldn't be (e.g. students who already paid and are staying for the next semester too). | A bulk action applied without enough filtering. | **High** | Require an explicit, filtered confirmation step before any batch check-out runs (e.g. "You are about to check out these 47 students — review the list"), and log batch actions distinctly from individual ones so they're easy to audit and reverse if needed. |

8\. Visitor Management Issues
-----------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A porter approves a visitor without properly verifying their identity against the request details. | Verification is a manual judgement call with no system-enforced check. | **High** | Show the porter the exact visitor details submitted by the student (name, phone, photo if collected) side-by-side at the point of arrival verification, not just an approve/reject button. |
| A visitor's departure is never logged — they show as "still on premises" indefinitely. | Departure logging is a separate manual step porters can forget. | **Medium** | Auto-flag any visitor still marked "Arrived" past a reasonable time window (e.g. end of visiting hours) for porter follow-up. |
| Two overlapping visitor requests for the same room at the same time aren't flagged as unusual. | No cross-check between simultaneous requests. | **Medium** | Not strictly necessary to block, but worth surfacing as a soft warning to the porter reviewing the queue. |

9\. Maintenance Reporting Issues
--------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| Several students report the exact same issue separately, cluttering the queue and making it look like multiple problems. | No duplicate-detection on new reports for the same room. | **Medium** | When a new report is submitted, show the porter/admin any other open reports for the same room so they can be merged or linked instead of worked independently. |
| A report gets marked "Resolved" without anyone actually verifying the fix — the same issue resurfaces days later. | No verification step separate from the status change itself. | **Medium** | Optionally require the reporting student (or a follow-up porter check) to confirm resolution before a report is fully closed, not just marked resolved by whoever worked on it. |
| A genuinely urgent/safety issue (e.g. exposed wiring) gets the same treatment as a minor cosmetic complaint, with no escalation. | Priority is self-selected at submission time with no override logic. | **High** | Let admins/porters re-prioritize on review, and set an SLA-style alert for anything marked "Urgent" that hasn't been actioned within a defined time window (e.g. 2 hours). |
| Reports can sit in "Open" indefinitely with nobody accountable for follow-up. | No ownership/assignment or timeout mechanism. | **Medium** | Add an optional "assigned to" field and a stale-report report for admins (e.g. anything open more than 7 days). |

10\. Notification Delivery Issues
---------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| An SMS or email fails to send and the student never finds out — e.g. a payment reminder that never arrives, and they miss their deadline. | Notification dispatch failures aren't surfaced or retried by default. | **High** | Track delivery status per notification (pending/sent/failed) and retry failed sends with backoff; for anything deadline-critical (payment reminders, expiry warnings), also show it prominently in-app so a failed SMS/email isn't the only channel. |
| A burst of notifications during a busy period (e.g. semester start) overwhelms students and important messages get lost in the noise. | No batching/digest logic for lower-priority notifications. | **Medium** | Batch non-urgent notifications into periodic digests, and reserve immediate, single-channel-max delivery for genuinely time-sensitive events (payment, OTP, key status). |
| A notification goes to the wrong person because the student's phone number or email on file is outdated or was entered incorrectly. | No verification loop after initial registration. | **Medium** | Require re-verification (OTP) any time a student updates their phone number, and periodically prompt students to confirm their contact details are current. |

11\. Authentication & Account Security Issues
---------------------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| Students share login credentials with friends (e.g. to let someone else check booking status), creating confusion about who actually took an action. | No technical control prevents credential sharing. | **Medium** | Can't fully prevent this technically, but the audit log (who did what, when, from what device/IP) at least gives you a trail to investigate if something goes wrong. |
| The default password (date of birth) is guessable by anyone who knows the student, creating a window of exposure before it's reset. | DOB is often public or easily discoverable information. | **High** | Force the password reset and OTP verification immediately on first login before allowing access to anything sensitive (already planned) — and additionally lock the account to read-only/no-booking-actions until the reset is complete. |
| A student loses access to their registered phone number (lost phone, changed SIM) and has no way to recover their account. | No account-recovery flow beyond OTP-to-phone is defined. | **Medium** | Add an admin-assisted recovery path: student proves identity in person or via school email, admin manually resets and re-links the account to a new phone number. |
| A JWT session token is stolen (e.g. from an insecure device) and used to impersonate a student. | Tokens are bearer credentials — anyone holding one can use it until it expires. | **High** | Keep access tokens short-lived (already planned at 15 minutes), store tokens securely on mobile (Keychain/Keystore, not plain storage), and support remote "log out all devices" for a compromised account. |

12\. Admin & Porter Human-Error Issues
--------------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| An admin selects the wrong student while manually allocating a room, assigning it to someone who didn't request it. | Manual selection from a list is error-prone, especially with similar names. | **High** | Show a confirmation step with the student's full details (photo, index number, programme) before finalizing any manual allocation, not just a name in a dropdown. |
| A bulk action (e.g. price update, announcement, batch check-out) gets applied to the wrong hostel or the wrong group of students. | No preview/confirmation step before bulk actions execute. | **High** | Always show a filtered preview ("this will affect these 32 rooms in Hostel B") and require explicit confirmation before any bulk write operation runs. |
| An admin cancels or deletes a live, paid booking by mistake, with no way to undo it. | Destructive actions execute immediately with no soft-delete or undo window. | **Critical** | Never hard-delete booking or payment records — use status flags (Cancelled) instead of deletion, keep full history, and add a short undo window (e.g. 30 seconds) or require a second confirmation for anything involving a paid booking. |
| A porter updates the wrong room's status (e.g. marks Room 12 for maintenance when they meant Room 21). | Similar room numbers, manual entry, no secondary confirmation. | **Medium** | Show the room's floor/block context clearly at the point of any status change, and log every status change with who made it and when so mistakes are easy to spot and reverse. |

13\. Data Integrity & Reporting Issues
--------------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A student account is deleted or deactivated, but their bookings, key transactions, and maintenance reports still reference it — reports break or show blank data. | No cascade/soft-delete strategy for related records. | **High** | Never hard-delete a student account with history attached — suspend/deactivate instead (already planned for suspension), preserving every linked record intact. |
| Admin reports show slightly different numbers depending on when they're run, because underlying data is still being written while the report generates. | Reports run against live data without a consistent snapshot. | **Medium** | For scheduled/exported reports, generate them from a consistent point-in-time snapshot (or a read replica, once at that scale) rather than querying live tables mid-write. |
| Someone with direct database access makes a manual edit that bypasses business rules (e.g. manually sets two students to the same room), silently breaking system invariants. | Direct DB access skips all application-level validation. | **High** | Restrict direct database write access to a small, audited group, and add database-level constraints (unique keys, capacity checks) that hold even if the application layer is bypassed. |

14\. Mobile & Connectivity Issues
---------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A porter takes an action (e.g. logs a key return) while their phone has no signal; when connectivity returns, the action either gets lost or conflicts with something else that happened in the meantime. | No offline queuing/sync strategy defined for the mobile app. | **Medium** | If offline support is needed, queue actions locally and sync with conflict-detection when connectivity returns (flag conflicts for manual review rather than silently overwriting); otherwise, clearly block actions and show "no connection" rather than letting them silently fail. |
| A student's app shows a stale room-key status because it was last synced before their phone lost connection. | No indicator distinguishing live data from cached data. | **Medium** | Show a clear "last updated" timestamp or offline indicator on status screens so students know when they're looking at potentially outdated information. |

15\. Infrastructure & Third-Party Dependency Issues
---------------------------------------------------

Covered in more depth in the Technology Stack documentation, but worth restating here as concrete failure scenarios.

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| The free-tier database hits its storage limit mid-semester and starts rejecting writes — new bookings fail outright. | Free-tier storage caps (e.g. 500MB) aren't actively monitored. | **Critical** | Set up a storage-usage alert well before the limit (e.g. at 75%) and have a pre-approved upgrade path ready, not something decided in a panic when writes start failing. |
| The API server has been idle and 'asleep' (free-tier cold start); a booking-rush burst of traffic hits it and the first wave of requests time out or fail while it wakes up. | Free hosting tiers sleep after inactivity. | **Critical** | Move to an always-on tier before any live booking window, and/or use a scheduled uptime-ping to keep the service warm during the risk window as a stopgap. |
| The SMS provider account is still in sandbox mode when the system goes live — students never receive real OTPs or payment reminders. | Sandbox and production credentials are easy to conflate. | **Critical** | Explicitly verify SMS delivery end-to-end with production credentials as a pre-launch checklist item, not an assumption. |
| No backup exists (or the last one is stale) when something goes wrong and data needs to be restored. | Free-tier services don't guarantee backups automatically. | **Critical** | Automate a daily backup regardless of hosting tier, and periodically test that a restore actually works — an untested backup is not a real backup. |

16\. Abuse, Fraud & Security Issues
-----------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A script repeatedly hits the reservation endpoint to hold rooms without ever paying, effectively locking inventory away from real students. | No rate limiting or bot detection on booking endpoints. | **High** | Rate-limit reservation creation per student/IP, and auto-expire unpaid holds aggressively (already planned) so even a successful abuse attempt only blocks a room temporarily. |
| A student manipulates a URL or API request to view or modify another student's booking, payment, or key data (insecure direct object reference). | An endpoint checks that a user is logged in, but not that the specific record belongs to them. | **Critical** | Enforce ownership checks on every record-level request (a student can only ever read/write their own bookings, visitors, maintenance reports) — enforced both in application logic and via Row-Level Security at the database layer, as defense in depth. |
| Someone signs up for a visitor request using a fake or reused name to gain repeat access without proper tracking. | No identity verification beyond what the student typed in. | **Medium** | Require the porter to visually verify ID for any visitor at the point of arrival (already part of the intended flow) — the system should support recording an ID number/photo if the university wants a stronger record. |

17\. Academic Session & Booking Period Issues
---------------------------------------------

| **Issue / Scenario** | **Why It Happens** | **Priority** | **Recommended Fix** |
| --- | --- | --- | --- |
| A new academic session is created before the old one is properly closed out — bookings from two different sessions get mixed together in reports and availability checks. | No enforced 'one active session at a time' rule. | **High** | Enforce that only one academic session (and one booking period within it) can be marked active at a time; require an explicit close-out step before a new one can be activated. |
| A student ends up booking into the wrong semester because the currently 'active' booking period wasn't updated in time. | Manual admin step (flipping the active period) forgotten or done late. | **Medium** | Add a reminder/checklist for admins ahead of every semester transition, and consider scheduling the period switch-over in advance rather than relying on a same-day manual toggle. |

18\. Where to Start: The Highest-Priority Fixes
===============================================

If you can only fix a handful of things before opening this up to real students, start here — these are the issues most likely to lose money, corrupt data, or create a security incident.  
**1\.** Database-level concurrency protection for room booking — SERIALIZABLE transactions + a UNIQUE constraint on (room, booking period), so double-booking is physically impossible, not just unlikely. (Section 2)  
**2\.** Idempotent, retried payment webhooks with reconciliation — never lose track of a confirmed payment because a webhook failed once. (Section 3)  
**3\.** Monitoring on the reservation-expiry background job — a silently-failed job quietly breaks room availability for everyone. (Section 4)  
**4\.** Room status derived from actual occupancy records, not a manually-set field — prevents a room showing "Available" while someone still lives there. (Section 5)  
**5\.** Ownership checks (and Row-Level Security) on every record a student can access — closes the door on one student viewing or editing another's data. (Section 16)  
**6\.** No hard deletes on bookings, payments, or accounts with history — use status flags so mistakes are reversible and reports never break. (Sections 12–13)  
**7\.** Confirmation step before any bulk or destructive admin action — the fastest way to prevent a five-second mistake from affecting fifty students. (Section 12)  
**8\.** Verified production SMS delivery and automated, tested backups before go-live — both are easy to assume are "working" until the day they're actually needed. (Section 15)  
**END OF DOCUMENT**  
_UPSA Hostel Management System — System Risk Register_