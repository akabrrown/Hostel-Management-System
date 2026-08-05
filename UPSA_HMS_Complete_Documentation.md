**UPSA HOSTEL MANAGEMENT SYSTEM**  
Complete System Documentation  
_Functional Requirements · Technical Build Specification · Technology Stack (Free Tier & Production)_  
Consolidated Edition — Version 2.1 / v1.0 Merge  
**University of Professional Studies, Accra (UPSA)**  
July 2026

1\. Introduction & Purpose
==========================

The UPSA Hostel Management System (HMS) is a comprehensive digital platform designed to manage the complete hostel accommodation lifecycle: student accommodation registration, hostel selection, room reservation, booking, payment verification, room allocation, student check-in/check-out, daily hostel operations, room-key movement tracking, visitor control, maintenance reporting, and hostel administration.  
The system integrates with the school's financial management system, where hostel charges are generated and payments are processed. The hostel system never collects payments directly — it communicates with the school's billing platform to create invoices and receive payment confirmation. All hostel payments are processed through the school's official payment platform; the hostel system never stores card or mobile-money details, only invoice references and status.  
The system is accessible through a web application and a mobile application, and is built for four primary roles: Student, Porter, Administrator, and the School Finance System (external integration). The goal is to give students a seamless accommodation experience while allowing hostel administrators and porters to efficiently manage daily hostel activities.  
_This document merges three source documents into a single reference: the Functional Requirements & System Documentation (v2.1), the Technical Build Documentation (v1.0), and the Complete Technology Stack Documentation (v2.1). Read Sections 2–14 for business rules and functional scope, Sections 15–22 for implementation detail (schema, routes, folder structure), and Sections 23–31 for infrastructure, stack, and deployment planning._

2\. System Objectives
=====================

The system is designed to:

*   Allow students to view available hostels and rooms.
*   Allow students to reserve or book accommodation.
*   Automatically generate hostel charges on the school billing platform.
*   Receive payment confirmation from the financial system.
*   Prevent duplicate bookings.
*   Provide real-time hostel availability.
*   Allow administrators to manage hostel operations.
*   Allow porters to manage student movement and hostel activities.
*   Track daily movement of hostel room keys between students and porters.
*   Provide real-time visibility of whether room keys are with porters or students.
*   Manage hostel visitors.
*   Provide SMS and email notifications.
*   Provide mobile access for students and hostel staff.
*   Generate operational, financial, occupancy, and room-key activity reports.

3\. System Roles
================

3.1 Student
-----------

Responsible for hostel selection, room reservation, booking, payment monitoring, accommodation management, collecting and returning room keys, visitor requests, and maintenance reporting.

3.2 Porter
----------

Responsible for student verification, check-in/check-out, room monitoring, daily room-key movement tracking, issuing and receiving room keys, visitor approval, and maintenance reporting.

3.3 Administrator
-----------------

Responsible for complete hostel management, user management, room allocation, booking control, monitoring room-key activities, reports, and system configuration.

3.4 School Finance System (External)
------------------------------------

Responsible for student financial accounts, hostel invoices, payments, receipts, and payment verification. This system remains the sole source of truth for money.

4\. System Architecture Overview
================================

4.1 Functional Data Flow
------------------------

Student Mobile App / Web Portal  
|  
v  
+-----------------------------+  
| Hostel Management System |  
+-----------------------------+  
| Creates Hostel Booking  
v  
+-----------------------------+  
| School Finance System |  
+-----------------------------+  
| Student Makes Payment  
v  
+-----------------------------+  
| Payment Confirmation |  
+-----------------------------+  
| Hostel System Updates Booking  
v  
+-----------------------------+  
| Porter Handles Physical |  
| Hostel Operations |  
+-----------------------------+  
|  
v  
+-----------------------------+  
| Administrator Controls |  
| Operations |  
+-----------------------------+

4.2 Technical Component Architecture
------------------------------------

Three client surfaces (student web, porter/admin web, mobile apps) talk to a single NestJS API over HTTPS. The API is the only component that talks to Supabase Postgres, Redis, Cloudinary, and the School Finance System. The Finance System remains the sole source of truth for money.  
STUDENT WEB PORTER WEB ADMIN WEB MOBILE (Expo)  
| | | |  
+------------+------------+------------+  
| HTTPS  
v  
+-------------------+  
| Cloudflare (CDN, |  
| SSL, DDoS) |  
+-------------------+  
v  
+-------------------+  
| NestJS API |<------+  
| (Render) | | webhook: payment status  
+--+------+------+--+ |  
| | | |  
+--------+ +---+---+ +----------+----+  
v v v  
+---------+ +-------------+ +-------------------+  
|Supabase | |Upstash Redis| | School Finance |  
|Postgres | |(cache, jobs)| | System (external) |  
+---------+ +------+------+ +-------------------+  
|  
+------v------+  
| BullMQ |  
| Workers: |  
| reminders, |  
| expiry, |  
| key alerts |  
+--+-------+--+  
v v  
SendGrid FCM Push  
(email) (mobile)  
Real-time room-key status ("With Porter" / "With Student") is pushed to connected clients over Socket.io so porters and admins see live status without polling.

5\. Student Module
==================

The student is the primary user of the system, using the platform to search for accommodation, reserve rooms, complete bookings, monitor payment status, receive notifications, request services, manage visitors, and access hostel information. Students do not make payments directly inside the hostel system — all hostel payments are processed through the school's official payment platform.

5.1 Student Account Management
------------------------------

*   Login using school credentials.
*   Register using valid student information.
*   View personal information.
*   Update allowed profile details.
*   Change password.
*   View hostel history.

5.2 Login Requirements
----------------------

The system validates the Student Index Number, e.g. UPSA12345678. Default format is 8 digits; the school prefix is optional.  
Authentication information:

*   Index number.
*   Date of birth as initial password and default password after reset.
*   Phone number for OTP verification.
*   Email address auto-generated from index number: indexnumber@upsamail.edu.gh.

5.3 Hostel Search and Selection
-------------------------------

Students can view available hostels, compare hostels, view facilities, view room categories, view hostel prices, and check availability. Hostel information includes: name, location, photos, facilities, rules, room types, available rooms, and accommodation fees.

5.4 Room Selection
------------------

Each room contains: room number, floor, beds, capacity, price, current occupancy, and room status.

| **Room Status** | **Description** |
| --- | --- |
| Available | Room is open for booking or reservation. |
| Reserved | Room is temporarily held pending payment or allocation. |
| Pending Payment | Room is assigned but payment has not been confirmed. |
| Occupied | Room is currently occupied by students. |
| Maintenance | Room is under maintenance and unavailable. |
| Locked | Room is locked by administration and unavailable. |

6\. Hostel Booking Process
==========================

The system supports two booking methods: Reservation and Direct Room Booking.

6.1 Process One: Reservation
----------------------------

Reservation temporarily locks a room while waiting for payment completion and room allocation.  
**1\.** Student selects hostel.  
**2\.** Student selects floor.  
**3\.** Student selects room type.  
**4\.** Student creates reservation.  
**5\.** Student waits for administrator to allocate a room.  
**6\.** Hostel system sends charge information to finance system.  
**7\.** Finance system creates invoice.  
**8\.** Student pays through school payment platform.  
**9\.** Finance system confirms payment.  
**10\.** Hostel booking becomes active.  
**11\.** Student prints proof of payment from hostel portal.

| **Reservation Status** | **Description** |
| --- | --- |
| Pending | Reservation request has been submitted but not yet processed. |
| Reserved | Room is temporarily held for the student. |
| Awaiting Payment | Invoice has been generated; waiting for student payment. |
| Expired | Reservation has exceeded the payment deadline. |
| Cancelled | Reservation has been cancelled by student or administrator. |
| Converted to Booking | Reservation has been successfully converted to an active booking. |

6.2 Process Two: Direct Room Booking
------------------------------------

**1\.** Student selects hostel.  
**2\.** Student selects floor.  
**3\.** Student selects available room.  
**4\.** Booking created.  
**5\.** Hostel system sends charge request.  
**6\.** Finance system generates invoice.  
**7\.** Student completes payment.  
**8\.** Payment confirmation returned.  
**9\.** Student prints payment proof.  
**10\.** Booking approved.  
**11\.** Room assigned.

| **Booking Status** | **Description** |
| --- | --- |
| Pending | Booking request has been submitted. |
| Awaiting Payment | Invoice generated; awaiting student payment. |
| Paid | Payment has been confirmed by the finance system. |
| Approved | Booking has been approved by administration. |
| Rejected | Booking has been rejected (reason recorded). |
| Checked In | Student has completed physical check-in. |
| Checked Out | Student has completed physical check-out. |
| Cancelled | Booking has been cancelled. |
| Completed | Full booking lifecycle has been completed. |

7\. School Finance Integration
==============================

The finance system controls all payments. The hostel system only creates hostel charges, receives payment confirmation, and updates booking status.

7.1 Responsibilities
--------------------

| **Finance System Manages** | **Hostel System Manages** |
| --- | --- |
| Student accounts | Hostels |
| Hostel invoices | Rooms |
| Payments | Reservations |
| Receipts | Bookings |
| Payment history | Allocation, occupancy, porter activities |

7.2 Payment Flow
----------------

**1\.** Student books hostel.  
**2\.** Hostel system sends: Student ID, Booking ID, Hostel details, Amount.  
**3\.** Finance system generates invoice.  
**4\.** Student pays through school payment platform.  
**5\.** Finance system verifies payment.  
**6\.** Finance system sends status: Paid, Pending, or Failed.  
**7\.** Hostel system updates booking.

8\. Porter Module
=================

Porters manage the daily physical operations of the hostel, including student verification, room access management, daily room-key movement tracking, visitor control, and maintenance reporting.

8.1 Student Check-in
--------------------

Porter verifies student identity, booking confirmation, and assigned room. After verification, the student is checked in and the room becomes occupied.

8.2 Daily Room Key Tracking System
----------------------------------

An integrated module that digitizes the daily movement of hostel room keys between students and porters, replacing the traditional paper-based key sign-in/sign-out book. The purpose is not to assign keys permanently to students but to track the daily location and responsibility of every room key, in real time.  
During normal operations: when the last roommate leaves the room, the student submits the room key to the porter; when another roommate returns, the student collects the key from the porter; every movement is recorded.

### Room Key Return to Porter

**1\.** Last student leaves the room.  
**2\.** Student locks the room.  
**3\.** Student submits room key to porter.  
**4\.** Porter verifies student and room.  
**5\.** Transaction recorded.  
**6\.** Room key status changes to: With Porter.

### Room Key Collection from Porter

**1\.** Student returns to hostel.  
**2\.** Student requests room key.  
**3\.** Porter verifies student identity and assigned room.  
**4\.** Porter releases key.  
**5\.** System records: Student ID, Room number, Key collection time, Porter responsible.  
**6\.** Room key status changes to: With Student.

| **Room Key Status** | **Description** |
| --- | --- |
| With Porter | Room key is currently held by the hostel porter. |
| With Student | Room key is currently with a student occupant. |
| Lost | Room key has been reported lost. |
| Damaged | Room key has been reported damaged. |
| Replacement Required | A replacement key needs to be issued. |

Each room-key transaction stores: Transaction ID, Student ID, Student name, Room number, Hostel, Transaction type, Date, Time, Porter responsible, and Remarks.

8.3 Visitor Management System
-----------------------------

Controls visitors entering and leaving hostel premises.

### Student Visitor Request

Student submits: visitor name, phone number, relationship, visit purpose, and expected arrival time.

### Porter Visitor Process

Porter views visitor requests, verifies visitor identity, approves or rejects entry, and records arrival and departure.

9\. Maintenance Reporting
=========================

Students and porters can report: electrical problems, plumbing issues, damaged furniture, cleaning problems, security issues, and other hostel problems.  
Each report contains: Reporter, Room, Description, Images, Date, Priority, and Status.

10\. Administrator Module
=========================

The administrator controls the complete hostel operation.

10.1 Students
-------------

*   View students.
*   Update records.
*   Suspend accounts.
*   View history.

10.2 Hostels
------------

*   Create hostels.
*   Manage blocks.
*   Manage floors.
*   Manage rooms.
*   Set prices.
*   Manage facilities.

10.3 Reservations
-----------------

*   View reservations.
*   Approve exceptions.
*   Cancel reservations.
*   Extend payment periods.

10.4 Bookings
-------------

*   Assign rooms.
*   Change allocations.
*   Cancel bookings.
*   Handle special cases.

10.5 Room Key Monitoring
------------------------

*   View daily room-key activities.
*   View keys currently with porters.
*   View keys currently with students.
*   View transaction history.
*   Generate key-movement reports.

10.6 Reports
------------

*   Occupancy reports.
*   Payment reports.
*   Booking reports.
*   Room key activity reports.
*   Visitor reports.
*   Maintenance reports.

11\. Mobile Application Module
==============================

A mobile application (React Native + Expo, with Flutter + Dart as an open-source alternative) provides convenient access for students and hostel staff.

11.1 Student Mobile Features
----------------------------

*   Login.
*   Search hostels.
*   Reserve rooms.
*   View booking status.
*   Receive notifications.
*   View payment confirmation.
*   Submit maintenance requests.
*   Request visitors.
*   View hostel rules.
*   View room key status.

11.2 Porter Mobile Features
---------------------------

*   View assigned hostel.
*   Check students in.
*   Record room key collection.
*   Record room key return.
*   View current room key status.
*   Approve visitors.
*   Report issues.
*   View occupancy.

12\. Notification System
========================

The system sends automated communication through SMS, email, mobile push, and in-app channels. All notifications are first written to the notifications table (single source of truth), then dispatched by a BullMQ worker per channel so retries/failures are tracked independently of the triggering request.

| **Trigger** | **Recipient** | **Channel(s)** |
| --- | --- | --- |
| Registration confirmation | Student | Email |
| OTP verification | Student | SMS |
| Reservation created | Student | Email + Push + In-app |
| Payment confirmation (finance webhook) | Student | Email + SMS + Push |
| Booking approved / rejected | Student | Email + Push |
| Payment reminder (BullMQ scheduled) | Student | Email + SMS |
| Check-in reminder | Student | Push + SMS |
| Visitor approved/rejected | Student | Push + In-app |
| Maintenance status update | Student | In-app + Push |
| Room key activity (collected/returned) | Student | In-app |
| New student arrival | Porter | Push + In-app |
| Visitor request | Porter | Push |
| Maintenance request | Porter | Push + In-app |
| Outstanding room key alert (BullMQ scheduled) | Porter | Push + Email |
| Pending bookings / payment issues | Admin | In-app + Email digest |
| Maintenance & key activity reports | Admin | In-app + scheduled email digest |

13\. Design System
==================

Applies to the student web portal, porter dashboard, and admin dashboard. Mobile apps reuse the same tokens via a shared theme file.

13.1 Color Tokens
-----------------

| **Token** | **Hex** | **Usage** |
| --- | --- | --- |
| Primary Deep | #003366 | Headers, primary buttons, nav active state |
| Primary Mid | #1A5F9E | Hover states, secondary buttons, links |
| Primary Light | #E8F1F8 | Backgrounds, badges, hover tints |
| Accent Gold | #B8860B | CTAs, success highlights, key metrics, notif dots |
| Accent Gold Light | #F5E6C8 | Gold-tinted backgrounds, warning badges |
| Surface | #FFFFFF | Cards, modals, content areas |
| Background | #F8FAFC | Page backgrounds, dashboard canvas |
| Background Elevated | #FFFFFF | Floating elements, sticky headers |
| Text Primary | #0F172A | Headlines, body text |
| Text Secondary | #64748B | Labels, descriptions, placeholders |
| Text Tertiary | #94A3B8 | Disabled states, timestamps |
| Border | #E2E8F0 | Dividers, card borders, input outlines |
| Border Light | #F1F5F9 | Subtle separators |
| Success | #10B981 | Paid, checked-in, available |
| Success Light | #D1FAE5 | Success badge background |
| Warning | #F59E0B | Pending payment, awaiting action |
| Warning Light | #FEF3C7 | Warning badge background |
| Danger | #EF4444 | Cancelled, rejected, lost key, overdue |
| Danger Light | #FEE2E2 | Danger badge background |
| Info | #3B82F6 | Notifications, help tips, visitor pending |

13.2 Typography
---------------

*   Font family: Inter or Geist (system-ui fallback stack).
*   Scale: H1 32/40, H2 24/32, H3 20/28, Body 15/24, Small 13/20, Caption 12/16 (size/line-height in px).
*   Weights: 700 for headings and key metrics, 600 for buttons/labels, 400 for body text.

13.3 Status Badge Mapping
-------------------------

| **Semantic Color** | **Statuses it represents** |
| --- | --- |
| Success (green) | Available, Paid, Approved, Checked In, With Student (in-hand), Resolved, Arrived |
| Warning (amber) | Pending, Reserved, Awaiting Payment, Pending Payment, In Progress, Replacement Required |
| Danger (red) | Rejected, Cancelled, Expired, Lost, Damaged, Overdue, Locked |
| Info (blue) | Pending visitor request, notifications, system alerts |
| Primary / Neutral | Completed, Checked Out, With Porter, Maintenance, Closed |

13.4 Layout & Components
------------------------

*   8px spacing scale (4, 8, 12, 16, 24, 32, 48, 64).
*   Cards: 12px radius, 1px Border, subtle shadow on hover only.
*   Buttons: Primary = Primary Deep background / white text; Secondary = Primary Light background / Primary Deep text; Destructive = Danger.
*   Data tables (TanStack Table) use zebra striping with Background Elevated / Background, sticky header in Primary Deep on admin screens.
*   shadcn/ui components themed via CSS variables mapped to the tokens above — do not hardcode hex values in components.

14\. Database Schema (Supabase PostgreSQL)
==========================================

All primary keys are uuid (default gen\_random\_uuid()). All tables include created\_at timestamptz default now(); mutable tables also include updated\_at. Foreign keys use ON DELETE RESTRICT unless noted. Enums are implemented as Postgres enum types or check constraints.  
Main entities: Users, Roles, Students, Porters, Administrators, Hostels, Blocks, Floors, Rooms, Room Types, Reservations, Bookings, Payments, Finance Invoices, Check-ins, Check-outs, Room Keys, Room Key Transactions, Visitors, Visitor Logs, Maintenance Requests, Notifications, Announcements, Audit Logs, Academic Sessions, Booking Periods.

### users — Root identity record for every login (student, porter, admin).

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK | Primary key |
| role | enum: student, porter, admin | Determines dashboard & permissions |
| index\_number | text, unique, nullable | Students only, e.g. UPSA12345678 |
| email | text, unique | Auto-generated as indexnumber@upsamail.edu.gh for students |
| phone | text | Used for OTP and SMS notifications |
| password\_hash | text | bcrypt/argon2; default = date of birth on first login |
| status | enum: active, suspended, inactive | Set by admin |
| must\_reset\_password | boolean, default true | Forces change after first login |
| created\_at / updated\_at | timestamptz | Audit timestamps |

### students — Extends users for student-specific profile data.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| user\_id | uuid FK → users.id | 1:1 with users |
| full\_name | text |  |
| programme | text | Degree programme |
| level | text | e.g. 100, 200, Masters |
| academic\_session\_id | uuid FK → academic\_sessions.id | Current session |
| date\_of\_birth | date | Used as initial password seed |
| gender | text |  |
| next\_of\_kin\_name | text |  |
| next\_of\_kin\_phone | text |  |

### porters — Extends users for porter staff.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| user\_id | uuid FK → users.id | 1:1 with users |
| full\_name | text |  |
| assigned\_hostel\_id | uuid FK → hostels.id | Porter's primary hostel |
| phone | text |  |

### administrators — Extends users for admin staff.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| user\_id | uuid FK → users.id | 1:1 with users |
| full\_name | text |  |
| permissions | jsonb | Optional fine-grained permission flags |

### hostels — Top-level accommodation property.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| name | text |  |
| description | text |  |
| location | text | Address / area |
| latitude / longitude | numeric | For Mapbox display |
| rules | text | House rules shown to students |
| photos | text\[\] | Cloudinary URLs |
| status | enum: active, inactive |  |

### blocks — A building/block within a hostel.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| hostel\_id | uuid FK → hostels.id |  |
| name | text | e.g. Block A |

### floors — A floor within a block.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| block\_id | uuid FK → blocks.id |  |
| floor\_number | int |  |

### room\_types — Pricing/category template (e.g. 2-in-1, 4-in-1).

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| hostel\_id | uuid FK → hostels.id |  |
| name | text |  |
| capacity | int | Beds per room |
| price | numeric | Per-student accommodation fee |
| description | text |  |

### rooms — Individual bookable room.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| floor\_id | uuid FK → floors.id |  |
| room\_type\_id | uuid FK → room\_types.id |  |
| room\_number | text |  |
| capacity | int | Denormalized from room\_type for quick reads |
| current\_occupancy | int, default 0 | Updated on check-in/out |
| status | enum: available, reserved, pending\_payment, occupied, maintenance, locked |  |

### academic\_sessions — School year container.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| name | text | e.g. 2026/2027 |
| start\_date / end\_date | date |  |
| is\_active | boolean |  |

### booking\_periods — Semester/term window within a session.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| academic\_session\_id | uuid FK → academic\_sessions.id |  |
| name | text | e.g. Semester 1 |
| start\_date / end\_date | date |  |
| is\_active | boolean |  |

### reservations — Temporary room-type hold pending allocation & payment.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| student\_id | uuid FK → students.user\_id |  |
| hostel\_id | uuid FK → hostels.id |  |
| room\_type\_id | uuid FK → room\_types.id |  |
| booking\_period\_id | uuid FK → booking\_periods.id |  |
| status | enum: pending, reserved, awaiting\_payment, expired, cancelled, converted\_to\_booking |  |
| reserved\_at | timestamptz |  |
| expires\_at | timestamptz | Drives BullMQ expiry job |

### bookings — Confirmed or in-progress room assignment.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| student\_id | uuid FK → students.user\_id |  |
| room\_id | uuid FK → rooms.id |  |
| reservation\_id | uuid FK → reservations.id, nullable | Null when created via direct booking |
| booking\_period\_id | uuid FK → booking\_periods.id |  |
| booking\_type | enum: reservation, direct |  |
| status | enum: pending, awaiting\_payment, paid, approved, rejected, checked\_in, checked\_out, cancelled, completed |  |
| amount | numeric |  |
| rejected\_reason | text, nullable |  |
| approved\_at | timestamptz, nullable |  |

### finance\_invoices — Invoice record mirrored from the School Finance System.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| booking\_id | uuid FK → bookings.id |  |
| student\_id | uuid FK → students.user\_id |  |
| invoice\_reference | text, unique | Finance system's invoice ID |
| amount | numeric |  |
| status | enum: pending, paid, failed |  |
| issued\_at / paid\_at | timestamptz |  |

### payments — Payment confirmation received from Finance System.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| invoice\_id | uuid FK → finance\_invoices.id |  |
| booking\_id | uuid FK → bookings.id |  |
| amount | numeric |  |
| payment\_reference | text, unique | Finance system transaction ID |
| status | enum: paid, pending, failed |  |
| verified\_at | timestamptz |  |
| source | text, default 'school\_finance\_api' | Provenance for audit |

### check\_ins — Physical check-in record.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| booking\_id | uuid FK → bookings.id |  |
| student\_id | uuid FK → students.user\_id |  |
| room\_id | uuid FK → rooms.id |  |
| porter\_id | uuid FK → porters.user\_id |  |
| checked\_in\_at | timestamptz |  |
| notes | text |  |

### check\_outs — Physical check-out record (including semester-end).

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| booking\_id | uuid FK → bookings.id |  |
| student\_id | uuid FK → students.user\_id |  |
| room\_id | uuid FK → rooms.id |  |
| porter\_id | uuid FK → porters.user\_id |  |
| checked\_out\_at | timestamptz |  |
| condition\_report | text | Room condition notes |

### room\_keys — Physical key record, one per room (or per key-copy).

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| room\_id | uuid FK → rooms.id |  |
| key\_code | text, unique | Physical tag / barcode identifier |
| status | enum: with\_porter, with\_student, lost, damaged, replacement\_required |  |
| current\_holder\_student\_id | uuid FK → students.user\_id, nullable | Set when status = with\_student |

### room\_key\_transactions — Immutable log of every key movement (the digitized sign-book).

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| room\_key\_id | uuid FK → room\_keys.id |  |
| room\_id | uuid FK → rooms.id | Denormalized for fast reporting |
| student\_id | uuid FK → students.user\_id |  |
| porter\_id | uuid FK → porters.user\_id |  |
| transaction\_type | enum: return\_to\_porter, collect\_from\_porter, lost\_report, damage\_report, replacement |  |
| transaction\_date | date |  |
| transaction\_time | time |  |
| remarks | text |  |

### visitors — Visitor request submitted by a student.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| student\_id | uuid FK → students.user\_id |  |
| room\_id | uuid FK → rooms.id |  |
| visitor\_name | text |  |
| phone | text |  |
| relationship | text |  |
| visit\_purpose | text |  |
| expected\_arrival\_time | timestamptz |  |
| status | enum: pending, approved, rejected, arrived, departed |  |

### visitor\_logs — Porter actions taken on a visitor request.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| visitor\_id | uuid FK → visitors.id |  |
| porter\_id | uuid FK → porters.user\_id |  |
| action | enum: approved, rejected, arrived, departed |  |
| action\_time | timestamptz |  |
| notes | text |  |

### maintenance\_requests — Issue reported by a student or porter.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| reporter\_id | uuid FK → users.id |  |
| room\_id | uuid FK → rooms.id |  |
| category | enum: electrical, plumbing, furniture, cleaning, security, other |  |
| description | text |  |
| images | text\[\] | Cloudinary URLs |
| priority | enum: low, medium, high, urgent |  |
| status | enum: open, in\_progress, resolved, closed |  |
| resolved\_at | timestamptz, nullable |  |

### notifications — Outbound message log across all channels.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| user\_id | uuid FK → users.id |  |
| type | text | e.g. payment\_confirmation, key\_overdue |
| title | text |  |
| message | text |  |
| channel | enum: sms, email, push, in\_app |  |
| status | enum: pending, sent, failed |  |
| sent\_at | timestamptz, nullable |  |

### announcements — Admin broadcast to students/porters.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| hostel\_id | uuid FK → hostels.id, nullable | Null = all hostels |

### audit\_logs — Immutable record of state-changing actions.

| **Column** | **Type** | **Description** |
| --- | --- | --- |
| id | uuid PK |  |
| user\_id | uuid FK → users.id, nullable | Null for system-triggered events |
| action | text | e.g. booking.approved, key.reported\_lost |
| entity\_type | text |  |
| entity\_id | uuid |  |
| old\_value / new\_value | jsonb |  |
| ip\_address | text |  |

14.1 Row-Level Security (RLS) Policy Summary
--------------------------------------------

| **Table group** | **Student** | **Porter** | **Admin** |
| --- | --- | --- | --- |
| students, bookings, reservations, payments, visitors, room\_key\_transactions (own rows) | SELECT/INSERT own rows only (user\_id/student\_id = auth.uid()) | SELECT rows for students in assigned\_hostel\_id | Full access |
| rooms, hostels, room\_types, blocks, floors | SELECT (public catalog) | SELECT for assigned hostel | Full access |
| room\_keys | SELECT own room's key status | SELECT/UPDATE for assigned hostel | Full access |
| maintenance\_requests | SELECT/INSERT own reports | SELECT/INSERT/UPDATE for assigned hostel | Full access |
| finance\_invoices, audit\_logs | SELECT own invoices only; no writes | No access | Full access (writes via service role / API only) |

All writes to finance\_invoices and payments happen exclusively through the API's service-role connection (never from client-side Supabase calls), since these tables are updated by the Finance System webhook.

15\. API Route Map (NestJS)
===========================

Base URL: /api/v1. All routes except auth and public hostel listings require a Bearer JWT; role is enforced via NestJS guards (@Roles('student'|'porter'|'admin')).

### 15.1 Authentication

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| POST /auth/login | Public | Index number / email + password → JWT |
| POST /auth/otp/request | Public | Send OTP to registered phone |
| POST /auth/otp/verify | Public | Verify OTP, complete login/registration |
| POST /auth/password/reset | Authenticated | Change password (forces reset of DOB default) |
| POST /auth/refresh | Authenticated | Refresh access token |
| POST /auth/logout | Authenticated | Invalidate session |

### 15.2 Student — Profile & Hostel Discovery

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| GET /students/me | Student | Own profile |
| PATCH /students/me | Student | Update allowed profile fields |
| GET /students/me/history | Student | Past hostel bookings |
| GET /hostels | Public | List hostels with filters (price, facility, availability) |
| GET /hostels/:id | Public | Hostel detail incl. blocks, room types, photos, rules |
| GET /hostels/:id/rooms | Public | Available rooms by floor/type |

### 15.3 Reservations & Bookings

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| POST /reservations | Student | Create reservation (hostel, floor, room type) |
| GET /reservations/me | Student | My reservations & status |
| POST /reservations/:id/cancel | Student/Admin | Cancel a reservation |
| POST /bookings/direct | Student | Direct room booking (skip reservation) |
| GET /bookings/me | Student | My bookings & status |
| GET /bookings/:id/payment-proof | Student | Printable payment proof (PDF) |
| GET /admin/reservations | Admin | All reservations, filterable |
| POST /admin/reservations/:id/allocate-room | Admin | Allocate a specific room to a reservation |
| POST /admin/reservations/:id/extend | Admin | Extend payment deadline |
| GET /admin/bookings | Admin | All bookings, filterable |
| POST /admin/bookings/:id/approve | Admin | Approve booking |
| POST /admin/bookings/:id/reject | Admin | Reject booking with reason |
| POST /admin/bookings/:id/reassign | Admin | Change room allocation |

### 15.4 Finance Integration

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| POST /finance/invoices | Internal (API→Finance) | Create invoice request: studentId, bookingId, amount |
| POST /finance/webhook/payment-status | Finance System | Webhook: paid / pending / failed → updates booking |
| GET /finance/invoices/:bookingId | Student/Admin | Invoice + payment status |

### 15.5 Porter — Check-in & Room Keys

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| GET /porter/hostel/overview | Porter | Assigned hostel occupancy snapshot |
| POST /porter/checkins | Porter | Check a student into their allocated room |
| POST /porter/checkouts | Porter | Check a student out (incl. semester-end) |
| GET /porter/room-keys | Porter | Live key status for assigned hostel |
| POST /porter/room-keys/:id/return | Porter | Record key returned to porter |
| POST /porter/room-keys/:id/collect | Porter | Record key collected by student |
| POST /porter/room-keys/:id/report | Porter/Student | Report lost/damaged key |
| GET /admin/room-keys/activity | Admin | Full key transaction history & reports |

### 15.6 Visitors

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| POST /visitors | Student | Submit visitor request |
| GET /porter/visitors | Porter | Pending visitor requests for assigned hostel |
| POST /porter/visitors/:id/approve | Porter | Approve visitor |
| POST /porter/visitors/:id/reject | Porter | Reject visitor |
| POST /porter/visitors/:id/arrival | Porter | Record arrival |
| POST /porter/visitors/:id/departure | Porter | Record departure |

### 15.7 Maintenance

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| POST /maintenance | Student/Porter | Submit issue (with images) |
| GET /maintenance/me | Student | My submitted reports |
| GET /porter/maintenance | Porter | Reports for assigned hostel |
| PATCH /maintenance/:id/status | Porter/Admin | Update status/priority |
| GET /admin/maintenance | Admin | All reports, filterable |

### 15.8 Admin — Configuration & Reports

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| POST/PATCH /admin/hostels | Admin | Manage hostels |
| POST/PATCH /admin/blocks, /floors, /rooms | Admin | Manage structure & pricing |
| POST/PATCH /admin/students/:id | Admin | Update records, suspend accounts |
| GET /admin/reports/occupancy | Admin | Occupancy by hostel/floor/room type |
| GET /admin/reports/payments | Admin | Payment/finance reconciliation report |
| GET /admin/reports/bookings | Admin | Booking funnel report |
| GET /admin/reports/room-keys | Admin | Key movement report |
| GET /admin/reports/visitors | Admin | Visitor activity report |
| GET /admin/reports/maintenance | Admin | Maintenance report |
| POST /admin/announcements | Admin | Broadcast announcement |

### 15.9 Notifications

| **Method & Path** | **Role** | **Description** |
| --- | --- | --- |
| GET /notifications/me | Authenticated | My notification feed |
| PATCH /notifications/:id/read | Authenticated | Mark as read |
| WS /ws/room-keys | Porter/Admin | Socket.io channel: live key status updates |

16\. Web Application Structure (React + Vite)
=============================================

Single Vite app with role-based routing gated by JWT role claim, split into three route trees. This keeps one deployable frontend on Vercel while cleanly separating each role's module.

16.1 Student Portal — Pages
---------------------------

*   /login — index number + password, OTP step for first login
*   /onboarding/reset-password — forced password reset (DOB default)
*   /dashboard — booking status, key status, quick actions, announcements
*   /hostels — browse/compare hostels with filters
*   /hostels/:id — hostel detail: photos, facilities, rules, room types
*   /hostels/:id/rooms — room/floor selector with live availability
*   /reserve/:roomTypeId — reservation flow (Section 6.1 workflow)
*   /book/:roomId — direct booking flow
*   /bookings — my bookings list with status badges
*   /bookings/:id — booking detail + payment status + printable proof
*   /room-key — live status of my room's key (With Porter / With Student)
*   /visitors — submit & track visitor requests
*   /maintenance — submit & track maintenance reports
*   /notifications — notification feed
*   /profile — profile view/edit, change password

16.2 Porter Dashboard — Pages
-----------------------------

*   /porter/login
*   /porter/overview — assigned hostel occupancy, pending actions
*   /porter/checkins — verify & check in arriving students
*   /porter/room-keys — live key board (with-porter / with-student), issue & return actions
*   /porter/visitors — approve/reject, record arrival/departure
*   /porter/maintenance — view & update reports for assigned hostel
*   /porter/checkouts — process check-outs incl. semester-end batch check-out

16.3 Admin Dashboard — Pages
----------------------------

*   /admin/login
*   /admin/overview — cross-hostel KPIs: occupancy, revenue status, open issues
*   /admin/students — manage student records, suspend/reinstate
*   /admin/hostels — CRUD hostels, blocks, floors, rooms, room types, pricing
*   /admin/reservations — view/approve exceptions, allocate rooms, extend deadlines
*   /admin/bookings — approve/reject, reassign rooms, cancel
*   /admin/room-keys — full key transaction log & current holder report
*   /admin/visitors — visitor activity across hostels
*   /admin/maintenance — all maintenance reports, priority triage
*   /admin/reports — occupancy / payments / bookings / keys / visitors / maintenance exports
*   /admin/announcements — compose & send broadcasts
*   /admin/users — manage porter & admin accounts, roles
*   /admin/settings — academic sessions, booking periods, system config

16.4 Folder Structure
---------------------

hostel-management-system/  
|-- apps/  
| |-- web/ # Vite + React (student, porter, admin)  
| | |-- src/  
| | |-- modules/  
| | | |-- student/ # pages, hooks, components  
| | | |-- porter/  
| | | \`-- admin/  
| | |-- components/ui/ # shadcn/ui themed primitives  
| | |-- components/shared/ # StatusBadge, DataTable, etc.  
| | |-- lib/ # axios instance, supabase client  
| | |-- store/ # zustand stores (auth, ui)  
| | |-- routes/ # role-gated route trees  
| | \`-- theme/tokens.ts # color/typography tokens  
| |  
| |-- api/ # NestJS  
| | \`-- src/  
| | |-- modules/  
| | | |-- auth/  
| | | |-- students/  
| | | |-- hostels/ (blocks, floors, rooms, room-types)  
| | | |-- reservations/  
| | | |-- bookings/  
| | | |-- finance/ # invoice + webhook handling  
| | | |-- porter/ # check-ins, room-keys, visitors  
| | | |-- maintenance/  
| | | |-- notifications/ # email, sms, push, in-app  
| | | |-- admin/ # reports, announcements, config  
| | | \`-- jobs/ # BullMQ processors  
| | \`-- common/ # guards, decorators, filters, pipes  
| |  
| |-- mobile-student/ # Expo (React Native)  
| \`-- mobile-porter/ # Expo (React Native)  
|  
|-- packages/  
| |-- shared-types/ # TS types mirroring DB schema  
| \`-- shared-validators/ # Zod schemas shared by web + api + mobile  
|  
|-- docker-compose.yml # local Postgres/Redis for dev  
\`-- .github/workflows/ # CI/CD

16.5 Mobile Application Screens (React Native + Expo)
-----------------------------------------------------

### Student App Screens

*   Login / OTP
*   Home (booking + key status summary)
*   Hostel Search
*   Hostel Detail
*   Reserve / Book
*   My Bookings
*   Payment Confirmation (read-only, mirrors finance status)
*   Room Key Status
*   Visitor Request
*   Maintenance Report
*   Hostel Rules
*   Notifications
*   Profile

### Porter App Screens

*   Login
*   Assigned Hostel Overview
*   Check-in Scanner/Form
*   Room Key Board (collect/return)
*   Visitor Approval Queue
*   Maintenance Issue Reporting
*   Occupancy View

Both apps share the packages/shared-types and packages/shared-validators packages with the web app and call the same NestJS API — there is no separate mobile backend.

17\. Authentication & Security Implementation
=============================================

*   Login identity: student index number (8-digit, optional school prefix) or generated email indexnumber@upsamail.edu.gh.
*   Default & reset password: student's date of birth (DDMMYYYY), hashed with bcrypt; must\_reset\_password flag forces a change on first login.
*   OTP verification: phone-based OTP (Speakeasy TOTP or Termii SMS in production) required at registration and available for step-up verification on sensitive actions.
*   JWT session: short-lived access token (15 min) + refresh token (7 days), role embedded as a claim and re-validated server-side on every request (never trust client-sent role).
*   Role-based access control: NestJS guards per route; Supabase RLS as a second, database-level enforcement layer (defense in depth).
*   Duplicate booking prevention: unique partial index ensuring one active (non-cancelled/completed) booking per student per booking\_period\_id.
*   Finance API communication: signed webhook payloads (HMAC secret) from the Finance System; API verifies signature before updating payment/booking status.
*   Audit logging: every state-changing admin/porter action (approve, reject, key transaction, suspend) writes an audit\_logs row via a NestJS interceptor.
*   Rate limiting: express-rate-limit / NestJS throttler on auth and OTP endpoints to prevent brute-force and OTP spam.
*   Backups: nightly pg\_dump export of Supabase Postgres to Cloudinary/other cold storage until a paid managed-backup tier is adopted.

17.1 Core Security Requirements (Functional Spec)
-------------------------------------------------

*   Role-based access control.
*   Secure authentication.
*   OTP verification.
*   Permission management.
*   Payment verification.
*   Audit logs.
*   Duplicate booking prevention.
*   Database backup.
*   Secure finance API communication.
*   Secure mobile authentication.

18\. Background Jobs (BullMQ on Upstash Redis)
==============================================

| **Job** | **Schedule** | **Action** |
| --- | --- | --- |
| reservation-expiry | Every 5 min | Expire reservations past expires\_at with no payment; release room-type hold |
| payment-reminder | Daily | Email/SMS students with awaiting\_payment bookings nearing deadline |
| key-overdue-alert | Daily | Flag keys with\_student beyond expected return window; notify porter/admin |
| notification-dispatch | Continuous (queue consumer) | Send queued notifications per channel with retry/backoff |
| nightly-backup | Daily, off-peak | pg\_dump export of the database |
| semester-end-checkout-batch | Manually triggered by admin | Bulk-generate check-out tasks for a booking period |

19\. Technology Stack — Phase 1: Free Tier ($0/month)
=====================================================

Total Cost: $0.00 USD per month. All tools below have genuinely free tiers, require no credit card, and are sufficient for development, demos, and pilot testing (up to roughly 50 concurrent students).

19.1 Frontend Layer
-------------------

| **Technology** | **Purpose** | **Free Tier Detail** |
| --- | --- | --- |
| React 18+ | Student web portal, admin dashboard | Open source, completely free |
| TypeScript | Type-safe development across frontend | Open source, completely free |
| Vite | Build tool & dev server | Open source, completely free |
| TanStack Table | Admin data tables & reports | Open source, completely free |
| Recharts | Charts, occupancy visualizations | Open source, completely free |
| Zustand | Lightweight state management | Open source, completely free |
| Axios | HTTP client | Open source, completely free |
| React Native + Expo | Cross-platform mobile apps | Open source, completely free |
| Flutter + Dart (alternative) | Alternative cross-platform mobile | Open source, completely free |
| Mapbox GL JS | Hostel location maps | 50,000 map loads/month free |
| Tailwind CSS | Utility-first styling | Open source, completely free |
| shadcn/ui | Accessible component primitives | Open source, completely free |

19.2 Backend Layer
------------------

| **Technology** | **Purpose** | **Free Tier Detail** |
| --- | --- | --- |
| Node.js | JavaScript runtime | Open source |
| NestJS | API framework (modular, DI, guards) | Open source |
| Go (Golang) | High-performance microservices | Open source |
| Gin / Fiber | Go web frameworks | Open source |
| Python 3.11+ | Report generation service | Open source |
| FastAPI | Python async API framework | Open source |
| Socket.io | Real-time key-status & notification pushes | Open source |
| Gorilla WebSocket | Go WebSocket library | Open source |
| Zod | Request/response schema validation (TS) | Open source |
| Pydantic | Schema validation (Python) | Open source |
| OpenAPI 3.0 / Swagger | API documentation | Open source |

19.3 Database & Storage
-----------------------

| **Technology** | **Purpose** | **Free Tier Detail** |
| --- | --- | --- |
| Supabase PostgreSQL | Primary relational database + Auth + RLS | 500MB storage, unlimited API calls, 500K Edge Function invocations/month |
| Neon PostgreSQL (alternative) | Serverless PostgreSQL alternative | 500MB storage, 190 compute hours/month |
| Upstash Redis | Sessions, rate limiting, job queue backing | 10MB storage, 10K commands/day |
| Redis (self-hosted) | Full Redis capability | Open source, run on Render/Railway free tier |
| MongoDB Community | Audit logs, notification history | Open source, self-host on Render free tier |
| Cloudinary | Hostel & room photos | 25GB storage + 25GB bandwidth/month |
| Supabase Storage | Maintenance report images / alt. file storage | 2GB storage, 50MB file limit |
| MinIO (self-hosted) | S3-compatible object storage | Open source, unlimited on own server |
| Meilisearch (self-hosted) | Search engine | Open source, run on Railway/Render free tier |
| PostgreSQL pg\_trgm | Basic fuzzy search (no external search needed) | Built into PostgreSQL, free |

19.4 Message Queue & Async Processing
-------------------------------------

| **Technology** | **Purpose** | **Free Tier Detail** |
| --- | --- | --- |
| BullMQ | Node.js job queue: payment reminders, reservation expiry, key-overdue alerts | Open source, uses Upstash Redis |
| Celery | Python task queue | Open source, uses Redis/RabbitMQ |
| Asynq | Go task queue | Open source, uses Redis |
| RabbitMQ (self-hosted) | Message broker | Open source, run on Render/Railway free tier |
| Redis Pub/Sub | Simple event broadcasting | Built into Redis, free |
| Bull Board | Job queue monitoring UI | Open source, free |

19.5 Real-time & Communication
------------------------------

| **Technology** | **Purpose** | **Free Tier Detail** |
| --- | --- | --- |
| Firebase Cloud Messaging (FCM) | Mobile push notifications | Unlimited, completely free |
| SendGrid / Resend | Transactional email | 100 emails/day (3,000/month) |
| Termii (Sandbox) | SMS & OTP — sandbox only | Free sandbox credits for dev/testing |
| Africa's Talking (Sandbox) | SMS & OTP — sandbox only | Free test credits for development |
| Socket.io | Real-time WebSocket updates | Open source, self-hosted on Render free tier |
| WebSocket (native) | Low-level real-time communication | Open source, built into browsers/servers |

19.6 Authentication & Security
------------------------------

| **Technology** | **Purpose** | **Free Tier Detail** |
| --- | --- | --- |
| Supabase Auth / JWT (jsonwebtoken, jose, golang-jwt) | Stateless session tokens per role | Open source / included |
| bcrypt / argon2 | Password hashing (DOB-seeded default password) | Open source, built into most frameworks |
| Speakeasy | TOTP/OTP generation for phone verification | Open source npm package |
| Passport.js | Authentication middleware | Open source, free |
| Helmet.js + express-rate-limit + CORS | HTTP hardening & rate limiting | Open source, free |
| Row-Level Security (Supabase) | Per-role data isolation at the DB layer | Included |
| Let's Encrypt | SSL/TLS certificates | Free, auto-renews every 90 days |
| Cloudflare | CDN, DDoS protection, SSL | Free tier |

19.7 DevOps & Infrastructure
----------------------------

| **Technology** | **Purpose** | **Free Tier Detail** |
| --- | --- | --- |
| GitHub + GitHub Actions | Source control & CI/CD | Unlimited public repo minutes; 2,000 min/month private |
| Docker + Docker Compose | Containerization / local multi-service orchestration | Open source, free |
| Render | NestJS API hosting / web service hosting | Free web service (sleeps after 15 min idle) |
| Railway | App hosting + databases | $5 credit/month + free trial period |
| Vercel | Web app hosting (student/porter/admin) | 100GB bandwidth/month |
| Netlify (alternative) | Frontend hosting | 100GB bandwidth/month, 300 build minutes/month |
| Fly.io | Edge-deployed applications | $5/month free credit |
| Sentry | Error tracking | 5,000 errors/month |
| UptimeRobot | Uptime monitoring / anti-sleep pings | 50 monitors |

_Known free-tier constraints that affect launch planning — Render's cold start (30–60s after 15 min idle), the 500MB database ceiling, and 100 emails/day — are catalogued with mitigations in Section 27._

19.8 Complete Free-Tier Architecture Diagram
--------------------------------------------

STUDENT WEB PORTER WEB ADMIN WEB  
\\ | /  
MOBILE (Expo / Flutter)  
|  
v  
+---------------------------+  
| CLOUDFLARE (FREE) |  
| CDN + SSL + Rate Limit |  
+---------------------------+  
|  
v  
+---------------------------+  
| NODE.JS / NESTJS API |  
| (Render / Railway free) |  
+---------------------------+  
| | |  
v v v  
+-----------+ +---------+ +--------------+  
| SUPABASE | | UPSTASH | | CLOUDINARY |  
| POSTGRES | | REDIS | | (Images) |  
| 500MB | | 10MB | | 25GB |  
+-----------+ +---------+ +--------------+  
|  
+----------+----------+  
v v v  
+-----------+ +-----+ +--------------+  
| SENDGRID | | FCM | | TERMII |  
| 100/day | | Free| | Sandbox |  
+-----------+ +-----+ +--------------+

19.9 Free-Tier Limitations & Constraints
----------------------------------------

*   Render Free Tier Sleep: web services sleep after 15 minutes of inactivity. First request after sleep takes 30–60 seconds to wake up — not suitable for real-time booking during rush periods.
*   Database Size (500MB): Supabase/Neon free tier limits storage to 500MB. With student photos, audit logs, and booking records, this fills quickly. Plan migration before reaching 80% capacity.
*   Redis Cache (10MB): Upstash free tier is 10MB — sufficient for sessions and rate limiting, but insufficient for caching room availability for 1,000+ rooms.
*   Email Limits (100/day): SendGrid/Resend free tier allows 100 emails per day. For a school of 5,000 students, this is roughly 1 email per 50 students per day.
*   SMS is NOT Free in Production: Termii and Africa's Talking sandbox modes are free for testing only. Real SMS delivery always requires paid credits — no free tier exists for production SMS.
*   No Always-On Guarantee: free tiers offer no SLA. Services may restart, data may be lost (always use pg\_dump backups), and support is community-only.
*   Compute Limits: Render free tier: 512MB RAM, shared CPU. Railway free tier: $5 credit. These cannot handle concurrent booking rushes (50+ simultaneous requests).
*   No Custom Domain on Some Tiers: Render free tier does not support custom domains — you must use a render.com subdomain. Vercel/Netlify free tiers do support custom domains.
*   Backup Responsibility: free tiers do not guarantee backups — you must manually export PostgreSQL data regularly using pg\_dump or Supabase dashboard exports.
*   Concurrent User Limits: estimated capacity is ~20–50 concurrent users before performance degradation — not suitable for semester-start booking rushes.

20\. Technology Stack — Phase 2: Production Stack
=================================================

Target: production deployment serving real students with 24/7 uptime, concurrent booking support, SMS delivery, and professional monitoring. This phase activates when the system moves from pilot to live student usage.

20.1 Frontend Layer (Production)
--------------------------------

| **Technology** | **Purpose** | **Production Setup** | **Est. Monthly Cost** |
| --- | --- | --- | --- |
| React 18+ with TypeScript | Student web portal | Self-hosted on VPS / Vercel Pro | $0 (self-hosted) / $20 (Vercel Pro) |
| React Admin Dashboard | Admin operations, reports, analytics | Self-hosted on VPS | $0 (included in VPS) |
| React Native + Expo EAS | Cross-platform mobile apps | EAS Build subscription | $29/month (optional) |
| Flutter (alternative) | Cross-platform mobile apps | Free build tools | $0 |
| Tailwind CSS + shadcn/ui | Styling and components | Open source | $0 |
| TanStack Table + Recharts | Data tables and charts | Open source | $0 |
| Mapbox | Hostel location maps | Standard plan | $0–$50/month (depends on loads) |
| Cloudflare CDN | Global asset delivery | Pro plan (optional) | $0 (free tier sufficient) / $20 (Pro) |

20.2 Backend Layer (Production)
-------------------------------

| **Technology** | **Purpose** | **Production Setup** | **Est. Monthly Cost** |
| --- | --- | --- | --- |
| Node.js + NestJS | Main API server | Self-hosted on Hetzner VPS (2 vCPU, 4GB) | $6–$12/month |
| Go (Gin/Fiber) | High-performance booking microservice | Self-hosted on same VPS or separate | $6–$12/month (if separate) |
| Python + FastAPI | Report generation, analytics | Self-hosted on same VPS | $0 (included) |
| Socket.io / Native WS | Real-time updates | Self-hosted on same VPS | $0 (included) |
| NGINX | Reverse proxy, SSL termination, load balancing | Self-hosted on VPS | $0 (included) |
| Kong Gateway (OSS) | API gateway, rate limiting, auth | Self-hosted on VPS | $0 (included) |
| Docker + Docker Compose | Container orchestration | Self-hosted | $0 (included) |
| PM2 | Node.js process manager | Self-hosted | $0 (included) |

20.3 Database & Storage (Production)
------------------------------------

| **Technology** | **Purpose** | **Production Setup** | **Est. Monthly Cost** |
| --- | --- | --- | --- |
| PostgreSQL 15+ | Primary relational database | Self-hosted on VPS or managed (Supabase Pro/Neon) | $0 (self-hosted) / $25 (managed 8GB) |
| PgBouncer | Connection pooling | Self-hosted with PostgreSQL | $0 (included) |
| PostgreSQL Read Replica | Offload report queries | Self-hosted on same VPS (separate instance) | $0 (included in VPS resources) |
| Redis 7+ | Cache, sessions, pub/sub, rate limiting | Self-hosted on VPS | $0 (included) |
| Redis Sentinel | Redis high availability | Self-hosted (3-node setup) | $12–$18/month (3x VPS) |
| MongoDB Community | Audit logs, notification history | Self-hosted on VPS | $0 (included) |
| Meilisearch | Full-text search engine | Self-hosted on VPS | $0 (included) |
| MinIO | S3-compatible object storage | Self-hosted on VPS | $0 (included) |
| Cloudinary (optional) | Managed image CDN | Free tier (25GB) or Plus plan | $0–$25/month |
| AWS S3 (optional) | Object storage backup | Standard tier | $0.023/GB (~$0.50 for 20GB) |

20.4 Message Queue & Async Processing (Production)
--------------------------------------------------

| **Technology** | **Purpose** | **Production Setup** | **Est. Monthly Cost** |
| --- | --- | --- | --- |
| RabbitMQ | Message broker for decoupled services | Self-hosted on VPS | $0 (included) |
| BullMQ | Node.js job queue | Self-hosted (uses Redis) | $0 (included) |
| Celery + Redis | Python task queue | Self-hosted (uses Redis) | $0 (included) |
| Asynq + Redis | Go task queue | Self-hosted (uses Redis) | $0 (included) |
| Bull Board | Job queue monitoring UI | Self-hosted | $0 (included) |

20.5 Real-time & Communication (Production)
-------------------------------------------

| **Technology** | **Purpose** | **Production Setup** | **Est. Monthly Cost** |
| --- | --- | --- | --- |
| Firebase Cloud Messaging (FCM) | Push notifications | Google Firebase | $0 (unlimited, free) |
| Termii | SMS/OTP delivery (Ghana) | Pay-as-you-go credits | ~$0.015–$0.03/SMS (~$15–$30/mo for 1000 SMS) |
| Africa's Talking (alternative) | SMS/OTP delivery | Pay-as-you-go credits | ~$0.01–$0.02/SMS (~$10–$20/mo for 1000 SMS) |
| SendGrid | Transactional emails | Essentials plan (50K emails/month) | $19.95/month |
| Resend (alternative) | Transactional emails | Pro plan (50K emails/month) | $20/month |
| Socket.io / WebSocket (native) | Real-time WebSocket updates | Self-hosted on VPS | $0 (included) |

20.6 Authentication & Security (Production)
-------------------------------------------

| **Technology** | **Purpose** | **Production Setup** | **Est. Monthly Cost** |
| --- | --- | --- | --- |
| JWT (jsonwebtoken) | Stateless authentication tokens | Self-hosted | $0 |
| bcrypt / argon2 | Password hashing | Self-hosted | $0 |
| Speakeasy | TOTP OTP generation | Self-hosted | $0 |
| Passport.js | Authentication middleware | Self-hosted | $0 |
| Helmet.js + CORS | HTTP security headers | Self-hosted | $0 |
| express-rate-limit | API rate limiting | Self-hosted | $0 |
| Let's Encrypt | SSL/TLS certificates | Self-hosted, auto-renews | $0 |
| Cloudflare | CDN, DDoS protection, SSL | Free tier or Pro | $0 / $20/month |
| Fail2Ban | Brute force protection (server level) | Self-hosted on VPS | $0 |
| HashiCorp Vault (optional) | Secrets management | Self-hosted on VPS | $0 (OSS) |

20.7 DevOps, Infrastructure & Monitoring (Production)
-----------------------------------------------------

| **Technology** | **Purpose** | **Production Setup** | **Est. Monthly Cost** |
| --- | --- | --- | --- |
| GitHub (Private Repo) | Source control | Free for up to 3 collaborators | $0 |
| GitHub Actions | CI/CD pipeline | 2,000 min/month free; beyond: $0.008/min | $0–$5/month |
| Docker + Docker Compose | Containerization | Self-hosted | $0 |
| Hetzner Cloud VPS #1 (Primary) | 2 vCPU, 4GB RAM, 40GB SSD | CPX11 instance | €5.35 (~$6)/month |
| Hetzner Cloud VPS #2 (Read replica/backup) | 2 vCPU, 4GB RAM, 40GB SSD | CPX11 instance | €5.35 (~$6)/month |
| Hetzner Cloud VPS #3 (Redis Sentinel) | 2 vCPU, 4GB RAM, 40GB SSD | CPX11 instance | €5.35 (~$6)/month |
| Terraform | Infrastructure as Code | Open source | $0 |
| Prometheus + Grafana | Metrics collection & dashboards | Self-hosted / Cloud free tier | $0 |
| Loki | Log aggregation | Self-hosted | $0 |
| Sentry | Error tracking | Team plan (50K errors/month) | $26/month |
| UptimeRobot | Uptime monitoring | Pro plan (100 monitors, 1-min checks) | $8/month |
| Domain (.com / .edu.gh) | Professional domain | Namecheap / local registrar | $10–$15/year (~$1–$1.25/month) |
| Cloudflare Pro (optional) | Advanced DDoS, WAF rules | Pro plan | $20/month |

20.8 External Integrations (Production)
---------------------------------------

| **System** | **Integration Type** | **Data Exchange** | **Cost** |
| --- | --- | --- | --- |
| School Finance System | REST API / SOAP / Webhook | Invoice creation, payment confirmation, receipt data | $0 (internal integration) |
| Student Information System (SIS) | REST API | Student index numbers, enrollment status, academic sessions | $0 (internal integration) |
| School Payment Platform | Webhook endpoint + API polling | Payment status, transaction IDs, receipt numbers | $0 (internal integration) |
| Ghana.gov (NIA Verification, optional) | REST API | Student identity verification | Per API call (if applicable) |

20.9 Complete Production Architecture Diagram
---------------------------------------------

STUDENT (Web/Mobile) PORTER (Mobile App) ADMIN (Web Dashboard)  
\\ | /  
HTTPS / REST / WebSocket  
v  
+---------------------------+  
| CLOUDFLARE (FREE) |  
| CDN + SSL + DDoS + RL |  
+---------------------------+  
v  
+---------------------------+  
| NGINX (Load Balancer) |  
| + SSL Termination |  
+---------------------------+  
|  
+---------------------+----------------------+  
v v v  
+---------------+ +-------------------+ +------------------+  
| NODE.JS API | | GO BOOKING | | PYTHON REPORTS |  
| (NestJS) | | MICROSERVICE | | (FastAPI) |  
| VPS #1 | | VPS #2 (optional) | | VPS #1 (optional)|  
+---------------+ +-------------------+ +------------------+  
| | |  
+----------+----------+-----------------------+  
v  
+---------------+ +-----------+ +--------------+  
| POSTGRESQL | | REDIS | | RABBITMQ |  
| PRIMARY | | CLUSTER | | MESSAGE |  
| (VPS #1) | | (VPS #3) | | BROKER |  
| + PgBouncer | | Sentinel | | (VPS #1) |  
+---------------+ +-----------+ +--------------+  
v  
+---------------+  
| POSTGRESQL |  
| READ REPLICA |  
| (VPS #2) |  
+---------------+  
  
EXTERNAL SERVICES: Termii SMS ($15-30/mo) | SendGrid ($20/mo) | FCM (free)  
School Finance System (REST API / Webhook)  
  
MONITORING: Prometheus | Grafana | Loki | Sentry ($26/mo) | UptimeRobot ($8/mo)

20.10 Estimated Monthly Costs (Production)
------------------------------------------

Based on a medium-sized university with 2,000–5,000 students and typical semester-start booking rushes. Costs are in USD.

| **Category** | **Service** | **Configuration** | **Monthly Cost** |
| --- | --- | --- | --- |
| Infrastructure | Hetzner VPS #1 (Primary) | 2 vCPU, 4GB RAM, 40GB SSD | $6 |
| Infrastructure | Hetzner VPS #2 (Read Replica) | 2 vCPU, 4GB RAM, 40GB SSD | $6 |
| Infrastructure | Hetzner VPS #3 (Redis Sentinel) | 2 vCPU, 4GB RAM, 40GB SSD | $6 |
| Infrastructure | Domain Name (.com / .edu.gh) | Annual / 12 | $1 |
| Communication | Termii SMS (Ghana) | ~1,000 SMS/month | $15–$30 |
| Communication | SendGrid (Emails) | Essentials plan | $20 |
| Communication | Firebase Cloud Messaging | Unlimited push | $0 |
| Monitoring | Sentry (Error Tracking) | Team plan | $26 |
| Monitoring | UptimeRobot | Pro plan | $8 |
| Optional | Cloudflare Pro | Advanced WAF | $20 |
| Optional | Cloudinary Plus | Additional image storage | $25 |
| Optional | Expo EAS Build | Managed mobile builds | $29 |

**Minimum viable production cost (3 VPS + essential services): $55–$65/month.**  
**Recommended production cost (3 VPS + all essential + monitoring): $90–$120/month.**  
**Full production cost (3 VPS + all services + optional upgrades): $140–$180/month.**  
_All open-source software (PostgreSQL, Redis, RabbitMQ, NGINX, Docker, Prometheus, Grafana, Loki, NestJS, Go, Python, React, etc.) costs $0. The only recurring costs are infrastructure (VPS), SMS delivery, email service, and monitoring tools._

21\. Programming Languages for Performance & Scalability
========================================================

The following programming languages should be used strategically across the system to maximize performance, concurrency handling, and maintainability.

| **Language** | **Use Case** | **Performance Benefit** | **When to Use** |
| --- | --- | --- | --- |
| TypeScript | Frontend (React), full-stack type safety | Compiled to optimized JS, type safety prevents runtime errors | All frontend development, shared API contracts |
| Go (Golang) | Booking engine, finance webhook handler, key tracking API | Compiled binary, minimal memory footprint, fast cold starts | High-traffic booking endpoints, real-time key transactions |
| Rust | Critical booking lock service, distributed concurrency control | Zero-cost abstractions, memory safety without GC, near-C performance | Room allocation lock manager, preventing double bookings under extreme load |
| Python | Report generation, analytics, data migration scripts | Rich ecosystem (Pandas, ReportLab, OpenPyXL), rapid development | Background report generation, data analysis, admin exports |
| SQL (Advanced) | PostgreSQL stored procedures, triggers, advisory locks | Database-level execution eliminates network round-trips | Critical booking transactions with SERIALIZABLE isolation |
| Dart | Flutter mobile applications (if chosen) | AOT compilation to native ARM code | Cross-platform mobile apps for students and porters |

_Recommended language strategy: use TypeScript for the main API (NestJS) and all frontend work. Add Go microservices for the booking engine and finance webhook handler. Use Python for the reporting service. Use Rust only if extreme concurrency issues with double bookings arise that cannot be solved at the database level._

22\. Critical Architecture Patterns for Booking Concurrency
===========================================================

During semester-start booking periods, hundreds of students may simultaneously attempt to reserve the same limited rooms. These patterns prevent crashes, data corruption, and double bookings.

### 1\. Database-Level Protection (SERIALIZABLE Isolation)

Use PostgreSQL SERIALIZABLE transaction isolation for all room allocation operations. This is the strongest isolation level, preventing phantom reads and ensuring that when two students simultaneously try to book the last room, only one transaction succeeds. Implementation: wrap the entire booking flow (check availability → lock room → create reservation → send to finance) in a single SERIALIZABLE transaction. Add UNIQUE constraints on (room\_id, academic\_session, booking\_period) to make duplicate allocations physically impossible at the schema level.

### 2\. Distributed Locking (Redis Redlock / PostgreSQL Advisory Locks)

When 50 students click 'Reserve' for the last room in the same second, the application layer must serialize access. Use Redis Redlock or PostgreSQL Advisory Locks (pg\_advisory\_lock) so only one process can allocate a specific room at any given time. Implementation: acquire an advisory lock on the room\_id before starting the booking transaction; if already held, return 'Room temporarily unavailable, please retry.'

### 3\. CQRS (Command Query Responsibility Segregation)

Separate the write model (booking creation, payment processing) from the read model (hostel search, room availability display). Route all read traffic to PostgreSQL read replicas and Redis cache; keep the primary instance dedicated to writes. Implementation: browsing/search queries hit the read replica; booking creation hits the primary database; cache room availability in Redis with a 30-second TTL.

### 4\. Event-Driven Finance Integration (Asynchronous)

Never block the booking API waiting for the school finance system to respond. Use RabbitMQ or Kafka to queue invoice creation requests; the finance system processes them asynchronously and sends payment confirmations via webhook. Implementation: Student clicks 'Book' → API validates → publishes 'InvoiceRequest' event → returns 'Booking pending payment' immediately.

### 5\. Read Replicas for Report Generation

All admin reports (occupancy, payments, room key activity) run against PostgreSQL read replicas, preventing heavy analytical queries from slowing the primary database during booking rushes. Implementation: configure PostgreSQL streaming replication to a second VPS; route all SELECT queries from the admin dashboard to the replica; use PgBouncer on both primary and replica.

### 6\. Connection Pooling (PgBouncer)

Without connection pooling, each concurrent student creates a new database connection, quickly exhausting PostgreSQL's max\_connections (default 100) during a rush. PgBouncer multiplexes many client connections onto a smaller pool. Implementation: run PgBouncer in transaction mode with max\_client\_conn = 1000 and default\_pool\_size = 20, allowing 1,000 students to connect while using only 20 actual PostgreSQL connections.

### 7\. Caching Strategy (Redis with Short TTL)

Cache hostel metadata, room availability counts, and student session data in Redis. Use short TTLs (30–60 seconds) for availability data and longer TTLs (24 hours) for hostel metadata. Implementation: check Redis first on search; on cache miss, query the read replica and store with a 60-second TTL; invalidate immediately on booking confirmation.

### 8\. Rate Limiting (Redis + API Gateway)

Prevent abuse during booking rushes — a single student should not spam the 'Reserve' button 100 times per second. Rate limit booking endpoints to 5 requests per minute per student. Implementation: Redis-backed rate limiting (express-rate-limit with Redis store, or Kong rate limiting plugin): 5 req/min for /api/bookings, 20 req/min for /api/hostels/search; return 429 Too Many Requests with Retry-After header.

23\. Migration Path: Free Tier → Production
===========================================

A step-by-step migration plan from the free tier to production, minimizing downtime and data loss.

### Step 1: Export All Data from Free Tier

Before migrating, export all data from Supabase/Neon PostgreSQL using pg\_dump. Also export Redis data (if any persistent data exists) using redis-cli --rdb. Download all files from Cloudinary or Supabase Storage.

### Step 2: Provision Production Infrastructure

Spin up 3 Hetzner VPS instances (or equivalent). Install Docker and Docker Compose on each. Set up SSH keys, firewall rules (ufw), and basic hardening. VPS #1: Primary API + PostgreSQL Primary + RabbitMQ. VPS #2: Read Replica + backup services. VPS #3: Redis Sentinel node (for HA).

### Step 3: Restore Database to Production

Install PostgreSQL 15+ on VPS #1, create the database and user, and restore the backup. Set up streaming replication to VPS #2 for the read replica. Configure PgBouncer on VPS #1.

### Step 4: Deploy Application Containers

Build Docker images for the NestJS API, Go booking service, and Python report service. Push to a container registry (GitHub Container Registry is free for public repos). Deploy on VPS #1 using Docker Compose, with environment variables for DB\_HOST (PgBouncer), REDIS\_HOST (VPS #3), RABBITMQ\_HOST (VPS #1), SMS\_API\_KEY, SENDGRID\_API\_KEY, etc.

### Step 5: Configure NGINX and SSL

Install NGINX on VPS #1, configure reverse proxy to the API containers, and set up Let's Encrypt SSL certificates using certbot with rate limiting and security headers.

### Step 6: Update DNS and Cloudflare

Point the domain (e.g. hostel.upsa.edu.gh) to VPS #1's IP address. Configure Cloudflare DNS with orange-cloud proxying for DDoS protection, and set SSL/TLS mode to Full (strict).

### Step 7: Test with Limited Users

Before opening to all students, test with 10–20 volunteer students. Verify the booking flow, payment webhook, SMS delivery, email delivery, push notifications, room key tracking, and visitor management. Monitor logs with Loki and errors with Sentry.

### Step 8: Gradual Rollout

Open the system to one hostel first (e.g. 200 students). Monitor performance metrics in Grafana. If stable, open to the next hostel, continuing until all hostels are live.

### Step 9: Set Up Automated Backups

Configure daily automated backups: PostgreSQL pg\_dump to S3/MinIO, Redis RDB snapshots every 6 hours, application log retention of 30 days in Loki, and MinIO versioning with offsite backup — scheduled via cron jobs or systemd timers.

### Step 10: Monitor and Optimize

After go-live, continuously monitor API response times (Prometheus + Grafana), database connection pool usage (PgBouncer metrics), Redis memory usage and cache hit rates, error rates (Sentry), SMS delivery rates (Termii dashboard), and uptime (UptimeRobot). Optimize based on data: add read replicas, increase Redis memory, or scale VPS resources as needed.

24\. Security Requirements Matrix
=================================

Security requirements from the functional specification, mapped to their free-tier and production implementations.

| **Security Requirement** | **Free Tier Implementation** | **Production Implementation** | **Priority** |
| --- | --- | --- | --- |
| Role-based access control (RBAC) | JWT claims with role field; middleware checks | JWT + database role validation + route guards | Critical |
| Secure authentication | bcrypt password hashing + JWT tokens | bcrypt/argon2 + JWT with refresh tokens + secure httpOnly cookies | Critical |
| OTP verification | Speakeasy TOTP + Termii sandbox | Speakeasy TOTP + Termii production SMS delivery | Critical |
| Permission management | Middleware role checks | Granular permission system (CASL/AccessControl) | High |
| Payment verification | Webhook endpoint with basic auth | Webhook with HMAC signature verification + idempotency keys | Critical |
| Audit logs | PostgreSQL table + application logging | PostgreSQL audit table + Loki log aggregation + immutable logs | High |
| Duplicate booking prevention | UNIQUE constraint + application checks | UNIQUE constraint + SERIALIZABLE isolation + advisory locks + distributed locking | Critical |
| Database backup | Manual pg\_dump exports | Automated daily pg\_dump + WAL archiving + offsite S3/MinIO backup | Critical |
| Secure finance API communication | HTTPS + basic API key | HTTPS + mTLS (mutual TLS) + API key rotation + request signing | Critical |
| Secure mobile authentication | JWT stored in AsyncStorage (React Native) | JWT in secure storage (Keychain/Keystore) + biometric auth + certificate pinning | High |
| Rate limiting | express-rate-limit in-memory | Redis-backed rate limiting + NGINX limit\_req + Cloudflare rate limiting | High |
| DDoS protection | Basic Cloudflare free tier | Cloudflare (free or Pro) + NGINX rate limiting + VPS firewall (ufw) | Medium |
| SQL injection prevention | Parameterized queries (ORM) | Parameterized queries + input validation (Zod/Pydantic) + WAF rules | Critical |
| XSS prevention | React auto-escaping + Helmet.js | React auto-escaping + Content Security Policy (CSP) + Helmet.js | High |
| CSRF protection | Not applicable (API-only, JWT) | SameSite cookies + CSRF tokens for form submissions | Medium |

25\. Deployment & Free-Tier Constraints
=======================================

25.1 Free-Tier Architecture Summary
-----------------------------------

Suitable for development, demos, and pilots up to roughly 50 concurrent students. Web apps deploy to Vercel, the API to Render, database to Supabase, cache/queue backing to Upstash, media to Cloudinary, all fronted by Cloudflare.

25.2 Known Constraints & Mitigations
------------------------------------

| **Constraint** | **Impact** | **Mitigation** |
| --- | --- | --- |
| Render sleeps after 15 min idle | 30–60s cold start on first request | UptimeRobot ping every 10 min pre-launch; migrate to a paid always-on tier before semester-start booking rush |
| Supabase/Neon 500MB storage | Fills with photos, logs, records over time | Store images in Cloudinary not Postgres; monitor and migrate before 80% capacity |
| Upstash Redis 10MB | Insufficient for caching 1000+ room availability at scale | Cache only hot queries (per-hostel availability); expire aggressively |
| SendGrid/Resend 100 emails/day | ~1 email per 50 students/day at 5,000 students | Prioritize transactional (payment, OTP) over digest emails; batch admin digests |
| SMS not free in production | Termii/Africa's Talking sandbox is dev-only | Budget for paid SMS credits before go-live; treat SMS as a paid-tier launch dependency |
| No SLA / possible data loss | Free tiers can restart or lose data | Nightly pg\_dump backups regardless of tier |
| Render 512MB RAM, shared CPU | Can't handle 50+ concurrent booking-rush requests | Rate-limit reservation endpoint; upgrade before semester-start rush |

25.3 Upgrade Triggers
---------------------

*   Move Render → paid always-on tier before the first live semester booking window.
*   Move to paid SMS credits before go-live (no free path exists for production SMS).
*   Upgrade Supabase storage tier once usage approaches 400MB.
*   Add a paid email tier once daily transactional volume approaches 80/day.

26\. Cost Comparison: Free Tier vs. Production
==============================================

| **Category** | **Free Tier ($0)** | **Production ($55–$120/month)** |
| --- | --- | --- |
| Infrastructure Hosting | Render/Railway/Vercel free tiers | 3x Hetzner VPS (2 vCPU, 4GB each) |
| Database | Supabase/Neon 500MB | Self-hosted PostgreSQL 15+ (unlimited) + Read Replica |
| Cache | Upstash Redis 10MB | Self-hosted Redis 7+ (unlimited) + Sentinel |
| File Storage | Cloudinary 25GB or Supabase 2GB | MinIO self-hosted (unlimited) + Cloudinary backup |
| Email | SendGrid/Resend 100/day | SendGrid Essentials 50K/month |
| SMS/OTP | Sandbox only (testing) | Termii/Africa's Talking production credits |
| Push Notifications | FCM (unlimited, free) | FCM (unlimited, free) — same |
| Monitoring | Grafana Cloud free + Sentry free | Self-hosted Prometheus/Grafana + Sentry Team |
| Uptime Monitoring | UptimeRobot free (50 monitors) | UptimeRobot Pro (100 monitors, 1-min) |
| SSL/Security | Let's Encrypt + Cloudflare free | Let's Encrypt + Cloudflare free — same |
| Domain | Freenom free (.tk/.ml) | Paid .com / .edu.gh domain |
| Support/SLA | Community only, no SLA | Hetzner support + Sentry support + monitoring alerts |
| Concurrent Users | ~20–50 users | 500+ concurrent users, scalable to 5,000+ |
| Uptime Guarantee | None (services sleep) | 99.9% with always-on VPS + monitoring |

27\. Implementation Roadmap
===========================

Phase 0 — Foundation (Week 1–2)
-------------------------------

*   Set up monorepo, CI/CD, Supabase project, environment configs.
*   Implement full DB schema + RLS policies (Section 14).
*   Design tokens wired into Tailwind config + shadcn theme (Section 13).

Phase 1 — Auth & Core Catalog (Week 3–4)
----------------------------------------

*   Auth module: login, OTP, password reset, JWT + RLS.
*   Hostel/block/floor/room/room-type CRUD (admin) + public read endpoints.
*   Student portal: browse hostels, room selection UI.

Phase 2 — Booking & Finance (Week 5–6)
--------------------------------------

*   Reservation flow + direct booking flow.
*   Finance invoice creation + webhook handler.
*   Payment status propagation, printable payment proof.
*   Duplicate booking prevention, reservation-expiry job.

Phase 3 — Porter Operations (Week 7–8)
--------------------------------------

*   Check-in/check-out flows.
*   Room key tracking module + Socket.io live status.
*   Visitor management flow.
*   Maintenance reporting (student + porter submission).

Phase 4 — Admin & Reporting (Week 9–10)
---------------------------------------

*   Admin dashboard: students, reservations, bookings, room keys.
*   Reports: occupancy, payments, bookings, keys, visitors, maintenance.
*   Announcements module.

Phase 5 — Notifications, Mobile, Hardening (Week 11–13)
-------------------------------------------------------

*   Notification dispatch across email/SMS/push/in-app + BullMQ jobs.
*   Student & porter mobile apps (Expo).
*   Security pass: rate limiting, audit logs, RLS review.
*   Load-test against free-tier limits; document upgrade triggers.

28\. Pre-Launch Checklist
=========================

*   All RLS policies tested per role (student/porter/admin) — no data leakage across hostels.
*   Duplicate booking prevention verified under concurrent requests.
*   Finance webhook signature verification tested with simulated payloads.
*   Reservation-expiry and key-overdue jobs verified on schedule.
*   SMS provider upgraded from sandbox to paid production credits.
*   Render (or replacement) upgraded to always-on tier for booking-rush readiness.
*   Nightly backup job verified with a successful restore drill.
*   Load test at expected concurrent-user peak (semester start).
*   Uptime monitoring + Sentry error tracking live in production.
*   Design QA: color tokens, status badges, typography consistent across web + mobile.

29\. Complete System Flow Example
=================================

The following example illustrates the complete end-to-end lifecycle of a student using the Hostel Management System, from initial login through semester-end check-out.  
**1\.** Student Login: student logs into hostel portal/mobile app.  
**2\.** Hostel Selection: student selects hostel and room.  
**3\.** Reservation Creation: student creates reservation.  
**4\.** Room Lock: system locks room temporarily.  
**5\.** Invoice Request: hostel system sends invoice request to finance system.  
**6\.** Student Payment: student pays through school payment platform.  
**7\.** Payment Confirmation: finance system confirms payment.  
**8\.** Booking Activation: hostel system activates booking.  
**9\.** Payment Proof: student prints payment proof.  
**10\.** Porter Notification: porter receives arrival notification.  
**11\.** Check-in: porter checks student in.  
**12\.** Room Occupancy: student occupies room.  
**13\.** Key Return: during daily activities, the last roommate leaving submits the room key to the porter.  
**14\.** Key Return Record: porter records the key return.  
**15\.** Key Collection: when a roommate returns, the porter verifies and releases the key.  
**16\.** Visitor & Maintenance: student can request visitors and report issues.  
**17\.** Final Check-out: at semester end, porter completes final room check-out.  
**18\.** Room Availability: room becomes available for future students.  
Student Login -> Select Hostel & Room -> Create Reservation  
\-> System Locks Room -> Finance Invoice Request -> Invoice Created  
\-> Student Pays via School Platform -> Payment Confirmed  
\-> Booking Activated -> Student Prints Payment Proof  
\-> Porter Notified of Arrival -> Student Checked In  
  
DAILY OPERATIONS (Key Tracking):  
\- Last roommate leaves -> key to porter  
\- Roommate returns -> key from porter  
\- All transactions recorded  
  
ADDITIONAL ACTIVITIES: Visitor requests | Maintenance reporting  
  
Semester End -> Final Check-out by Porter -> Room Available for Future Students

30\. Summary & Recommendations
==============================

30.1 Executive Summary
----------------------

The UPSA Hostel Management System can be built entirely using free, open-source technologies. The free tier is sufficient for development, testing, demonstration, and small-scale pilot programs (up to ~50 students). When transitioning to production with real students, the estimated minimum monthly cost is $55–$65 USD, with a recommended production budget of $90–$120 USD/month for a medium-sized university (2,000–5,000 students).

30.2 Key Recommendations
------------------------

### 1\. Start with the Free Tier

Build the entire system using the free tier stack. This allows full development, testing, and stakeholder demonstrations without financial risk. Use this phase to validate the booking flow, finance integration, and mobile app functionality.

### 2\. Plan for SMS Costs Early

SMS/OTP is the only service with no free tier for production use. Budget $15–$30 per month for Termii or Africa's Talking credits from day one of production. Test thoroughly in sandbox mode during development.

### 3\. Use Go for the Booking Engine

When scaling to production, extract the booking reservation logic into a dedicated Go microservice. Go's goroutines can handle thousands of concurrent booking requests with minimal memory, preventing system crashes during semester-start rushes.

### 4\. Database-Level Concurrency Control

Never rely solely on application-level checks to prevent double bookings. Use PostgreSQL SERIALIZABLE isolation, UNIQUE constraints, and advisory locks — the only guarantees that hold under extreme concurrency.

### 5\. Separate Read and Write Traffic

Use PostgreSQL read replicas for all reporting, searching, and browsing queries. Keep the primary database dedicated to writes (bookings, key transactions, check-ins), preventing report generation from slowing critical booking operations.

### 6\. Event-Driven Architecture for Finance

Never block the booking API waiting for the school finance system. Use RabbitMQ to queue invoice requests asynchronously; the finance system processes them and sends payment confirmations via webhook, preventing timeout failures.

### 7\. Monitor from Day One

Set up Prometheus + Grafana + Sentry from the first production deployment. Monitor API response times, database connection pools, Redis memory, and error rates continuously.

### 8\. Automate Backups Immediately

Configure automated daily PostgreSQL backups (pg\_dump) and WAL archiving from day one of production. Store backups in a separate location (MinIO on VPS #2 or S3). Test restoration procedures monthly.

### 9\. Keep Cloudflare on Free Tier

Cloudflare's free tier provides unlimited CDN, DDoS protection, and SSL — sufficient for a university system. Only upgrade to Pro ($20/month) for advanced WAF rules or custom page rules.

### 10\. Use FCM for Push Notifications

Firebase Cloud Messaging is completely free with unlimited push notifications — the most cost-effective way to send real-time alerts to students and porters. No alternative needed.

30.3 Final Notes
----------------

Technology Stack Philosophy: this documentation prioritizes open-source, self-hosted solutions over managed cloud services. While managed services (AWS RDS, Google Cloud Run, Azure App Service) offer convenience, they come with significantly higher costs ($200–$500+/month for equivalent capacity). The self-hosted approach on Hetzner VPS provides comparable performance at roughly 1/10th the cost, with full control over data, security, and compliance — critical for a university handling student financial and personal data.  
Scalability Path: the production architecture can scale horizontally by adding more read replicas, more API server instances behind NGINX load balancing, and more Redis nodes. If the university grows beyond 10,000 students, consider migrating to managed Kubernetes (EKS/GKE) or adding dedicated database servers. For the foreseeable future (2,000–10,000 students), the 3-VPS setup with proper caching and connection pooling is more than sufficient.  
Compliance Note: as a university system handling student personal data and financial information, ensure compliance with Ghana's Data Protection Act, 2012 (Act 843). Self-hosting on Hetzner (EU-based) or local Ghanaian cloud providers may have data residency implications. Consult with the university's legal and IT security teams before finalizing infrastructure decisions.  
  
**END OF DOCUMENT**  
_UPSA Hostel Management System — Complete Consolidated Documentation_  
_Merging: Functional Requirements v2.1 · Technical Build Documentation v1.0 · Technology Stack Documentation v2.1_