/**
 * Mock School API Service
 * 
 * In a real environment, this service would connect to the UPSA school database
 * or an API provided by the school to verify if an index number is valid
 * and to fetch student details.
 * 
 * For development/production without the real DB, this mock service validates
 * the format and auto-approves.
 */

export const isValidIndexNumberFormat = (identifier: string): boolean => {
  // Matches exact 8 digits, with optional UPSA prefix (case insensitive)
  const regex = /^(upsa)?\d{8}$/i;
  return regex.test(identifier);
};

export const isValidDobFormat = (dob: string): boolean => {
  // Students enter their DOB as DD-MM-YYYY (e.g. 15-09-2002)
  const regex = /^\d{2}-\d{2}-\d{4}$/
  if (!regex.test(dob)) return false

  const [dd, mm, yyyy] = dob.split('-').map(Number)
  if (yyyy < 1950 || yyyy > new Date().getFullYear()) return false
  if (mm < 1 || mm > 12) return false
  if (dd < 1 || dd > 31) return false

  return true
}

export const mockFetchStudentDetails = async (indexNumber: string, dob: string) => {
  if (!isValidIndexNumberFormat(indexNumber)) {
    throw new Error('Invalid index number format.')
  }

  if (!isValidDobFormat(dob)) {
    throw new Error('Incorrect index number or date of birth.')
  }

  const cleanIndex = indexNumber.toUpperCase().startsWith('UPSA')
    ? indexNumber.substring(4)
    : indexNumber

  // Convert DD-MM-YYYY → YYYY-MM-DD for Postgres DATE column
  const [dd, mm, yyyy] = dob.split('-')
  const dobIso = `${yyyy}-${mm}-${dd}`

  return {
    indexNumber: cleanIndex,
    email: `${cleanIndex}@upsamail.edu.gh`,
    firstName: 'Student',
    lastName: cleanIndex,
    programOfStudy: 'BSc Computer Science',
    level: '100',
    dateOfBirth: dobIso,
  }
}
