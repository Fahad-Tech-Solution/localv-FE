import { useQuery, useMutation, useQueryClient } from 'react-query'
import { driverApi, VehicleInfo } from '@/api/driver'

// Stats
export const useDriverStats = () => {
  return useQuery('driverStats', driverApi.getStats, {
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// Jobs
export const useDriverJobs = (params?: {
  status?: string
  page?: number
  limit?: number
}) => {
  return useQuery(
    ['driverJobs', params],
    () => driverApi.getJobs(params),
    {
      staleTime: 10 * 1000,
    }
  )
}

export const useDriverJob = (id: string) => {
  return useQuery(
    ['driverJob', id],
    () => driverApi.getJob(id),
    {
      enabled: !!id,
    }
  )
}

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, status }: { id: string; status: string }) => driverApi.updateJobStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('driverJobs')
        queryClient.invalidateQueries('driverStats')
      },
    }
  )
}

export const useAddCompletionDetails = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, data }: { id: string; data: { pictures?: string[]; notes?: string } }) =>
      driverApi.addCompletionDetails(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('driverJobs')
        queryClient.invalidateQueries('driverStats')
      },
    }
  )
}

export const useDisputeJob = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, reason }: { id: string; reason: string }) => driverApi.disputeJob(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('driverJobs')
        queryClient.invalidateQueries('driverStats')
      },
    }
  )
}

// Vehicle
export const useDriverVehicle = () => {
  return useQuery('driverVehicle', driverApi.getVehicle, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation(
    (data: VehicleInfo) => driverApi.updateVehicle(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('driverVehicle')
      },
    }
  )
}

