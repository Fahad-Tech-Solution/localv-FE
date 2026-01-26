import { apiClient } from './client'

export interface AdminStats {
  users: {
    total: number
    drivers: number
    customers: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    inProgress: number
    completed: number
    disputed: number
  }
  revenue: {
    total: number
    totalSpent: number
  }
}

export interface User {
  _id: string
  email: string
  name: string
  role: 'customer' | 'driver' | 'admin'
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Booking {
  _id: string
  customer: User | string
  driver?: User | string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed'
  pickupAddress: string
  pickupCity: string
  pickupState?: string
  pickupZipCode: string
  pickupDate: string
  pickupTime: string
  deliveryAddress: string
  deliveryCity: string
  deliveryState?: string
  deliveryZipCode: string
  serviceType: 'local' | 'long-distance' | 'interstate'
  vehicleType: 'small-van' | 'medium-van' | 'large-van' | 'truck'
  estimatedPrice: number
  finalPrice?: number
  paymentStatus: 'pending' | 'paid' | 'refunded'
  amountPaid?: number
  orderCode?: string
  contactEmail?: string
  contactPhone?: string
  completionPictures?: string[]
  driverNotes?: string
  isDisputed?: boolean
  disputeReason?: string
  disputeResolved?: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  users?: T[]
  bookings?: T[]
  drivers?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const adminApi = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats')
    return response.data
  },

  // Users
  getAllUsers: async (params?: {
    role?: string
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/admin/users', { params })
    return response.data
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/admin/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put(`/admin/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admin/users/${id}`)
    return response.data
  },

  // Drivers
  getAllDrivers: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<User & { stats: { totalJobs: number; completedJobs: number; activeJobs: number } }>> => {
    const response = await apiClient.get('/admin/drivers', { params })
    return response.data
  },

  // Bookings
  getAllBookings: async (params?: {
    status?: string
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get('/admin/bookings', { params })
    return response.data
  },

  updateBooking: async (id: string, data: Partial<Booking>): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.put(`/admin/bookings/${id}`, data)
    return response.data
  },

  assignDriver: async (id: string, driverId: string): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.post(`/admin/bookings/${id}/assign-driver`, { driverId })
    return response.data
  },

  handleDispute: async (id: string, data: { resolved: boolean; status?: string }): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.post(`/admin/bookings/${id}/handle-dispute`, data)
    return response.data
  },

  sendEmailReminder: async (id: string, type: 'customer' | 'driver'): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.post(`/admin/bookings/${id}/send-reminder`, { type })
    return response.data
  },
}

