'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSelector, useDispatch } from 'react-redux'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import Badge from '@/components/ui/badge'
import { RootState } from '@/store'
import { 
  fetchAvailableHostels, 
  fetchAvailableRooms, 
  submitReservation,
  setSelectedPreferences 
} from '@/store/slices/bookingSlice'
import styles from './BookingForm.module.css'
import { ReservationPreferences } from '@/types'

const BookingForm = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const router = useRouter()
  const dispatch = useDispatch()
  const { 
    availableHostels, 
    availableRooms, 
    selectedPreferences,
    loading, 
    error 
  } = useSelector((state: RootState) => state.booking) as any

  useEffect(() => {
    dispatch(fetchAvailableHostels() as any)
  }, [dispatch])

  const validationSchema = Yup.object({
    hostelId: Yup.string().required('Please select a hostel'),
    roomType: Yup.string().oneOf(['single', 'double', 'triple', 'quadruple']).required('Please select room type'),
    floorPreference: Yup.number().optional(),
    roommatePreferences: Yup.array().of(Yup.string()).optional(),
    specialRequests: Yup.string().optional(),
  })

  const formik = useFormik<ReservationPreferences>({
    initialValues: {
      hostelId: '',
      roomType: 'single',
      floorPreference: undefined,
      roommatePreferences: [],
      specialRequests: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(submitReservation(values) as any).unwrap()
        setStep(3)
      } catch (err) {
        // Error is handled in the slice
      }
    },
  })

  const handleHostelChange = (hostelId: string) => {
    formik.setFieldValue('hostelId', hostelId)
    if (hostelId) {
      dispatch(fetchAvailableRooms(hostelId) as any)
    }
  }

  const renderStep1 = () => (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-primary mb-2">Select Hostel</h2>
          <p className="text-gray-600">Choose your preferred hostel for accommodation</p>
        </div>

        <div className="space-y-4">
          {availableHostels.map((hostel: any) => (
            <div
              key={hostel.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                formik.values.hostelId === hostel.id
                  ? 'border-goldenYellow bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleHostelChange(hostel.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{hostel.name}</h3>
                  <p className="text-gray-600 text-sm">{hostel.address}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {hostel.totalRooms} Rooms
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {hostel.totalBeds} Beds
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      {hostel.gender}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="hostelId"
                    value={hostel.id}
                    checked={formik.values.hostelId === hostel.id}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-goldenYellow focus:ring-goldenYellow border-gray-300"
                  />
                </div>
              </div>
            </div>
          ))}

          {formik.errors.hostelId && formik.touched.hostelId && (
            <div className="text-red-600 text-sm">{formik.errors.hostelId}</div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setStep(2)}
            disabled={!formik.values.hostelId}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  )

  const renderStep2 = () => (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-primary mb-2">Room Preferences</h2>
          <p className="text-gray-600">Specify your room type and preferences</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <Select
              id="roomType"
              name="roomType"
              value={formik.values.roomType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.roomType ? formik.errors.roomType || undefined : undefined}
              options={[
                { value: "single", label: "Single Room" },
                { value: "double", label: "Double Room" },
                { value: "triple", label: "Triple Room" },
                { value: "quadruple", label: "Quadruple Room" }
              ]}
            />
          </div>

          <div>
            <label htmlFor="floorPreference" className="block text-sm font-medium text-gray-700 mb-2">
              Floor Preference (Optional)
            </label>
            <Select
              id="floorPreference"
              name="floorPreference"
              value={formik.values.floorPreference || ''}
              onChange={(e: any) => formik.setFieldValue('floorPreference', e.target.value ? parseInt(e.target.value) : undefined)}
              onBlur={formik.handleBlur}
              options={[
                { value: "", label: "No preference" },
                { value: "1", label: "Floor 1" },
                { value: "2", label: "Floor 2" },
                { value: "3", label: "Floor 3" },
                { value: "4", label: "Floor 4" },
                { value: "5", label: "Floor 5" }
              ]}
            />
          </div>

          <div>
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-goldenYellow focus:border-transparent"
              placeholder="Any special requirements or preferences..."
              value={formik.values.specialRequests}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Reservation'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )

  const renderStep3 = () => (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Reservation Submitted!
        </h3>
        <p className="text-gray-600 mb-6">
          Your accommodation reservation has been submitted successfully. You will be notified once it&apos;s processed.
        </p>
        <Button onClick={() => router.push('/student/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  )
}

export default BookingForm
