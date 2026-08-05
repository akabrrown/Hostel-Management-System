**UPSA HOSTEL MANAGEMENT SYSTEM**  
Complete Feature & Workflow Guide  
_Everything Students, Porters, and Administrators can do — and exactly how each feature works_  
Describes full system behaviour once every planned feature is built  
**University of Professional Studies, Accra (UPSA)**  
July 2026

1\. About This Document
=======================

This guide explains what the UPSA Hostel Management System (HMS) does once it is fully built — not how it is coded, but how it behaves for the people who use it. It is organized around the three human roles in the system: Student, Porter, and Administrator (the School Finance System is the fourth participant, but it is an external system, not a person who logs in).  
For each feature, you'll find: what the feature is, the exact step-by-step flow of how it works from the user's point of view, what statuses or states the user will see, and which notifications get triggered along the way. A final section walks through several features that involve more than one role — room-key tracking, visitor management, and maintenance reporting — showing how the three roles hand off to each other, plus a full end-to-end example from a student's first login to semester-end check-out.

1.1 The Four Participants
-------------------------

| **Participant** | **What they do in the system** |
| --- | --- |
| Student | Searches for hostels, reserves or books a room, tracks payment, checks in, uses the daily room-key system, requests visitors, reports maintenance issues, and manages their profile. |
| Porter | Runs the physical, day-to-day hostel: verifies and checks students in, tracks every room-key handover, approves or rejects visitors, and handles maintenance issues on the ground. |
| Administrator | Configures and oversees the entire operation: hostels, rooms and pricing, student records, booking approvals, room-key oversight, reporting, and system-wide announcements. |
| School Finance System (external) | Not a person who logs into the HMS. It generates invoices, receives student payments through the school's official payment platform, and sends payment-confirmation status back to the HMS. The HMS never touches money directly. |

_Golden rule of the whole system: students never pay inside the HMS. Every payment happens on the school's own finance/payment platform. The HMS only asks the finance system to create a charge, and listens for the finance system's confirmation that it has been paid._

2\. How the Whole System Works Together
=======================================

Before diving into each role, here is the big picture of how a room actually gets from "available" to "occupied by a checked-in student", and how the three roles take turns acting on it:  
**1\.** A student browses hostels and rooms on the web portal or mobile app.  
**2\.** The student either reserves a room type (to be allocated later) or books a specific room directly.  
**3\.** The HMS asks the School Finance System to create an invoice for that student.  
**4\.** The student pays through the school's own payment platform — never inside the HMS.  
**5\.** The Finance System confirms the payment back to the HMS.  
**6\.** The HMS activates the booking and the student can print proof of payment.  
**7\.** The assigned porter is notified that the student is arriving.  
**8\.** The porter verifies the student's identity and booking, then checks them in — the room becomes occupied.  
**9\.** From that point on, every day the student leaves, they hand their room key to the porter; every time they return, they collect it back. Every handover is recorded.  
**10\.** During their stay, the student can request visitors and report maintenance issues; the porter actions these on the ground; the administrator can see and report on all of it.  
**11\.** At semester end, the porter checks the student out, the key is confirmed returned, and the room becomes available again for the next booking cycle.

3\. Everything a Student Can Do
===============================

The student is the primary user of the platform. Every feature below is available on both the web portal and the mobile app, using the same account.

### 3.1 Registration & Login

Students do not create a username from scratch — their identity is tied to their official school index number.  
**_How it works, step by step:_**  
**1\.** Student opens the login screen and enters their Index Number (8 digits, e.g. UPSA12345678; the school prefix is optional).  
**2\.** The system recognises the index number and looks up (or creates) the matching account, with the email automatically set to indexnumber@upsamail.edu.gh.  
**3\.** For a first-time login, the default password is the student's own date of birth (DDMMYYYY).  
**4\.** The system immediately forces a password reset before letting the student go any further — the date-of-birth password can never be used long-term.  
**5\.** The student verifies their phone number using a one-time OTP code sent by SMS.  
**6\.** Once OTP is verified and the password is reset, the student lands on their dashboard.  
_Notifications triggered: registration confirmation (email) and OTP code (SMS)._

### 3.2 Profile & Account Management

Students can view and maintain their own information at any time from their profile page.  
**_How it works, step by step:_**  
**1\.** Student opens "Profile".  
**2\.** They can view personal information: name, programme, level, academic session, next-of-kin details.  
**3\.** They can update the fields the school allows students to self-edit (e.g. next-of-kin, phone number).  
**4\.** They can change their password at any time (must know current password, or go through OTP reset).  
**5\.** They can view their full hostel history — every past reservation, booking, check-in and check-out they've ever had in the system.

### 3.3 Hostel Search & Comparison

Before booking anything, students explore what's available.  
**_How it works, step by step:_**  
**1\.** Student opens "Hostels" and sees a list of every hostel with photos, price range, and a quick availability indicator.  
**2\.** They can filter by price, facilities, or availability.  
**3\.** Opening a hostel shows the full detail page: description, location (shown on a map), photos, house rules, and the list of room types offered (e.g. 2-in-1, 4-in-1) with prices.  
**4\.** From the hostel detail page, the student drills into a specific floor to see individual rooms and their live status.

### 3.4 Viewing Room Status

Every room the student sees always reflects its true, live status — never stale information.  
**_Status meanings:_**

| **Status** | **What it means** |
| --- | --- |
| Available | Room is open for booking or reservation. |
| Reserved | Room is temporarily held pending payment or allocation — not bookable by anyone else right now. |
| Pending Payment | Room is assigned to a student but their payment has not yet been confirmed. |
| Occupied | Room is currently occupied by students. |
| Maintenance | Room is under maintenance and unavailable. |
| Locked | Room has been locked by administration and is unavailable. |

### 3.5 Booking a Room — Two Ways

The system supports two different ways to secure a room, and a student picks whichever fits their situation.

### 3.5.1 Reservation (hold now, get allocated a room later)

Reservation is for a student who wants to lock in a room type and price today, and let the school allocate the exact room afterward.  
**_How it works, step by step:_**  
**1\.** Student selects a hostel, then a floor, then a room type (not a specific room).  
**2\.** Student creates the reservation — the system immediately places a temporary hold so nobody else can take that room-type slot.  
**3\.** The student now waits for an administrator to allocate an actual room to the reservation.  
**4\.** Once a room is allocated, the HMS automatically sends the charge details to the School Finance System.  
**5\.** The Finance System creates an invoice for the student.  
**6\.** The student pays through the school's official payment platform (not inside the HMS).  
**7\.** The Finance System confirms the payment back to the HMS.  
**8\.** The reservation converts into an active booking.  
**9\.** The student can now print their proof of payment directly from the hostel portal.  
**_Reservation statuses the student will see:_**

| **Status** | **What it means** |
| --- | --- |
| Pending | Reservation request submitted but not yet processed. |
| Reserved | Room-type is temporarily held for the student. |
| Awaiting Payment | Invoice has been generated; waiting for the student to pay. |
| Expired | The payment deadline passed with no payment — the hold is released automatically. |
| Cancelled | Cancelled by the student or an administrator. |
| Converted to Booking | Successfully turned into an active booking. |

_Notifications triggered: reservation created, payment reminder as the deadline approaches, and payment confirmation._  
_If a student does not pay before the deadline, the reservation expires automatically and the room-type hold is released back into availability — no manual action needed from the student or admin._

### 3.5.2 Direct Room Booking (pick and book a specific room immediately)

Direct booking skips the "reserve, then get allocated" step — the student picks an exact, currently-available room.  
**_How it works, step by step:_**  
**1\.** Student selects a hostel, then a floor, then a specific available room.  
**2\.** Booking is created immediately against that exact room.  
**3\.** The HMS sends a charge request to the Finance System.  
**4\.** The Finance System generates an invoice.  
**5\.** The student completes payment on the school's payment platform.  
**6\.** Payment confirmation is returned to the HMS.  
**7\.** The student prints their payment proof.  
**8\.** The booking is approved and the room is officially assigned to the student.  
**_Booking statuses the student will see:_**

| **Status** | **What it means** |
| --- | --- |
| Pending | Booking request has been submitted. |
| Awaiting Payment | Invoice generated; awaiting student payment. |
| Paid | Payment confirmed by the finance system. |
| Approved | Booking approved by administration. |
| Rejected | Booking rejected — a reason is always recorded and shown to the student. |
| Checked In | Student has physically checked in. |
| Checked Out | Student has physically checked out. |
| Cancelled | Booking cancelled. |
| Completed | The full booking lifecycle is finished. |

_Notifications triggered: payment confirmation, and booking approved / rejected._

### 3.6 Tracking Payment (without paying inside the app)

Students always know exactly where their money is, even though the payment itself happens on the school's own platform.  
**_How it works, step by step:_**  
**1\.** Student opens a reservation or booking and sees its live payment status: awaiting payment, paid, or failed.  
**2\.** As soon as the Finance System confirms a payment, the student's status updates automatically — no refreshing or manual check-in needed.  
**3\.** Once paid, the student can generate and print a payment proof document directly from the portal, to carry physically if needed.

### 3.7 Check-in (Student Side)

Check-in itself is performed by the porter, but the student's experience is straightforward.  
**_How it works, step by step:_**  
**1\.** After payment is confirmed, the student receives a check-in reminder notification.  
**2\.** The student travels to the hostel and reports to the assigned porter.  
**3\.** The porter verifies the student's identity and confirmed booking, then checks them in.  
**4\.** The student's dashboard updates to show "Checked In" and their room becomes their active accommodation.

### 3.8 Daily Room Key Status (Viewing)

Students don't manage the key list — that's the porter's job — but they always know exactly where their room key currently is.  
**_How it works, step by step:_**  
**1\.** Student opens "Room Key" on their dashboard or app.  
**2\.** They see the live status of their room's key: With Porter or With Student.  
**3\.** When the last roommate leaves and hands the key to the porter, every affected student's app updates to "With Porter".  
**4\.** When a roommate collects the key back from the porter, it updates to "With Student".  
**5\.** If a key is ever reported lost or damaged, the student sees that status too, along with any replacement-required notice.  
**_Status meanings:_**

| **Status** | **What it means** |
| --- | --- |
| With Porter | Room key is currently held by the hostel porter. |
| With Student | Room key is currently with a student occupant. |
| Lost | Room key has been reported lost. |
| Damaged | Room key has been reported damaged. |
| Replacement Required | A replacement key needs to be issued. |

_Notifications triggered: room key activity (collected/returned), shown in-app in real time._

### 3.9 Requesting a Visitor

Students can invite visitors, but every visitor must be screened and approved by the porter before being let in.  
**_How it works, step by step:_**  
**1\.** Student opens "Visitors" and submits a request with: visitor's name, phone number, relationship to the student, purpose of visit, and expected arrival time.  
**2\.** The request goes to the porter assigned to that hostel.  
**3\.** The porter reviews it and either approves or rejects it.  
**4\.** The student is notified of the outcome.  
**5\.** When the visitor physically arrives, the porter verifies their identity and records the arrival.  
**6\.** When the visitor leaves, the porter records the departure, closing out the request.  
**_Status meanings:_**

| **Status** | **What it means** |
| --- | --- |
| Pending | Request submitted, awaiting porter review. |
| Approved | Porter approved the visit. |
| Rejected | Porter rejected the visit. |
| Arrived | Porter has recorded the visitor's arrival. |
| Departed | Porter has recorded the visitor's departure. |

_Notifications triggered: visitor approved/rejected._

### 3.10 Reporting a Maintenance Issue

Any student can flag a problem with their room or common areas at any time.  
**_How it works, step by step:_**  
**1\.** Student opens "Maintenance" and selects a category: electrical, plumbing, furniture, cleaning, security, or other.  
**2\.** They write a description, optionally attach photos, and submit.  
**3\.** The system automatically records the room, the date, and lets the student (or an administrator later) mark a priority level.  
**4\.** The report goes to the porter assigned to that hostel, and is visible to administrators as well.  
**5\.** The student can track the report's status from submission through resolution.  
**_Status meanings:_**

| **Status** | **What it means** |
| --- | --- |
| Open | Reported, not yet actioned. |
| In Progress | Someone is actively working on it. |
| Resolved | Issue has been fixed. |
| Closed | Report has been formally closed out. |

_Notifications triggered: maintenance status updates as the report moves through its lifecycle._

### 3.11 Notifications

Students receive updates automatically across whichever channels apply — they never have to check manually to know something changed.  
**_How it works, step by step:_**  
**1\.** Every notification is generated by the system the moment a relevant event happens (e.g. payment confirmed, key collected, visitor approved).  
**2\.** Depending on the type of event, it arrives by email, SMS, push notification, and/or an in-app message — often more than one channel at once for anything important like payment or OTP.  
**3\.** The student can open "Notifications" at any time to see their full feed and mark items as read.

### 3.12 Viewing Hostel History

A running record of every hostel interaction the student has ever had.  
**_How it works, step by step:_**  
**1\.** Student opens their profile and selects "Hostel History".  
**2\.** They see every past reservation and booking, which hostel and room, dates, payment status, and check-in/check-out records.

### 3.13 Student Mobile App

Everything above is also available on the dedicated student mobile app, built so students can manage their accommodation without needing a laptop:

*   Login / OTP
*   Home screen (booking status + room-key status summary at a glance)
*   Hostel Search
*   Hostel Detail
*   Reserve / Book
*   My Bookings
*   Payment Confirmation (read-only, mirrors the finance system's status)
*   Room Key Status
*   Visitor Request
*   Maintenance Report
*   Hostel Rules
*   Notifications
*   Profile

4\. Everything a Porter Can Do
==============================

Porters run the physical, day-to-day operation of a single assigned hostel. Every porter is tied to exactly one hostel, and everything they see and do is scoped to that hostel only.

### 4.1 Hostel Overview

The porter's home screen gives them an at-a-glance snapshot of their hostel's current state.  
**_How it works, step by step:_**  
**1\.** Porter logs in and lands on their assigned hostel's overview.  
**2\.** They see current occupancy, pending check-ins, pending visitor requests, and open maintenance reports — all for their hostel only.

### 4.2 Verifying & Checking In Students

This is how a paid, approved booking turns into an actual student living in a room.  
**_How it works, step by step:_**  
**1\.** A new arrival notification tells the porter a student is on their way (triggered once payment is confirmed and the booking is approved).  
**2\.** The student arrives in person and the porter looks up their booking.  
**3\.** Porter verifies: the student's identity, that their booking is confirmed, and which room they've been assigned.  
**4\.** Porter checks the student in.  
**5\.** The room's status automatically flips to Occupied, and the student's booking status becomes Checked In.

### 4.3 Daily Room Key Tracking (the Porter's core daily job)

This module digitizes the old paper key sign-in/sign-out book. Its purpose is not to permanently assign a key to one student — it is to track, in real time, exactly where every room key currently is: with the porter, or with a student.

### 4.3.1 Recording a Key Returned to the Porter

Happens whenever the last roommate in a room is leaving.  
**_How it works, step by step:_**  
**1\.** The last student in the room locks up and brings the room key to the porter.  
**2\.** Porter verifies the student and the room.  
**3\.** Porter records the transaction in the system.  
**4\.** The room key's status flips to With Porter, visible instantly to that student, their roommates, and administrators.

### 4.3.2 Recording a Key Collected from the Porter

Happens whenever a student returns to the hostel and wants back into their room.  
**_How it works, step by step:_**  
**1\.** Student returns and asks the porter for their room key.  
**2\.** Porter verifies the student's identity and that they're assigned to that specific room.  
**3\.** Porter releases the key.  
**4\.** The system records: student ID, room number, collection time, and which porter handled it.  
**5\.** The room key's status flips to With Student.

### 4.3.3 Reporting a Lost, Damaged, or Replacement Key

Keys don't always come back in one piece — the system has a dedicated path for that.  
**_How it works, step by step:_**  
**1\.** Either the student or the porter can report an issue with a specific key.  
**2\.** Porter (or student) marks it as Lost, Damaged, or flags that a Replacement Is Required.  
**3\.** The status is visible immediately to the student, other roommates, and administrators, so everyone knows the key situation for that room.  
**4\.** Once a physical replacement key is issued, the porter updates the record back to a normal working status.  
_Every single key transaction — a return, a collection, a lost report, a damage report, or a replacement — is permanently logged with: transaction ID, student ID and name, room number, hostel, transaction type, date, time, the porter responsible, and any remarks. Nothing in this log can be edited after the fact — it's the immutable, digitized version of the old sign-in book._

### 4.4 Visitor Approval

Porters are the gatekeepers for every visitor request submitted by students in their hostel.  
**_How it works, step by step:_**  
**1\.** Porter sees a queue of pending visitor requests for their hostel only.  
**2\.** For each one, they review the visitor's name, phone, relationship, purpose, and expected arrival time.  
**3\.** Porter approves or rejects the request; the student is notified either way.  
**4\.** When the visitor physically shows up, the porter verifies identity and records the arrival.  
**5\.** When the visitor leaves, the porter records the departure — closing the loop.

### 4.5 Handling Maintenance Reports

Porters are the front line for fixing (or escalating) reported problems.  
**_How it works, step by step:_**  
**1\.** Porter sees every maintenance report submitted by students in their hostel, plus any they raise themselves while doing rounds.  
**2\.** They can update a report's priority and status as work progresses: Open → In Progress → Resolved → Closed.  
**3\.** Students automatically see the status update the moment the porter changes it.

### 4.6 Check-out (Including Semester-End)

The mirror image of check-in — closing out a student's stay in a room.  
**_How it works, step by step:_**  
**1\.** At the end of a booking period (or if a student leaves early), the porter processes a check-out.  
**2\.** Porter confirms the room key has been returned and records the room's condition.  
**3\.** The room's status flips back toward Available once cleaning/maintenance (if any) is complete.  
**4\.** At semester end, the porter can process check-outs for an entire batch of students finishing that booking period at once, rather than one at a time.

### 4.7 Occupancy View

A simple live picture of who is where in the porter's hostel.  
**_How it works, step by step:_**  
**1\.** Porter opens the occupancy view to see every room in their hostel and its current status (available, occupied, maintenance, locked) at a glance.

### 4.8 Porter Mobile App

Porters get a mobile-first version of the same tools, so they can act from anywhere in the hostel rather than being tied to a desk:

*   Login
*   Assigned Hostel Overview
*   Check-in Scanner/Form
*   Room Key Board (collect/return)
*   Visitor Approval Queue
*   Maintenance Issue Reporting
*   Occupancy View

5\. Everything an Administrator Can Do
======================================

The administrator has full, cross-hostel visibility and control. Unlike porters (scoped to one hostel), admins see and manage everything.

### 5.1 Cross-Hostel Overview

The admin's dashboard is the single place to see the health of the whole operation.  
**_How it works, step by step:_**  
**1\.** Admin logs in and sees a cross-hostel overview: total occupancy, revenue/payment status, and open issues (maintenance, pending bookings) — across every hostel at once.

### 5.2 Managing Students

Admins own the full student record.  
**_How it works, step by step:_**  
**1\.** View any student's full profile and hostel history.  
**2\.** Update a student's record where needed.  
**3\.** Suspend or reinstate a student account (e.g. for policy violations).

### 5.3 Managing Hostels, Blocks, Floors & Rooms

Admins build and maintain the entire physical catalogue that students browse.  
**_How it works, step by step:_**  
**1\.** Create a new hostel: name, description, location, photos, and house rules.  
**2\.** Add blocks (buildings) within a hostel, and floors within each block.  
**3\.** Add room types (e.g. 2-in-1, 4-in-1) with capacity and pricing.  
**4\.** Add individual rooms under a floor and room type.  
**5\.** Set or update prices, and manage which facilities are listed for a hostel.  
**6\.** Lock a room (making it unavailable) or put it into maintenance status directly.

### 5.4 Reservation Oversight

Admins are the ones who turn a reservation into an assigned room.  
**_How it works, step by step:_**  
**1\.** View all reservations across every hostel, filterable by status, hostel, or student.  
**2\.** Allocate a specific room to a pending reservation — this is the step that lets a reservation move toward payment.  
**3\.** Approve exceptions (e.g. special circumstances outside normal rules).  
**4\.** Extend a student's payment deadline if there's a legitimate reason for delay.  
**5\.** Cancel a reservation if necessary, releasing its hold.

### 5.5 Booking Oversight

Admins have final say on every direct booking as well.  
**_How it works, step by step:_**  
**1\.** View all bookings across every hostel, filterable by status.  
**2\.** Approve a booking once payment is confirmed.  
**3\.** Reject a booking with a reason recorded and shown to the student.  
**4\.** Reassign a booking to a different room if the situation changes.  
**5\.** Cancel a booking and handle any special case that falls outside the normal flow.

### 5.6 Room Key Monitoring

Admins get the bird's-eye view of the entire room-key operation across all hostels.  
**_How it works, step by step:_**  
**1\.** View the full, real-time key transaction log across every hostel — every return, collection, lost/damage report, and replacement.  
**2\.** See at a glance which keys are currently with porters vs. currently with students, hostel by hostel.  
**3\.** Generate key-movement reports for any date range or hostel.

### 5.7 Visitor Oversight

Admins can review visitor activity across the whole system, beyond any single porter's queue.  
**_How it works, step by step:_**  
**1\.** View visitor activity and history across all hostels.  
**2\.** Generate visitor reports for any period.

### 5.8 Maintenance Oversight & Triage

Admins see every maintenance issue raised anywhere in the system.  
**_How it works, step by step:_**  
**1\.** View all maintenance reports across every hostel, filterable by status, priority, or category.  
**2\.** Triage and prioritize issues that need attention across multiple hostels.  
**3\.** Generate maintenance reports summarizing open/resolved issues over time.

### 5.9 Reporting

A full reporting suite so the administration always has hard numbers, not just anecdotes.  
**_How it works, step by step:_**  
**1\.** Occupancy reports — by hostel, floor, or room type.  
**2\.** Payment/finance reconciliation reports — matching HMS bookings against confirmed payments.  
**3\.** Booking funnel reports — how many reservations/bookings started vs. completed vs. expired/cancelled.  
**4\.** Room-key activity reports — full movement history.  
**5\.** Visitor activity reports.  
**6\.** Maintenance reports — issues raised, resolved, and outstanding.

### 5.10 Announcements

A direct broadcast channel from admin to students and/or porters.  
**_How it works, step by step:_**  
**1\.** Admin composes an announcement.  
**2\.** It can be sent to everyone, or scoped to a single hostel.  
**3\.** Recipients see it in-app and, depending on importance, via email as well.

### 5.11 Managing Porter & Admin Accounts

Admins control who else has staff-level access.  
**_How it works, step by step:_**  
**1\.** Create, update, or deactivate porter accounts, and assign each porter to a specific hostel.  
**2\.** Manage other administrator accounts and their permission levels.

### 5.12 System Configuration

The underlying settings that every other feature depends on.  
**_How it works, step by step:_**  
**1\.** Manage academic sessions (e.g. 2026/2027) and mark which one is currently active.  
**2\.** Manage booking periods (e.g. Semester 1, Semester 2) within a session, and which is currently active.  
**3\.** Adjust other system-wide configuration as needed (e.g. payment deadlines, notification settings).

6\. Features That Involve More Than One Role
============================================

Some of the most important features only make sense when you see all three roles working together. This section walks through those handoffs end to end.

6.1 How the Daily Room Key System Works, Start to Finish
--------------------------------------------------------

This is the digitized replacement for the old paper sign-in/sign-out book, and it involves all three roles:  
**1\.** STUDENT leaves the room. If they're the last roommate leaving, they lock the room and bring the key to the PORTER.  
**2\.** PORTER verifies the student and the room, then records the key as returned. Status becomes "With Porter" — visible instantly to the STUDENT and any roommates.  
**3\.** Later, a roommate returns and asks the PORTER for the key.  
**4\.** PORTER verifies identity and room assignment, then releases the key. Status becomes "With Student".  
**5\.** If a key is ever lost or damaged, either the STUDENT or the PORTER can flag it; the ADMINISTRATOR sees this immediately in their cross-hostel key monitoring view and can track it through to replacement.  
**6\.** The ADMINISTRATOR can, at any time, pull a full report of every key movement across every hostel — for audits, for tracking a specific incident, or just to see how the system is being used.

6.2 How Visitor Management Works, Start to Finish
-------------------------------------------------

**1\.** STUDENT submits a visitor request with the visitor's details and expected arrival time.  
**2\.** PORTER (of that student's hostel) reviews the request and approves or rejects it. The STUDENT is notified of the decision.  
**3\.** When the visitor arrives, the PORTER verifies their identity in person and records the arrival.  
**4\.** When the visitor leaves, the PORTER records the departure, closing the request.  
**5\.** The ADMINISTRATOR can view visitor activity and generate reports across all hostels at any time, without needing to go through each porter individually.

6.3 How Maintenance Reporting Works, Start to Finish
----------------------------------------------------

**1\.** Either the STUDENT (from their room) or the PORTER (doing rounds) can raise a maintenance report, with a category, description, optional photos, and priority.  
**2\.** The report appears immediately in the PORTER's queue for that hostel, and in the ADMINISTRATOR's cross-hostel maintenance view.  
**3\.** The PORTER updates the status as work happens: Open → In Progress → Resolved → Closed.  
**4\.** The STUDENT who raised it sees every status change in real time.  
**5\.** The ADMINISTRATOR can triage across hostels, and pull maintenance reports summarizing everything open or resolved over any period.

6.4 How Booking & Payment Work, Start to Finish
-----------------------------------------------

**1\.** STUDENT reserves a room-type or books a specific room.  
**2\.** HMS automatically requests a charge from the School Finance System.  
**3\.** Finance System generates an invoice.  
**4\.** STUDENT pays on the school's own payment platform (never inside the HMS).  
**5\.** Finance System verifies the payment and reports back: paid, pending, or failed.  
**6\.** HMS updates the booking status automatically — no manual step needed by the student or admin for this part.  
**7\.** If it's a reservation, the ADMINISTRATOR is the one who allocates the actual room before the invoice is even created (see Section 5.4). If it's a direct booking, the ADMINISTRATOR gives final approval once payment is confirmed.  
**8\.** STUDENT prints their payment proof once everything is confirmed.  
**9\.** PORTER is notified of the student's arrival and completes the physical check-in.

7\. Complete End-to-End Example
===============================

Putting it all together: here is the full life of a single student's stay, from their very first login to moving out at the end of the semester.  
**1\.** Student logs in for the first time using their index number and date-of-birth default password, verifies via OTP, and is forced to set a new password.  
**2\.** Student browses hostels, compares a couple of options, and picks one.  
**3\.** Student creates a reservation for a room type (or books a specific available room directly).  
**4\.** Administrator allocates an actual room to the reservation (skip this step for direct bookings, since the room is already chosen).  
**5\.** HMS sends the charge to the School Finance System, which creates an invoice.  
**6\.** Student pays through the school's payment platform.  
**7\.** Finance System confirms the payment; HMS activates the booking.  
**8\.** Student prints their payment proof and receives a check-in reminder as move-in day approaches.  
**9\.** Student arrives at the hostel; the porter verifies their identity and booking, and checks them in. The room becomes occupied.  
**10\.** Throughout the semester: every time the student (or their last remaining roommate) leaves, the room key goes to the porter, and every time someone returns, they collect it back — every handover logged.  
**11\.** During the semester, the student can request visitors (approved/rejected and tracked by the porter) and report any maintenance issues (tracked through to resolution).  
**12\.** The administrator, throughout, has full visibility: they can see occupancy, payment reconciliation, key activity, visitor activity, and maintenance status for this student's hostel and every other hostel, and can send announcements to everyone.  
**13\.** At semester end, the porter processes the student's check-out (individually, or as part of a batch check-out for the whole booking period), confirms the key has been returned, and logs the room's condition.  
**14\.** The room becomes available again, ready for the next student to reserve or book.  
**END OF DOCUMENT**  
_UPSA Hostel Management System — Complete Feature & Workflow Guide_