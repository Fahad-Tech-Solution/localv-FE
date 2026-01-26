import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Loader2, MapPin, Calendar } from 'lucide-react'
import { useDriverJobs } from '@/hooks/useDriver'
import { Link } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DriverJobsPage = () => {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading } = useDriverJobs({
    page,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'confirmed':
        return 'outline'
      case 'disputed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <DashboardLayout role="driver">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Jobs</h2>
          <p className="text-muted-foreground">View and manage your assigned jobs</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Jobs</CardTitle>
                <CardDescription>Filter by status</CardDescription>
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
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {data?.bookings && data.bookings.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {data.bookings.map((booking: any) => (
                        <Link key={booking._id} to={`/driver/jobs/${booking._id}`}>
                          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
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
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {booking.pickupCity} → {booking.deliveryCity}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(booking.pickupDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                  <span className="font-medium">
                                    £{booking.finalPrice || booking.estimatedPrice}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
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
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No jobs found. Check back later!</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DriverJobsPage

