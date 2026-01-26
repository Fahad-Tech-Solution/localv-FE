import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminApi, User, Booking } from '@/api/admin'

// Stats
export const useAdminStats = () => {
  return useQuery('adminStats', adminApi.getStats, {
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Users
export const useAdminUsers = (params?: {
  role?: string
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery(
    ['adminUsers', params],
    () => adminApi.getAllUsers(params),
    {
      staleTime: 10 * 1000, // 10 seconds
    }
  )
}

export const useAdminUser = (id: string) => {
  return useQuery(
    ['adminUser', id],
    () => adminApi.getUserById(id),
    {
      enabled: !!id,
    }
  )
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, data }: { id: string; data: Partial<User> }) => adminApi.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers')
        queryClient.invalidateQueries('adminStats')
      },
    }
  )
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation(
    (id: string) => adminApi.deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers')
        queryClient.invalidateQueries('adminStats')
      },
    }
  )
}

// Drivers
export const useAdminDrivers = (params?: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery(
    ['adminDrivers', params],
    () => adminApi.getAllDrivers(params),
    {
      staleTime: 10 * 1000,
    }
  )
}

// Bookings
export const useAdminBookings = (params?: {
  status?: string
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery(
    ['adminBookings', params],
    () => adminApi.getAllBookings(params),
    {
      staleTime: 10 * 1000,
    }
  )
}

export const useUpdateBookingAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, data }: { id: string; data: Partial<Booking> }) => adminApi.updateBooking(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBookings')
        queryClient.invalidateQueries('adminStats')
      },
    }
  )
}

export const useAssignDriver = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ bookingId, driverId }: { bookingId: string; driverId: string }) =>
      adminApi.assignDriver(bookingId, driverId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBookings')
        queryClient.invalidateQueries('adminStats')
      },
    }
  )
}

export const useHandleDispute = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, data }: { id: string; data: { resolved: boolean; status?: string } }) =>
      adminApi.handleDispute(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBookings')
        queryClient.invalidateQueries('adminStats')
      },
    }
  )
}

export const useSendEmailReminder = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, type }: { id: string; type: 'customer' | 'driver' }) =>
      adminApi.sendEmailReminder(id, type),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBookings')
      },
    }
  )
}

