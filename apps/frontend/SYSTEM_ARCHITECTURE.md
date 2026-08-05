# System Architecture & Feature Reference

This document provides a comprehensive technical and functional overview of the UPSA Hostel Management System.

## 1. User Roles & Access Control

The application implements Role-Based Access Control (RBAC) across four distinct user types.

| Role | Access Scope | Authentication |
| :--- | :--- | :--- |
| **Student** | Personal Dashboard, Bookings, Payments, Announcements. | Index Number + Date of Birth |
| **Admin** | Full System Access (Manage Students, Rooms, Accounts, Settings). | Email + Password (MFA ready) |
| **Porter** | Operational Access (Check-in/out, Schedule, Occupancy). | Email + Password |
| **Director**| Strategic Access (Reports, Analytics, Financials). Read-Only focus. | Email + Password |

## 2. Feature Modules

### A. Student Modules
- **Dashboard**: Central hub displaying current accommodation status, room details (if allocated), roommates, and due payments.
- **Room Reservation**:
    - *Workflow*: Student selects Hostel -> Floor -> Room Type (e.g., 4-in-a-room).
    - *Logic*: Submits a "Preference Request" to the allocation queue.
- **Direct Booking**:
    - *Workflow*: Real-time selection of specific beds in available rooms.
    - *Concurrency*: Uses **Supabase Realtime** to lock beds instantly, preventing double-booking.
- **Payment Management**:
    - View billing history and semester status.
    - *Notifications*: alerts for upcoming deadlines and overdue warnings (Bed Removal Policy).
- **Announcements**: Searchable feed of updates.

### B. Admin Modules
- **Dashboard**: High-level KPIs (Occupancy Rate, Pending Payments, Total Students).
- **Account Management**:
    - Create/Manage Porter & Director accounts.
    - *Security*: Auto-generates secure credentials and forces password resets.
- **Student Management**:
    - Advanced search/filtering (by Hostel, Floor, Payment Status).
    - Export data to CSV/PDF.
- **Room Management**:
    - CRUD operations for Hostels, Floors, Rooms, and Beds.
    - *Bulk Ops*: Add multiple rooms/beds at once.
- **Allocation Engine**:
    - *Auto-Assign*: Algorithm matches Student Applications -> Available Beds based on preferences.
    - *Manual Override*: Drag-and-drop reassignment.
- **Announcements**: Rich-text editor to post updates to students.

### C. Porter Modules
- **Digital Logbook**: Replaces paper logs.
- **Check-In/Check-Out**:
    - Search Student -> One-click Action.
    - Records timestamp automatically in `porter_checkin_checkout` table.
- **Schedule View**: Shows assigned duty rosters.

### D. Director Modules
- **Analytics Dashboard**: Visualizations built with **D3.js**.
    - *Occupancy Trends*: Line charts showing fill rates over time.
    - *Financials*: Payment collection status by semester.
- **Reports**: Generate and export custom reports (Occupancy, Demographics, Payment).

## 3. Technical Core Features

### Real-Time System (Supabase Realtime)
The system pushes live updates to clients without page refreshes:
- **Bed Availability**: Changes reflect instantly on the booking map.
- **Notifications**: "New Announcement" alerts pop up immediately.
- **Allocations**: Students see "Room Assigned" status update live.

### Notification System
- **Channels**: Email (via Notify) and In-App Toasts.
- **Triggers**:
    - Payment Due/Overdue.
    - Room Allocation confirmed.
    - New Announcement posted.
    - Account Creation (Staff).

### State Management (Redux Toolkit)
Global state is managed via Redux slices for performance:
- `authSlice`: Stores user profile and JWT.
- `bookingSlice`: Manages the complex multi-step booking form state.
- `themeSlice`: Persists Dark/Light mode preference.

### UI/UX & Motion (GSAP)
- **Design System**: Navy Blue & Gold Brand Colors.
- **Animations**:
    - Page Transitions (Smooth fade/slide).
    - Micro-interactions (Button hovers, Card lifts).
    - **D3.js Charts**: Animated entry for graphs.

## 4. Security Implementation

Top-tier security measures integrated into the core flow:
- **Validation**: **Zod** schemas enforce strict data types on Forms and API bodies.
- **Bot Protection**: **Cloudflare Turnstile** gates all login/signup pages.
- **Rate Limiting**: **Upstash (Redis)** prevents API abuse (DDOS protection).
- **Sanitization**: **DOMPurify** cleans all rich-text inputs (Announcements).
- **Audit Logging**: All Admin actions (Create, Delete, Modify) are logged for accountability.

## 5. Development Standards
- **Tech Stack**: Next.js 14, TypeScript, Supabase, Redux Toolkit, Tailwind CSS.
- **Testing**:
    - Unit Tests for logical utilities.
    - Integration Tests for API routes.
    - End-to-End flows for Booking.
