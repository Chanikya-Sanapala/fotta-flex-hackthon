import axios from 'axios'
import type { CustomerSite, DeliveryRecord, FleetVehicle, HealthResponse, OptimizationRequest, OptimizationResult } from '../types'

export const API_BASE_URL = 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get<HealthResponse>('/actuator/health')
    return response.data?.status === 'UP' || response.status === 200
  } catch {
    return false
  }
}

export async function runOptimizationApi(
  payload: OptimizationRequest,
): Promise<OptimizationResult> {
  const response = await apiClient.post<OptimizationResult>(
    '/api/v1/optimization/run',
    payload,
  )
  return response.data
}

export async function fetchCustomerSites(): Promise<CustomerSite[]> {
  const response = await apiClient.get<CustomerSite[]>('/api/v1/customer-sites')
  return response.data
}

export async function fetchDeliveries(
  status?: string,
  date?: string,
): Promise<DeliveryRecord[]> {
  const params: Record<string, string> = {}
  if (status && status.trim()) params.status = status.trim()
  if (date && date.trim()) params.date = date.trim()

  const response = await apiClient.get<DeliveryRecord[]>('/api/v1/deliveries', {
    params,
  })
  return response.data
}

export async function fetchFleet(activeOnly?: boolean): Promise<FleetVehicle[]> {
  const params: Record<string, string> = {}
  if (activeOnly !== undefined) params.active = String(activeOnly)

  const response = await apiClient.get<FleetVehicle[]>('/api/v1/fleet', {
    params,
  })
  return response.data
}

export function formatApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.data) {
      const data = err.response.data as Record<string, unknown>
      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        return data.message
      }
      if (typeof data.error === 'string' && data.error.trim().length > 0) {
        return `${data.error}${data.status ? ` (Status ${data.status})` : ''}`
      }
    }
    if (err.message) {
      if (err.message.includes('Network Error')) {
        return 'Network Error: Cannot connect to backend server at http://localhost:8080. Please ensure the Spring Boot application is running.'
      }
      return err.message
    }
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'An unexpected error occurred while communicating with the server.'
}

