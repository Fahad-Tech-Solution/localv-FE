import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Truck, CheckCircle } from 'lucide-react'
import { useDriverVehicle, useUpdateVehicle } from '@/hooks/useDriver'

const VehiclePage = () => {
  const { data: vehicle, isLoading } = useDriverVehicle()
  const updateVehicleMutation = useUpdateVehicle()
  const [formData, setFormData] = useState({
    drivingLicence: '',
    goodsInTransitInsurance: '',
    publicLiability: '',
    proofOfAddress: '',
  })
  const [isEditing, setIsEditing] = useState(false)

  // Initialize form data when vehicle data loads
  useEffect(() => {
    if (vehicle) {
      setFormData({
        drivingLicence: vehicle.drivingLicence || '',
        goodsInTransitInsurance: vehicle.goodsInTransitInsurance || '',
        publicLiability: vehicle.publicLiability || '',
        proofOfAddress: vehicle.proofOfAddress || '',
      })
    }
  }, [vehicle])

  const handleSave = async () => {
    await updateVehicleMutation.mutateAsync(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (vehicle) {
      setFormData({
        drivingLicence: vehicle.drivingLicence || '',
        goodsInTransitInsurance: vehicle.goodsInTransitInsurance || '',
        publicLiability: vehicle.publicLiability || '',
        proofOfAddress: vehicle.proofOfAddress || '',
      })
    }
    setIsEditing(false)
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

  const hasAllInfo =
    formData.drivingLicence &&
    formData.goodsInTransitInsurance &&
    formData.publicLiability &&
    formData.proofOfAddress

  return (
    <DashboardLayout role="driver">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vehicle Information</h2>
            <p className="text-muted-foreground">
              Manage your driving licence and insurance documents
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              {hasAllInfo ? 'Edit' : 'Add Information'}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              UK Driver Requirements
            </CardTitle>
            <CardDescription>
              Please provide all required documents to be eligible for jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="drivingLicence">Driving Licence</Label>
                  <Input
                    id="drivingLicence"
                    value={formData.drivingLicence}
                    onChange={(e) => setFormData({ ...formData, drivingLicence: e.target.value })}
                    placeholder="Enter driving licence number or upload document URL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter licence number or paste document URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="goodsInTransitInsurance">Goods in Transit Insurance</Label>
                  <Input
                    id="goodsInTransitInsurance"
                    value={formData.goodsInTransitInsurance}
                    onChange={(e) =>
                      setFormData({ ...formData, goodsInTransitInsurance: e.target.value })
                    }
                    placeholder="Enter insurance policy number or upload document URL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter policy number or paste document URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="publicLiability">Public Liability Insurance</Label>
                  <Input
                    id="publicLiability"
                    value={formData.publicLiability}
                    onChange={(e) => setFormData({ ...formData, publicLiability: e.target.value })}
                    placeholder="Enter insurance policy number or upload document URL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter policy number or paste document URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="proofOfAddress">Proof of Address</Label>
                  <Input
                    id="proofOfAddress"
                    value={formData.proofOfAddress}
                    onChange={(e) => setFormData({ ...formData, proofOfAddress: e.target.value })}
                    placeholder="Enter document reference or upload document URL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter document reference or paste document URL
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateVehicleMutation.isLoading}
                  >
                    {updateVehicleMutation.isLoading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Driving Licence</Label>
                    <p className="mt-1">
                      {formData.drivingLicence || (
                        <span className="text-muted-foreground italic">Not provided</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Goods in Transit Insurance</Label>
                    <p className="mt-1">
                      {formData.goodsInTransitInsurance || (
                        <span className="text-muted-foreground italic">Not provided</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Public Liability Insurance</Label>
                    <p className="mt-1">
                      {formData.publicLiability || (
                        <span className="text-muted-foreground italic">Not provided</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Proof of Address</Label>
                    <p className="mt-1">
                      {formData.proofOfAddress || (
                        <span className="text-muted-foreground italic">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>

                {hasAllInfo && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      All required documents have been provided. You are eligible for jobs.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default VehiclePage

