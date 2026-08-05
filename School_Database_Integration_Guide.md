# UPSA HMS: School Database Integration Guide

When the time comes to connect the Hostel Management System (HMS) to the official UPSA school database, the recommended method is the **API Proxy Approach**. This ensures data is always real-time and prevents the need to duplicate thousands of student records into the HMS database.

## Approach 1: The API Proxy (Real-Time Fetch)

Instead of maintaining a copy of the students in the Supabase database, the backend queries the school's official database or API in real-time when a student logs in or views their profile.

### How it works:
1. **Authentication (`auth.ts`)**: When a student logs in, the HMS verifies their credentials against the school's official system. If successful, it issues an HMS session token.
2. **Profile Fetch (`profile.ts`)**: When the frontend requests the student's profile, the HMS backend makes an API call to the school's system (e.g., `axios.get('https://api.upsa.edu.gh/students/10288633')`) to fetch the official, up-to-date details (Program, Level, Phone, etc.).
3. **Data Merge**: The HMS backend then queries Supabase for the student's *hostel-specific* data (active bookings, payments, room allocation) and merges it with the official school data before sending the combined JSON response to the frontend.

### Files to Update for Approach 1:
- `apps/backend/src/routes/auth.ts` (To route login attempts to the school API)
- `apps/backend/src/routes/profile.ts` (To fetch official student data from the school API)

---

## The Most Important File to Update (Frontend Mapping)

The school's database will almost certainly name its columns differently than the HMS does. For example, they might use `Std_Phone` instead of `phone`, or `Current_Yr` instead of `level`.

To ensure the data displays correctly on the frontend without needing to rewrite any UI components, you only need to update **one** file to map the school's fields to the HMS fields.

**File:** `apps/frontend/src/store/slices/authSlice.ts`

Inside the `normalizeUser` function in this file, you simply add the school's exact column names to the fallback chains:

```typescript
const normalizeUser = (data: any): User => {
  if (!data) return data
  
  const normalized = {
    ...data,
    // Add the school's column name (e.g., data.Std_Phone) to the chain
    phoneNumber: data.Std_Phone || data.phoneNumber || data.phone_number || data.phone || data.users?.phone || '',
    
    // Add the school's column name (e.g., data.Current_Yr) to the chain
    yearOfStudy: data.Current_Yr !== undefined ? data.Current_Yr : (data.yearOfStudy !== undefined ? data.yearOfStudy : (data.year_of_study !== undefined ? data.year_of_study : (data.level !== undefined ? data.level : null))),
    
    // Add the school's column name (e.g., data.Course_Name) to the chain
    programOfStudy: data.Course_Name || data.programOfStudy || data.program || data.programme || data.program_of_study || '',
    
    // ... rest of the normalization
  }
  
  // ...
}
```

By mapping the data correctly in that single Redux slice, the entire frontend (Profile Page, Dashboard, Payment Receipts) will automatically display the correct information exactly where it is supposed to be!
