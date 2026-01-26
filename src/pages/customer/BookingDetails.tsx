import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBooking, useCancelBooking } from '@/hooks/useBookings'
import { MapPin, Calendar, Truck, Phone, Mail, FileText, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const vehicleLabels = {
  'small-van': 'Small Van',
  'medium-van': 'Medium Van',
  'large-van': 'Large Van',
  'truck': 'Truck',
}

const serviceTypeLabels = {
  local: 'Local',
  'long-distance': 'Long Distance',
  interstate: 'Interstate',
}

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, error } = useBooking(id || '')
  const cancelBooking = useCancelBooking()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const handleCancel = async () => {
    if (!id) return
    try {
      await cancelBooking.mutateAsync(id)
      setCancelDialogOpen(false)
      navigate('/customer/bookings')
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !booking) {
    return (
      <DashboardLayout role="customer">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive">Booking not found</p>
          <Button asChild className="mt-4">
            <Link to="/customer/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <DashboardLayout role="customer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Booking #{booking._id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-muted-foreground">
              View details and manage your booking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/customer/bookings">Back to Bookings</Link>
            </Button>
            {canCancel && (
              <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Cancel Booking</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Booking</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                      No, Keep Booking
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={cancelBooking.isLoading}
                    >
                      {cancelBooking.isLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={`mt-2 ${statusColors[booking.status]}`}>
                  {statusLabels[booking.status]}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pickup Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pickup Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{booking.pickupAddress}</p>
              <p className="text-muted-foreground">
                {booking.pickupCity}, {booking.pickupState} {booking.pickupZipCode}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{booking.deliveryAddress}</p>
              <p className="text-muted-foreground">
                {booking.deliveryCity}, {booking.deliveryState} {booking.deliveryZipCode}
              </p>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-medium">{serviceTypeLabels[booking.serviceType]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="font-medium">{vehicleLabels[booking.vehicleType]}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.contactEmail}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">Estimated Price</p>
                <p className="text-2xl font-bold">£{booking.estimatedPrice.toFixed(2)}</p>
                {booking.finalPrice && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Final Price</p>
                    <p className="text-xl font-semibold">£{booking.finalPrice.toFixed(2)}</p>
                  </>
                )}
                <Badge className="mt-2">{booking.paymentStatus}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Items to Move
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booking.items.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <Badge variant="outline">Qty: {item.quantity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{booking.specialInstructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Driver Information */}
        {booking.driver && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Driver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{booking.driver.name}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {booking.driver.email}
                  </span>
                  {booking.driver.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {booking.driver.phone}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default BookingDetails

