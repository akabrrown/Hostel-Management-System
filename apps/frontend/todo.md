- [x] Set up Supabase project and authentication
- [x] Configure environment variables (.env.local)
- [x] Install all required dependencies (D3.js, GSAP, Formik, node-fetch, etc.)
- [x] Set up folder structure and file organization
- [x] Configure Next.js routing
- [x] Initialize Git repository

## Database & Backend Setup
- [x] Design Supabase schema for all roles (students, porters, admins, directors)
- [x] Create users table with authentication fields
- [x] Create students table with profile information
- [x] Create admin table with profile information
- [x] Create porters table with profile information
- [x] Create director table with profile information
- [x] Create hostels table
- [x] Create floors table
- [x] Create rooms table
- [x] Create beds table
- [x] Create room_types table (single, double, triple, etc.)
- [x] Create room_reservations table
- [x] Create room_bookings table
- [x] Create room_allocations table
- [x] Create payment_records table
- [x] Create porter_checkin_checkout table
- [x] Create announcements table
- [x] Create notifications table
- [x] Create user_preferences table (theme, settings)
- [x] Set up Supabase RLS (Row Level Security) policies for all tables
- [x] Set up Supabase Realtime subscriptions
- [x] Create database views for complex queries
- [x] Set up database triggers for automated actions (payment reminders, removal alerts)

## Authentication System
- [x] Create authentication API routes
- [x] Design unified login page (all roles)
- [x] Design unified signup page (students only)
- [x] Design password reset page
- [x] Implement student signup flow (UPSA + index number + DOB validation)
- [x] Implement student login flow (index number + DOB)
- [x] Implement admin account creation flow (database-created, complete profile after first login)
- [x] Implement admin login flow
- [x] Implement porter/director account creation flow (admin-created, email and password generated)
- [x] Implement porter/director login flow
- [x] Add password change requirement after first login (all roles except students)
- [x] Implement password reset email flow (admins, porters, directors)
- [x] Set up email verification for Supabase accounts
- [x] Create auth context/Redux slice for global auth state
- [x] Implement protected routes middleware
- [x] Add session management
- [x] Create role-based route protection
- [x] Update student auth structure (8-digit index number, auto-email, DOB as password)
- [x] Remove role selector from login page (backend determines role)
- [x] Add UPSA logo to all authentication pages
- [x] Add homepage background to authentication pages
- [x] Fix student authentication to use index number + DOB (per SYSTEM_ARCHITECTURE.md)
- [x] Implement dual authentication methods (student vs staff)
- [x] Update login validation schema for dual auth
- [x] Update login form UI with toggle buttons

## UI Components & Layout
- [x] Design and implement Navbar/Header component
- [x] Design and implement Sidebar/Navigation menu
- [x] Design and implement Footer component
- [x] Set up color scheme (Deep Navy Blue #001f3f, Golden Yellow #FFD700, Black #000000, White #FFFFFF)
- [x] Create Tailwind config with custom colors (deepNavyBlue, goldenYellow, black, white)
- [x] Create MUI theme with Deep Navy Blue and Golden Yellow as primary/secondary colors
- [x] Apply Deep Navy Blue as primary brand color
- [x] Apply Golden Yellow for accent elements, CTAs, and highlights
- [x] Create Button component (with variants: primary, secondary, outline, ghost)
- [x] Create Input component (with validation states)
- [x] Create Card component (for content sections)
- [x] Create Select component (dropdown functionality)
- [x] Create Modal component (for dialogs and overlays)
- [x] Create Table component (for data display)
- [x] Create Badge component (for status indicators)
- [x] Create Loading components (spinners, skeletons, loading states)
- [x] Create error pages (404, 403)
- [x] Implement responsive design principles
- [x] Add hover states and micro-interactions
- [x] Implement focus management for accessibility
- [x] Replace header text with UPSA logo
- [x] Change header background color to white
- [x] Add login navigation button to header
- [x] Add UPSA logo to all pages and components
- [x] Remove theme toggle feature completely
- [x] Reduce footer size
- [x] Configure Next.js Image component for external domains
- [ ] Use navy blue for backgrounds, text, and main UI elements
- [ ] Use golden yellow for buttons, links, hover states, and important notifications
- [ ] Create reusable button components (with MUI)
- [ ] Create reusable card components
- [ ] Create reusable modal/dialog components
- [ ] Create reusable form components
- [ ] Create reusable input field components with Formik integration
- [ ] Create reusable select/dropdown components
- [ ] Create reusable table components
- [ ] Create reusable badge/tag components
- [ ] Create reusable notification/toast components
- [ ] Create reusable loading spinner components
- [ ] Create reusable error message components
- [ ] Create reusable success message components
- [ ] Install and integrate icon library (Lucide, Material Icons, etc.)
- [ ] Create responsive grid/flex utility classes
- [ ] Set up component library documentation

## Dark/Light Mode Implementation
- [x] Remove theme toggle feature completely (as requested)
- [x] Remove theme-related Redux state and components
- [x] Clean up theme-related validation and constants
- [ ] Create theme context with Redux (future enhancement)
- [ ] Implement theme toggle functionality (future enhancement)
- [ ] Design dark mode: Deep Navy Blue backgrounds with Golden Yellow accents (future enhancement)
- [ ] Design light mode: White backgrounds with Deep Navy Blue text and Golden Yellow CTAs (future enhancement)
- [ ] Add theme toggle to settings page (future enhancement)
- [ ] Apply Deep Navy Blue as primary in both themes (future enhancement)
- [ ] Apply Golden Yellow accents consistently across both themes (future enhancement)
- [ ] Implement system preference detection (future enhancement)
- [ ] Add theme persistence in state (future enhancement)
- [ ] Test theme switching across all pages (future enhancement)
- [ ] Ensure Deep Navy Blue (#001f3f) and Golden Yellow (#FFD700) remain consistent in both modes (future enhancement)


## Home/Marketing Pages
- [ ] Design and implement homepage with Deep Navy Blue and Golden Yellow branding
- [ ] Add hero section with GSAP animations using navy blue background and golden yellow text
- [ ] Add about section with university information and UPSA colors
- [ ] Add features showcase section with Deep Navy Blue cards and Golden Yellow accents
- [ ] Add call-to-action section with Golden Yellow buttons on Navy Blue background
- [ ] Implement navigation links (Home, About, Login) in Deep Navy Blue
- [ ] Make homepage responsive
- [ ] Add GSAP animations to homepage elements
- [ ] Create 404 error page with brand colors
- [ ] Create 403 forbidden page with brand colors

## Student Features - Dashboard
- [x] Create student dashboard layout
- [x] Display student profile information
- [x] Show accommodation status
- [x] Display current room assignment (if allocated)
- [x] Show roommate details
- [x] Display payment status
- [x] Show payment due dates
- [x] Link to room booking/reservation
- [x] Display announcements
- [x] Show notifications feed
- [x] Create profile view page (read-only with N/A for missing data)

## Student Features - Room Reservation System
- [x] Design reservation workflow page
- [x] Create hostel selection component (recommended + alternative)
- [x] Create floor selection component (recommended + alternative)
- [x] Create room type selection component (recommended + alternative)
- [x] Implement reservation form with Formik and validation
- [x] Connect to backend API for reservation submission
- [x] Show reservation confirmation
- [x] Create reservations history page
- [x] Display allocation result after database processing
- [x] Show allocated room details

## Student Features - Room Booking System
- [x] Design booking workflow page
- [x] Create hostel selection component
- [x] Create floor selection component
- [x] Create room type selection component
- [x] Create room number selection component with real-time availability
- [x] Create bed number selection component (show availability)
- [x] Implement booking form with Formik and validation
- [x] Connect to backend API for booking submission
- [x] Show booking confirmation
- [x] Display real-time bed availability (occupied/available)
- [x] Show booking summary before submission
- [x] Implement booking success confirmation page with real-time availability using Supabase Realtime

## Student Features - Roommate Details
- [x] Create roommate details view
- [x] Display roommate information
- [x] Show roommate contact details
- [x] Display roommate profile information
- [x] Add roommate communication features (call, email, message)
- [x] Show roommate availability status
- [x] Display roommate academic information
- [x] Show roommate personal details and hobbies

## Student Features - Payment Management
- [x] Create payment overview component
- [x] Display payment status for each semester
- [x] Show payment due dates
- [x] Implement payment reminder notifications
- [x] Create payment history page
- [x] Display payment receipts (if available)
- [x] Show bed removal warning if payment overdue
- [x] Add payment filtering and search functionality
- [x] Display payment summary statistics
- [x] Add payment action buttons for pending/overdue payments
- [ ] Create payment reminder email template (Notify integration)

## Student Features - Announcements
- [x] Create announcements feed page
- [x] Display announcements by date (latest first)
- [x] Show announcement author/creator
- [x] Implement announcement filtering (by category/type)
- [x] Add search functionality for announcements
- [x] Create announcement detail page (click to view full content)
- [x] Implement pagination for announcements
- [x] Add notification for new announcements (unread indicator)
- [x] Display announcement priority levels
- [x] Show announcement categories with color coding

## Admin Features - Dashboard
- [x] Create admin dashboard with overview statistics
- [x] Display total students count
- [x] Display occupancy rate
- [x] Display pending payments count
- [x] Display pending room applications count
- [x] Show recent activities
- [x] Display recent students list
- [x] Add quick action buttons
- [x] Create admin profile page

## Admin Features - Account Management
- [x] Create porter account creation form
- [x] Create director account creation form
- [x] Auto-generate email addresses (name@upsamail.edu.gh)
- [x] Auto-generate secure passwords
- [x] Store generated credentials for user
- [x] Implement account creation validation
- [x] Create manage accounts page
- [x] Implement account deactivation/deletion
- [x] Create account list with filters
- [x] Show account creation date
- [x] Display account status
- [x] Add account lock/unlock functionality
- [x] Implement password reset functionality

## Admin Features - Student Management
- [x] Create view all students page
- [x] Implement student search functionality
- [x] Create student filters (hostel, floor, payment status, etc.)
- [x] Display student list in table format
- [x] Create student detail view
- [x] Show student accommodation history
- [x] Display student payment history
- [x] Implement student export functionality (CSV/PDF)
- [x] Add student statistics overview
- [x] Display student profile information
- [x] Add student edit functionality

## Admin Features - Room Management
- [x] Create hostels management page
- [x] Create add/edit/delete hostel functionality
- [x] Create floors management page
- [x] Create add/edit/delete floor functionality
- [x] Create rooms management page
- [x] Create add/edit/delete room functionality
- [x] Create room types management page
- [x] Create bed management page
- [x] Create add/edit/delete bed functionality
- [x] Show bed availability status
- [x] Implement bulk operations for rooms/beds
- [x] Create room layout visualization page

## Admin Features - Room Allocation & Booking Management
- [x] Create room reservations management page
- [x] Display pending reservations
- [x] Implement allocation algorithm based on preferences
- [x] Create allocation result confirmation
- [x] Create room bookings management page
- [x] Display all bookings with status
- [x] Create booking approval/rejection functionality
- [x] Implement automatic room assignment based on bookings
- [x] Add reservation statistics overview
- [x] Create allocation notes and special requests handling
- [x] Implement batch allocation functionality
- [ ] Show allocation history
- [ ] Implement allocation algorithm based on preferences
- [ ] Create allocation result confirmation
- [ ] Create room bookings management page
- [ ] Display all bookings with status
- [ ] Create booking approval/rejection functionality
- [ ] Implement automatic room assignment based on bookings
- [ ] Show allocation history

## Admin Features - Payment Management
- [x] Create payment records management page
- [x] View all payment records
- [x] Filter payments by student, semester, status
- [x] Manually add payment record
- [x] Create payment verification workflow
- [x] Generate payment reports
- [x] Show students with overdue payments
- [x] Create bed removal workflow (notify student, remove from room)
- [x] Implement automatic reminder system (scheduled)
- [x] Display payment receipts
- [x] Show revenue tracking and analytics
- [x] Add payment method tracking
- [x] Implement payment export functionality

## Admin Features - Porter Management
- [x] Create view all porters page
- [x] Display porter details
- [x] Show porter check-in/out history
- [x] View porter assigned floors/hostels
- [x] Create porter performance analytics
- [x] Add porter creation and editing functionality
- [x] Implement porter status management
- [x] Show porter duty tracking
- [x] Create porter assignment management
- [x] Display porter contact information

## Admin Features - Announcements
- [x] Create add announcement form (Formik + validation)
- [x] Implement announcement editor (rich text or markdown)
- [x] Create view announcements page
- [x] Implement edit announcement functionality
- [x] Implement delete announcement functionality
- [x] Create announcement schedule (future posting)
- [x] Implement announcement categories
- [x] Create announcement preview
- [x] Add announcement statistics overview
- [x] Implement announcement filtering and search
- [x] Add announcement publishing workflow
- [x] Create announcement target audience selection

## Admin Features - Settings & Configuration
- [x] Create admin settings page
- [x] Add system configuration options
- [x] Configure payment reminder settings
- [x] Configure email templates
- [x] Configure notification preferences
- [x] Add security settings management
- [x] Implement backup and restore functionality
- [x] Create email configuration settings
- [x] Add template editor for emails
- [x] Implement settings export/import

## Porter Features - Dashboard
- [x] Create porter dashboard
- [x] Display assigned hostel/floor
- [x] Show today's schedule
- [x] Display check-in/out status
- [x] Add student search functionality
- [x] Display recent activity
- [x] Show student statistics
- [x] Add quick action buttons
- [x] Display student list with status

## Porter Features - Check-In/Check-Out
- [x] Create check-in interface
- [x] Implement check-in form with time tracking
- [x] Create check-out interface
- [x] Implement check-out form with time tracking
- [x] Store check-in/out records in database
- [x] Display today's check-in/out history
- [x] Create check-in/out report page
- [x] Implement time tracking analytics
- [x] Add student search functionality
- [x] Display check-in/out statistics
- [x] Show active check-ins and check-outs
- [ ] Add notification for successful check-in/out

## Director Features - Dashboard
- [x] Create director dashboard
- [x] Display system overview statistics
- [x] Show key metrics and KPIs
- [x] Display D3.js analytics charts
- [x] Show recent activities log
- [x] Add period filtering (week/month/quarter/year)
- [x] Implement real-time data updates
- [x] Create responsive dashboard layout
- [x] Add interactive chart features

## Director Features - Reports & Analytics
- [x] Create occupancy report page
- [x] Create payment report page (by semester, hostel, student)
- [x] Create student demographics report
- [x] Create porter activities report
- [x] Create room allocation report
- [x] Implement report export (PDF, CSV, Excel)
- [x] Create custom report builder
- [x] Add date range filtering for reports
- [x] Add report scheduling functionality
- [x] Create report preview interface
- [ ] Create D3.js visualizations for all reports

## Notifications System
- [x] Set up Notify integration for email/SMS
- [x] Create email template for payment reminders
- [x] Create email template for payment overdue alerts
- [x] Create email template for room allocation results
- [x] Create email template for room booking confirmation
- [x] Create email template for announcements
- [x] Create email template for password reset
- [x] Create email template for account creation (admins, porters, directors)
- [x] Create in-app notification system
- [x] Implement notification preferences/settings
- [x] Create notification history page
- [x] Add notification permissions/opt-in/opt-out

## Real-Time Features (Supabase Realtime)
- [x] Set up Supabase Realtime subscriptions
- [x] Implement real-time bed availability updates
- [x] Implement real-time announcement notifications
- [x] Implement real-time payment status updates
- [x] Implement real-time room allocation updates
- [x] Add real-time notification delivery
- [x] Test WebSocket connections
- [x] Create real-time notification components
- [x] Add connection status indicators
- [x] Implement real-time event handling

## Data Fetching & APIs
- [x] Create API route for authentication (login, signup, logout)
- [x] Create API route for student profile management
- [x] Create API route for room availability
- [x] Create API route for room reservations
- [x] Create API route for room bookings
- [x] Create API route for payment processing
- [x] Create API route for announcements
- [x] Create API route for notifications
- [x] Create API route for hostels management
- [x] Create API route for rooms management
- [x] Create API route for porter check-in/check-out
- [x] Create API route for student management (admin)
- [x] Create API route for account creation (admin)
- [x] Create API route for analytics/reports
- [x] Implement error handling for all API routes
- [x] Implement request validation for all API routes
- [x] Add request logging/monitoring
- [x] Implement rate limiting for APIs

## State Management (Redux)
- [x] Create Redux store configuration
- [x] Create auth slice (user, token, role, login status)
- [x] Create user slice (profile, preferences)
- [x] Create rooms slice (hostels, floors, rooms, beds)
- [x] Create reservations slice (pending, history)
- [x] Create bookings slice (pending, history)
- [x] Create payments slice (payment records, status)
- [x] Create announcements slice (list, detail)
- [x] Create notifications slice (unread, history)
- [x] Create theme slice (dark/light mode)
- [x] Create loading/error slices
- [x] Create async thunks for API calls
- [x] Implement Redux middleware for logging
- [x] Add Redux persistence for certain slices

## Forms & Validation (Formik)
- [x] Create student signup form with validation (updated for 8-digit index, auto-email, DOB password)
- [x] Create student login form with validation (removed role selector)
- [x] Create student password reset form
- [x] Create admin login form with validation
- [x] Create porter/director login form with validation
- [x] Create account creation form (admin creating porter/director)
- [x] Create password change form (first login)
- [x] Update validation schemas for new student auth structure
- [x] Create custom Formik integration with MUI components
- [x] Create reservation form with multi-step validation
- [x] Create booking form with validation
- [x] Create announcement form with validation
- [ ] Create profile update form (admin, porter, director)
- [ ] Add custom validators (date format, email format, password strength)
- [ ] Implement form error messaging
- [ ] Add form success feedback

## Animations & Motion (GSAP)
- [x] Create smooth page transitions
- [x] Add hover animations to buttons
- [x] Add hover animations to cards
- [x] Animate loading skeletons
- [x] Create fade-in animations
- [x] Implement scroll-triggered animations
- [x] Add text animations (typewriter, fade, slide)
- [x] Create counter animations
- [x] Add progress bar animations
- [x] Implement stagger animations
- [x] Create reusable animation components
- [ ] Add entrance animations to page elements
- [ ] Create modal open/close animations
- [ ] Animate form submissions
- [ ] Add scroll animations
- [ ] Create chart animations (D3.js + GSAP)
- [ ] Add notification entrance/exit animations
- [ ] Create theme transition animation
- [ ] Add micro-interactions throughout the app

## Charts & Data Visualization (D3.js)
- [x] Create occupancy rate charts
- [x] Create payment trend charts
- [x] Create student demographics charts
- [x] Create room allocation charts
- [x] Add interactive chart features (hover, tooltips)
- [x] Implement chart animations (GSAP + D3.js)
- [x] Create responsive chart layouts
- [x] Add chart legends and labels
- [x] Implement chart color schemes
- [x] Create combined dashboard charts component wrapper
- [ ] Create porter check-in/out timeline chart
- [ ] Create room type distribution chart
- [ ] Create academic year distribution chart
- [ ] Create payment by semester chart
- [ ] Create custom chart component wrapper
- [ ] Implement responsive charts
- [ ] Add chart download/export functionality

## Responsive Design
- [x] Test all pages on mobile devices (375px and up)
- [x] Test all pages on tablet devices (768px and up)
- [x] Test all pages on desktop devices (1920px and up)
- [x] Implement mobile navigation menu
- [x] Optimize images for different screen sizes
- [x] Implement responsive tables
- [x] Test touch interactions on mobile
- [x] Ensure forms are mobile-friendly
- [x] Test all features on actual mobile devices
- [x] Implement responsive modals/dialogs
- [x] Create mobile-specific pages if needed
- [x] Create responsive grid layouts
- [x] Implement responsive typography
- [x] Add responsive breakpoints hooks

## Accessibility & Performance
- [x] Add alt text to all images
- [x] Ensure proper heading hierarchy
- [x] Test keyboard navigation
- [x] Add aria labels where needed
- [x] Implement focus states
- [x] Test color contrast ratios
- [x] Optimize bundle size
- [x] Implement code splitting
- [x] Add lazy loading for images
- [x] Optimize API calls (caching, debouncing)
- [x] Test Core Web Vitals
- [x] Implement service worker for offline support
- [x] Create accessible components
- [x] Add performance monitoring
- [x] Implement resource optimization
- [x] Add virtual scrolling for large lists

## Deployment (Netlify)
- [x] Create Netlify account
- [x] Connect Git repository to Netlify
- [x] Configure build settings for Next.js
- [x] Set up environment variables on Netlify
- [x] Configure Netlify functions if needed
- [x] Set up custom domain
- [x] Configure SSL certificate
- [x] Set up continuous deployment
- [x] Create staging environment
- [x] Test deployment process
- [x] Set up error monitoring
- [x] Configure analytics
- [x] Create deployment documentation

## Testing & QA
- [ ] Create test suite setup
- [ ] Write unit tests for utility functions
- [ ] Write integration tests for API routes
- [ ] Write component tests
- [ ] Test authentication flows for all roles
- [ ] Test room reservation flow
- [ ] Test room booking flow
- [ ] Test payment management
- [ ] Test announcement posting and notifications
- [ ] Test porter check-in/out
- [ ] Test dark/light mode switching
- [ ] Test real-time features
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Load testing
- [ ] Security testing (SQL injection, XSS, etc.)
- [ ] Test error handling and edge cases

## Documentation
- [x] Create API documentation
- [x] Create component documentation
- [x] Create deployment guide
- [x] Create user guides (student, admin, porter, director)
- [x] Create troubleshooting guide
- [x] Create database schema documentation
- [x] Create environment setup guide
- [x] Create contributing guidelines

## Security
- [x] Integrate **Zod** for strict runtime schema validation (API, Forms, Env Variables)
- [x] Implement output encoding
- [x] Set up CORS properly
- [x] Implement distributed rate limiting using **Upstash (Redis)** for Serverless API routes
- [x] Use HTTPS everywhere
- [x] Implement secure password hashing
- [x] Implement secure session management
- [x] Add CSRF protection
- [x] Implement password strength requirements
- [ ] Add two-factor authentication option (future enhancement)
- [x] Implement **DOMPurify** for sanitizing any rich-text/markdown content
- [x] Implement secure password reset flow
- [ ] Configure **SonarCloud** or **Snyk** for automated static analysis (SAST) in CI/CD
- [x] Implement Content Security Policy (CSP) headers
- [x] Configure HTTP Strict Transport Security (HSTS)
- [x] Set X-Content-Type-Options to 'nosniff'
- [x] Set X-Frame-Options to 'DENY' or 'SAMEORIGIN'
- [x] Verify protection against SQL Injection (ORM usage)
- [x] Implement **Cloudflare Turnstile** on Auth pages (Login, Signup) for bot protection
- [x] Enable Audit Logging for administrative actions
- [x] Perform dependency vulnerability scanning (npm audit)

## Build & Deployment Status
- [x] Fixed lint errors (unescaped apostrophes, import issues)
- [x] Fixed middleware createClient() function calls
- [x] Fixed API route type errors (announcements, notifications)
- [x] Fixed Badge component export issues
- [x] Fixed Table component import issues
- [ ] Fix TableColumn type interface conflicts
- [ ] Complete successful build
- [ ] Deploy to production

## Post-Launch Features
- [ ] Implement feedback system
- [ ] Create admin analytics dashboard improvements
- [ ] Add export functionality enhancements
- [ ] Create mobile app version
- [ ] Add SMS notifications option
- [ ] Implement advanced search features
- [ ] Add calendar/scheduling features
- [ ] Create hostel waitlist system
- [ ] Implement room transfer requests
- [ ] Add maintenance request system
- [ ] Implement complaint/issue reporting system

## Implementation Guidelines
- [ ] Always create .tsx, .css/.module.css, and .ts files when implementing features
- [ ] Ensure all necessary imports are included in created files
- [ ] Add navigation routes to connect new pages to the application
- [ ] Verify all created files are properly linked and accessible
- [ ] Test that navigation to new pages works correctly
- [ ] Ensure CSS modules are properly imported and styles are applied
- [ ] Check that all TypeScript interfaces and types are defined
- [ ] Validate that API routes are connected and functional
