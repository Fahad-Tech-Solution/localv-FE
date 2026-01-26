import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, Edit, Truck, Mail, AlertCircle } from 'lucide-react'
import { useAdminBookings, useUpdateBookingAdmin, useAssignDriver, useAdminDrivers, useHandleDispute, useSendEmailReminder } from '@/hooks/useAdmin'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BookingsPage = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingBooking, setEditingBooking] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [bookingToAssign, setBookingToAssign] = useState<string | null>(null)

  const { data, isLoading } = useAdminBookings({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const { data: driversData } = useAdminDrivers({ limit: 100 })
  const updateBookingMutation = useUpdateBookingAdmin()
  const assignDriverMutation = useAssignDriver()
  const handleDisputeMutation = useHandleDispute()
  const sendReminderMutation = useSendEmailReminder()
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false)
  const [bookingToDispute, setBookingToDispute] = useState<any>(null)

  const handleEdit = (booking: any) => {
    setEditingBooking(booking)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingBooking) return
    await updateBookingMutation.mutateAsync({
      id: editingBooking._id,
      data: {
        status: editingBooking.status,
        finalPrice: editingBooking.finalPrice,
      },
    })
    setIsEditDialogOpen(false)
    setEditingBooking(null)
  }

  const handleAssignDriver = async (driverId: string) => {
    if (!bookingToAssign) return
    await assignDriverMutation.mutateAsync({
      bookingId: bookingToAssign,
      driverId,
    })
    setIsAssignDialogOpen(false)
    setBookingToAssign(null)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'confirmed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Booking Management</h2>
          <p className="text-muted-foreground">Manage all bookings and assign drivers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>Search and filter bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by address or order code..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {data?.bookings?.map((booking: any) => (
                    <div
                      key={booking._id}
                      className="p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">
                              {typeof booking.customer === 'object' ? booking.customer.name : 'Unknown Customer'}
                            </h3>
                            <Badge variant={getStatusBadgeVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                            {booking.orderCode && (
                              <Badge variant="outline">#{booking.orderCode}</Badge>
                            )}
                            {booking.isDisputed && (
                              <Badge variant="destructive">Disputed</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Pickup:</strong> {booking.pickupAddress}, {booking.pickupCity}</p>
                              <p><strong>Delivery:</strong> {booking.deliveryAddress}, {booking.deliveryCity}</p>
                            </div>
                            <div>
                              <p><strong>Date:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</p>
                              <p><strong>Price:</strong> £{booking.finalPrice || booking.estimatedPrice}</p>
                              {typeof booking.driver === 'object' && booking.driver && (
                                <p><strong>Driver:</strong> {booking.driver.name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!booking.driver && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBookingToAssign(booking._id)
                                setIsAssignDialogOpen(true)
                              }}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Assign Driver
                            </Button>
                          )}
                          {booking.isDisputed && !booking.disputeResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBookingToDispute(booking)
                                setIsDisputeDialogOpen(true)
                              }}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Handle Dispute
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              sendReminderMutation.mutate({ id: booking._id, type: 'customer' })
                            }}
                            disabled={sendReminderMutation.isLoading}
                            title="Send email reminder to customer"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {booking.driver && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                sendReminderMutation.mutate({ id: booking._id, type: 'driver' })
                              }}
                              disabled={sendReminderMutation.isLoading}
                              title="Send email reminder to driver"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(booking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {data?.pagination && data.pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {data.pagination.page} of {data.pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                        disabled={page === data.pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>Update booking status and details</DialogDescription>
            </DialogHeader>
            {editingBooking && (
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingBooking.status}
                    onValueChange={(value) => setEditingBooking({ ...editingBooking, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Final Price</Label>
                  <Input
                    type="number"
                    value={editingBooking.finalPrice || editingBooking.estimatedPrice}
                    onChange={(e) => setEditingBooking({ ...editingBooking, finalPrice: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateBookingMutation.isLoading}>
                {updateBookingMutation.isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Driver Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Driver</DialogTitle>
              <DialogDescription>Select a driver for this booking</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Driver</Label>
                <Select onValueChange={handleAssignDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {driversData?.drivers?.map((driver: any) => (
                      <SelectItem key={driver._id} value={driver._id}>
                        {driver.name} ({driver.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Handle Dispute Dialog */}
        <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Handle Dispute</DialogTitle>
              <DialogDescription>
                {bookingToDispute && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Dispute Reason:</p>
                    <p className="text-sm text-muted-foreground">{bookingToDispute.disputeReason}</p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Resolution Status</Label>
                <Select
                  onValueChange={(value) => {
                    if (bookingToDispute) {
                      handleDisputeMutation.mutate({
                        id: bookingToDispute._id,
                        data: {
                          resolved: value === 'resolved',
                          status: value === 'resolved' ? 'completed' : undefined,
                        },
                      })
                      setIsDisputeDialogOpen(false)
                      setBookingToDispute(null)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolved">Mark as Resolved</SelectItem>
                    <SelectItem value="pending">Keep as Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDisputeDialogOpen(false)
                setBookingToDispute(null)
              }}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default BookingsPage

