import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  useDriverJob,
  useUpdateJobStatus,
  useAddCompletionDetails,
  useDisputeJob,
} from '@/hooks/useDriver'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: job, isLoading } = useDriverJob(id || '')
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [completionPictures, setCompletionPictures] = useState<string[]>([])
  const [disputeReason, setDisputeReason] = useState('')

  const updateStatusMutation = useUpdateJobStatus()
  const addCompletionMutation = useAddCompletionDetails()
  const disputeMutation = useDisputeJob()

  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return
    await updateStatusMutation.mutateAsync({ id, status: newStatus })
    setIsStatusDialogOpen(false)
    setNewStatus('')
  }

  const handleComplete = async () => {
    if (!id) return
    await addCompletionMutation.mutateAsync({
      id,
      data: {
        notes: completionNotes,
        pictures: completionPictures,
      },
    })
    setIsCompleteDialogOpen(false)
    setCompletionNotes('')
    setCompletionPictures([])
  }

  const handleDispute = async () => {
    if (!id || !disputeReason) return
    await disputeMutation.mutateAsync({ id, reason: disputeReason })
    setIsDisputeDialogOpen(false)
    setDisputeReason('')
  }

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

  if (isLoading) {
    return (
      <DashboardLayout role="driver">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout role="driver">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => navigate('/driver/jobs')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const canUpdateStatus = ['confirmed', 'in-progress'].includes(job.status)
  const canComplete = job.status === 'in-progress'
  const canDispute = ['confirmed', 'in-progress', 'completed'].includes(job.status) && !job.isDisputed

  return (
    <DashboardLayout role="driver">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Details</h2>
            <p className="text-muted-foreground">Order #{job.orderCode || job._id}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(job.status)} className="text-lg px-4 py-2">
            {job.status}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Name:</strong> {typeof job.customer === 'object' ? job.customer.name : 'Unknown'}
              </p>
              <p>
                <strong>Email:</strong> {typeof job.customer === 'object' ? job.customer.email : job.contactEmail}
              </p>
              <p>
                <strong>Phone:</strong> {job.contactPhone}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span><strong>Date:</strong> {new Date(job.pickupDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span><strong>Time:</strong> {job.pickupTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span><strong>Price:</strong> £{job.finalPrice || job.estimatedPrice}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pickup Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p>{job.pickupAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.pickupCity} {job.pickupZipCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p>{job.deliveryAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.deliveryCity} {job.deliveryZipCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {job.completionPictures && job.completionPictures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completion Pictures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {job.completionPictures.map((pic: string, index: number) => (
                  <img
                    key={index}
                    src={pic}
                    alt={`Completion ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {job.driverNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{job.driverNotes}</p>
            </CardContent>
          </Card>
        )}

        {job.isDisputed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Disputed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Reason:</strong> {job.disputeReason}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Status: {job.disputeResolved ? 'Resolved' : 'Pending Resolution'}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {canUpdateStatus && (
              <Button onClick={() => setIsStatusDialogOpen(true)}>
                Update Status
              </Button>
            )}
            {canComplete && (
              <Button variant="outline" onClick={() => setIsCompleteDialogOpen(true)}>
                Complete Job
              </Button>
            )}
            {canDispute && (
              <Button variant="destructive" onClick={() => setIsDisputeDialogOpen(true)}>
                Dispute Job
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Job Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={!newStatus || updateStatusMutation.isLoading}>
                {updateStatusMutation.isLoading ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete Job Dialog */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Job</DialogTitle>
              <DialogDescription>Add completion details and notes</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about the job completion..."
                />
              </div>
              <div>
                <Label>Pictures (URLs, comma-separated)</Label>
                <Input
                  value={completionPictures.join(', ')}
                  onChange={(e) => setCompletionPictures(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For now, paste image URLs. File upload will be added later.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete} disabled={addCompletionMutation.isLoading}>
                {addCompletionMutation.isLoading ? 'Completing...' : 'Complete Job'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispute Dialog */}
        <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dispute Job</DialogTitle>
              <DialogDescription>Provide a reason for disputing this job</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain why you are disputing this job..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDisputeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDispute}
                disabled={!disputeReason || disputeMutation.isLoading}
              >
                {disputeMutation.isLoading ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default JobDetailsPage

