'use client'

import { useState } from 'react'
import { Formik, Form, FormikProps } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormikField, FormikCheckbox, FormikRadioGroup, FormikMultiStep } from './FormikField'
import { Users, Bed, Calendar, DollarSign, CheckCircle, AlertCircle, Home, Clock } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import styles from './ReservationForm.module.css'

interface ReservationFormData {
  // Step 1: Personal Information
  firstName: string
  lastName: string
  indexNumber: string
  email: string
  phone: string
  programOfStudy: string
  level: string
  
  // Step 2: Accommodation Preferences
  preferredHostel: string
  preferredFloor: string
  preferredRoomType: string
  hasDisability: boolean
  disabilityDetails?: string
  specialRequests?: string
  
  // Step 3: Documents
  studentIdCard: File | null
  admissionLetter: File | null
  paymentProof: File | null
  
  // Step 4: Terms & Confirmation
  acceptTerms: boolean
  acceptPrivacy: boolean
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
}

interface ReservationFormProps {
  onSubmit: (values: ReservationFormData) => void
  loading?: boolean
}

const reservationSchema = Yup.object().shape({
  // Step 1 validation
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  
  indexNumber: Yup.string()
    .required('Index number is required')
    .matches(/^\d{8}$/, 'Index number must be exactly 8 digits'),
  
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
  
  programOfStudy: Yup.string()
    .required('Program of study is required'),
  
  level: Yup.string()
    .required('Academic level is required'),
  
  // Step 2 validation
  preferredHostel: Yup.string()
    .required('Preferred hostel is required'),
  
  preferredFloor: Yup.string()
    .required('Preferred floor is required'),
  
  preferredRoomType: Yup.string()
    .required('Room type preference is required'),
  
  hasDisability: Yup.boolean(),
  disabilityDetails: Yup.string()
    .when('hasDisability', {
      is: true,
      then: (schema) => schema.required('Disability details are required when disability is indicated'),
      otherwise: (schema) => schema
    }),
  
  // Step 3 validation
  studentIdCard: Yup.mixed()
    .required('Student ID card is required')
    .test('fileType', 'Invalid file type', (value) => {
      if (!value) return false
      return ['image/jpeg', 'image/png', 'application/pdf'].includes((value as File).type)
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return false
      return (value as File).size <= 5 * 1024 * 1024
    }),
  
  admissionLetter: Yup.mixed()
    .required('Admission letter is required')
    .test('fileType', 'Invalid file type', (value) => {
      if (!value) return false
      return ['image/jpeg', 'image/png', 'application/pdf'].includes((value as File).type)
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return false
      return (value as File).size <= 5 * 1024 * 1024
    }),
  
  paymentProof: Yup.mixed()
    .required('Payment proof is required')
    .test('fileType', 'Invalid file type', (value) => {
      if (!value) return false
      return ['image/jpeg', 'image/png', 'application/pdf'].includes((value as File).type)
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return false
      return (value as File).size <= 5 * 1024 * 1024
    }),
  
  // Step 4 validation
  acceptTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
  
  acceptPrivacy: Yup.boolean()
    .oneOf([true], 'You must accept the privacy policy'),
  
  emergencyContact: Yup.object().shape({
    name: Yup.string().required('Emergency contact name is required'),
    relationship: Yup.string().required('Relationship is required'),
    phone: Yup.string()
      .required('Emergency contact phone is required')
      .matches(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
  })
})

const initialValues: ReservationFormData = {
  firstName: '',
  lastName: '',
  indexNumber: '',
  email: '',
  phone: '',
  programOfStudy: '',
  level: '',
  preferredHostel: '',
  preferredFloor: '',
  preferredRoomType: '',
  hasDisability: false,
  disabilityDetails: '',
  specialRequests: '',
  studentIdCard: null,
  admissionLetter: null,
  paymentProof: null,
  acceptTerms: false,
  acceptPrivacy: false,
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  }
}

export function ReservationForm({ onSubmit, loading = false }: ReservationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  
  const { user } = useSelector((state: RootState) => state.auth)
  
  const hostels = [
    { value: 'hostel_a', label: 'Hostel A' },
    { value: 'hostel_b', label: 'Hostel B' },
    { value: 'hostel_c', label: 'Hostel C' }
  ]
  
  const floors = ['1', '2', '3', '4']
  
  const roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'triple', label: 'Triple Room' }
  ]
  
  const programs = [
    'B.Sc. Computer Science',
    'B.Sc. Information Technology',
    'B.Sc. Business Administration',
    'B.Sc. Accounting',
    'B.Sc. Marketing',
    'B.Sc. Human Resource Management'
  ]
  
  const levels = ['100', '200', '300', '400']
  
  const relationships = [
    'Parent',
    'Guardian',
    'Sibling',
    'Spouse',
    'Other'
  ]

  const handleSubmit = (values: ReservationFormData) => {
    onSubmit(values)
  }

  const validateStep = (step: number, values: ReservationFormData) => {
    try {
      const stepFields = {
        0: ['firstName', 'lastName', 'indexNumber', 'email', 'phone', 'programOfStudy', 'level'],
        1: ['preferredHostel', 'preferredFloor', 'preferredRoomType', 'hasDisability'],
        2: ['studentIdCard', 'admissionLetter', 'paymentProof'],
        3: ['acceptTerms', 'acceptPrivacy', 'emergencyContact']
      }
      
      const stepSchema = Yup.object().shape(
        Object.fromEntries(
          stepFields[step as keyof typeof stepFields].map(field => [field, reservationSchema.fields[field as keyof typeof reservationSchema.fields]])
        )
      )
      
      stepSchema.validateSync(values)
      return {}
    } catch (error) {
      return error as Yup.ValidationError
    }
  }

  const StepIndicator = ({ step, title, icon, completed }: { step: number; title: string; icon: React.ReactNode; completed: boolean }) => (
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {icon}
      </div>
      <div>
        <h3 className={`font-medium ${completed ? 'text-green-600' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {completed ? 'Completed' : 'In progress'}
        </p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Room Reservation Application
          </h1>
          <p className="text-gray-600">
            Complete the form below to apply for hostel accommodation. All fields marked with * are required.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={reservationSchema}
          onSubmit={handleSubmit}
          validate={(values) => validateStep(currentStep, values)}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form className="space-y-8">
              <FormikMultiStep
                currentStep={currentStep}
                totalSteps={4}
                onStepChange={setCurrentStep}
              >
                {/* Step 1: Personal Information */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormikField
                        name="firstName"
                        label="First Name"
                        placeholder="Enter your first name"
                        required
                      />
                      <FormikField
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter your last name"
                        required
                      />
                      <FormikField
                        name="indexNumber"
                        label="Index Number"
                        placeholder="Enter 8-digit index number"
                        required
                      />
                      <FormikField
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email address"
                        required
                      />
                      <FormikField
                        name="phone"
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter your phone number"
                        required
                      />
                      <FormikField
                        name="programOfStudy"
                        label="Program of Study"
                        type="select"
                        options={programs.map(program => ({ value: program, label: program }))}
                        required
                      />
                      <FormikField
                        name="level"
                        label="Academic Level"
                        type="select"
                        options={levels.map(level => ({ value: level, label: `Level ${level}` }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Accommodation Preferences */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Accommodation Preferences
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormikField
                        name="preferredHostel"
                        label="Preferred Hostel"
                        type="select"
                        options={hostels}
                        required
                      />
                      <FormikField
                        name="preferredFloor"
                        label="Preferred Floor"
                        type="select"
                        options={floors.map(floor => ({ value: floor, label: `Floor ${floor}` }))}
                        required
                      />
                      <FormikField
                        name="preferredRoomType"
                        label="Room Type Preference"
                        type="select"
                        options={roomTypes}
                        required
                      />
                      <div>
                        <FormikCheckbox
                          name="hasDisability"
                          label="Do you have any disability or special needs?"
                        />
                        {values.hasDisability && (
                          <FormikField
                            name="disabilityDetails"
                            label="Please provide details"
                            type="textarea"
                            helperText="This information helps us provide appropriate accommodation"
                            required
                          />
                        )}
                      </div>
                      <FormikField
                        name="specialRequests"
                        label="Special Requests (Optional)"
                        type="textarea"
                        helperText="Any additional preferences or requirements"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Documents */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Required Documents
                    </h2>
                    <div className="space-y-6">
                      <FormikField
                        name="studentIdCard"
                        label="Student ID Card"
                        type="file"
                        accept="image/*,.pdf"
                        helperText="Upload a clear photo of your student ID card (Max: 5MB)"
                        required
                      />
                      <FormikField
                        name="admissionLetter"
                        label="Admission Letter"
                        type="file"
                        accept="image/*,.pdf"
                        helperText="Upload your admission letter (Max: 5MB)"
                        required
                      />
                      <FormikField
                        name="paymentProof"
                        label="Payment Proof"
                        type="file"
                        accept="image/*,.pdf"
                        helperText="Upload proof of payment or financial clearance (Max: 5MB)"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4: Terms & Emergency Contact */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Terms & Emergency Contact
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormikField
                            name="emergencyContact.name"
                            label="Contact Name"
                            placeholder="Enter emergency contact name"
                            required
                          />
                          <FormikField
                            name="emergencyContact.relationship"
                            label="Relationship"
                            type="select"
                            options={relationships.map(rel => ({ value: rel, label: rel }))}
                            required
                          />
                          <FormikField
                            name="emergencyContact.phone"
                            label="Contact Phone"
                            type="tel"
                            placeholder="Enter emergency contact phone"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                        <div className="space-y-4">
                          <FormikCheckbox
                            name="acceptTerms"
                            label="I accept the terms and conditions of the hostel accommodation"
                            required
                          />
                          <FormikCheckbox
                            name="acceptPrivacy"
                            label="I accept the privacy policy and data handling terms"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FormikMultiStep>

              {/* Preview Section */}
              {showPreview && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Application Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Personal Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {values.firstName} {values.lastName}</p>
                        <p><strong>Index:</strong> {formatIndexNumber(values.indexNumber)}</p>
                        <p><strong>Email:</strong> {values.email}</p>
                        <p><strong>Phone:</strong> {values.phone}</p>
                        <p><strong>Program:</strong> {values.programOfStudy}</p>
                        <p><strong>Level:</strong> {values.level}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Accommodation Preferences</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Hostel:</strong> {values.preferredHostel}</p>
                        <p><strong>Floor:</strong> {values.preferredFloor}</p>
                        <p><strong>Room Type:</strong> {values.preferredRoomType}</p>
                        <p><strong>Disability:</strong> {values.hasDisability ? 'Yes' : 'No'}</p>
                        {values.hasDisability && (
                          <p><strong>Details:</strong> {values.disabilityDetails}</p>
                        )}
                        {values.specialRequests && (
                          <p><strong>Special Requests:</strong> {values.specialRequests}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8">
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    isLoading={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  )
}
