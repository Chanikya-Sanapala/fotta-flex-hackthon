export type NavigationTab = 'overview' | 'planning' | 'fleet' | 'deliveries'

export interface UnservedDelivery {
  deliveryId: string
  reason: string
}

export interface OptimizationResult {
  runId: string
  status: string
  algorithm: string
  routeId?: string
  vehicleId?: string
  driverId?: string
  assignedCount: number
  totalDistanceKm: number
  totalDurationMinutes: number
  totalWeightKg: number
  totalVolumeM3: number
  orderedDeliveries: string[]
  unserved?: UnservedDelivery[]
  message?: string
}

export interface OptimizationRequest {
  planningDate: string
  scenarioName?: string
  trafficScenario?: string
}

export interface CustomerSite {
  siteId: string
  regionId: string
  siteName: string
  address: string | null
  latitude: number
  longitude: number
  siteType: 'CUSTOMER' | 'WAREHOUSE' | 'DEPOT' | string
  active: boolean
  createdAt?: string
}

export interface DeliveryRecord {
  deliveryId: string
  orderId: string
  siteId: string
  siteName: string | null
  siteAddress: string | null
  latitude: number | null
  longitude: number | null
  siteType: string | null
  deliveryDate: string
  demandWeightKg: number
  demandVolumeM3: number
  serviceDurationMinutes: number
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string
  status:
    | 'PENDING'
    | 'VALIDATED'
    | 'ASSIGNED'
    | 'PLANNED'
    | 'DISPATCHED'
    | 'IN_PROGRESS'
    | 'DELIVERED'
    | 'FAILED'
    | 'UNSERVED'
    | 'CANCELLED'
    | string
  createdAt?: string
  routeId?: string | null
  sequenceNumber?: number | null
  vehicleId?: string | null
  driverId?: string | null
}

export interface HealthResponse {
  status: string
  [key: string]: unknown
}

export interface FleetVehicle {
  vehicleId: string
  registrationNo: string
  vehicleType: string
  active: boolean
  maxWeightKg: number
  maxVolumeM3: number
  driverId: string | null
  driverName: string | null
  shiftId: string | null
  shiftDate: string | null
  shiftStart: string | null
  shiftEnd: string | null
  shiftStatus: string | null
  depotId: string | null
  depotName: string | null
  currentRouteId: string | null
  currentRouteStatus: string | null
  assignedStopsCount: number
  assignedWeightKg: number | null
  assignedVolumeM3: number | null
  dispatchStatus: 'STANDBY' | 'PLANNED' | 'DISPATCHED' | string
}

