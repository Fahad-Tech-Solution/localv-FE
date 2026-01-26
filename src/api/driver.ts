import { apiClient } from './client'
import { Booking } from './admin'

export interface DriverStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  pendingJobs: number
}

export interface VehicleInfo {
  drivingLicence?: string
  goodsInTransitInsurance?: string
  publicLiability?: string
  proofOfAddress?: string
}

export const driverApi = {
  // Stats
  getStats: async (): Promise<DriverStats> => {
    const response = await apiClient.get('/driver/stats')
    return response.data
  },

  // Jobs
  getJobs: async (params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{ bookings: Booking[]; pagination: any }> => {
    const response = await apiClient.get('/driver/jobs', { params })
    return response.data
  },

  getJob: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/driver/jobs/${id}`)
    return response.data
  },

  updateJobStatus: async (id: string, status: string): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.put(`/driver/jobs/${id}/status`, { status })
    return response.data
  },

  addCompletionDetails: async (
    id: string,
    data: { pictures?: string[]; notes?: string }
  ): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.post(`/driver/jobs/${id}/complete`, data)
    return response.data
  },

  disputeJob: async (id: string, reason: string): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.post(`/driver/jobs/${id}/dispute`, { reason })
    return response.data
  },

  // Vehicle
  getVehicle: async (): Promise<VehicleInfo> => {
    const response = await apiClient.get('/driver/vehicle')
    return response.data
  },

  updateVehicle: async (data: VehicleInfo): Promise<{ message: string; vehicle: VehicleInfo }> => {
    const response = await apiClient.put('/driver/vehicle', data)
    return response.data
  },
}

