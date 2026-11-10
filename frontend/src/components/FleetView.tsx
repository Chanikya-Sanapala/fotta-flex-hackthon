import React from 'react'
import type { CustomerSite, FleetVehicle } from '../types'

interface FleetViewProps {
  fleet: FleetVehicle[]
  isLoadingFleet: boolean
  fleetError: string | null
  customerSites: CustomerSite[]
  isLoadingSites: boolean
  onRefreshFleet: () => void
}

function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return '—'
  return kg.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function formatVolume(m3: number | null | undefined): string {
  if (m3 == null) return '—'
  return m3.toFixed(1)
}

function capacityPct(used: number | null, max: number | null): number | null {
  if (used == null || max == null || max === 0) return null
  return Math.min(100, (used / max) * 100)
}

function DispatchBadge({ status }: { status: string }) {
  if (status === 'DISPATCHED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4778D5]/20 bg-[#4778D5]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4778D5]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#4778D5]" />
        Dispatched
      </span>
    )
  }
  if (status === 'PLANNED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4778D5]/20 bg-[#4778D5]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4778D5]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#4778D5]" />
        Planned
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27865B]/20 bg-[#27865B]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#27865B]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#27865B]" />
      Active / Standby
    </span>
  )
}

export const FleetView: React.FC<FleetViewProps> = ({
  fleet,
  isLoadingFleet,
  fleetError,
  customerSites,
  isLoadingSites,
  onRefreshFleet,
}) => {
  const depots = customerSites.filter(
    (s) => s.siteType === 'WAREHOUSE' || s.siteType === 'DEPOT',
  )

  const activeVehicle = fleet.find(
    (v) => v.dispatchStatus === 'DISPATCHED' || v.dispatchStatus === 'PLANNED',
  )

  return (
    <div className="space-y-6">
      {/* Backend API Live Notice */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 text-xs text-[#17191D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4778D5]" />
            <p className="font-semibold text-[#17191D]">
              PostgreSQL Live Fleet Registry
            </p>
            <span className="rounded-full border border-[rgba(71,120,213,0.2)] bg-[#4778D5]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#4778D5]">
              GET /api/v1/fleet
            </span>
          </div>
          <p className="text-[#777E87]">
            Physical assets, capacities, driver assignments, and active route plans sourced directly from the database.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#777E87]">
          <span>Hub Stream:</span>
          <code className="rounded-md border border-[rgba(20,30,50,0.08)] bg-white px-2 py-0.5 font-mono text-[#4778D5]">
            /api/v1/customer-sites
          </code>
        </div>
      </div>

      {/* Active Operational Dispatch Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[rgba(20,30,50,0.06)]">
          <div>
            <h3 className="font-semibold text-[#17191D]">Active Dispatch Status</h3>
            <p className="mt-0.5 text-xs text-[#777E87]">
              Current vehicle assignment from database route state
            </p>
          </div>
          {activeVehicle ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27865B]/20 bg-[#27865B]/10 px-3 py-1 text-xs font-semibold text-[#27865B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#27865B]" />
              {activeVehicle.dispatchStatus === 'DISPATCHED' ? 'Active Dispatch' : 'Route Planned'}
            </span>
          ) : (
            <span className="rounded-full border border-[rgba(20,30,50,0.08)] bg-black/[0.04] px-3 py-1 text-xs font-medium text-[#777E87]">
              Fleet on Standby
            </span>
          )}
        </div>

        {isLoadingFleet ? (
          <div className="py-8 text-center text-xs text-[#777E87]">
            Loading fleet dispatch state...
          </div>
        ) : fleetError ? (
          <div className="rounded-xl border border-[#C65353]/20 bg-[#C65353]/5 p-5 text-center text-xs text-[#C65353]">
            <p className="font-semibold">Fleet Data Unavailable</p>
            <p className="mt-1 text-[#777E87]">{fleetError}</p>
            <button
              onClick={onRefreshFleet}
              className="mt-3 rounded-lg border border-[rgba(20,30,50,0.1)] bg-white px-3 py-1.5 text-xs font-medium text-[#17191D] hover:bg-[#F5F6F8] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : activeVehicle ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-4">
              <p className="text-[11px] font-medium text-[#777E87]">Vehicle ID</p>
              <p className="mt-1 font-mono text-base font-bold text-[#17191D]">{activeVehicle.vehicleId}</p>
              <p className="mt-0.5 text-[11px] text-[#777E87]">
                {activeVehicle.registrationNo} · {activeVehicle.vehicleType}
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-4">
              <p className="text-[11px] font-medium text-[#777E87]">Assigned Driver</p>
              <p className="mt-1 font-mono text-base font-bold text-[#17191D]">
                {activeVehicle.driverId ?? '—'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#777E87]">
                {activeVehicle.driverName ?? 'No driver assigned'}
                {activeVehicle.shiftStatus ? ` · ${activeVehicle.shiftStatus}` : ''}
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-4">
              <p className="text-[11px] font-medium text-[#777E87]">Current Payload</p>
              <p className="mt-1 text-base font-bold text-[#17191D] tabular-nums">
                {formatWeight(activeVehicle.assignedWeightKg)}{' '}
                <span className="text-xs font-normal text-[#777E87]">
                  / {formatWeight(activeVehicle.maxWeightKg)} kg
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#777E87]">
                {formatVolume(activeVehicle.assignedVolumeM3)} / {formatVolume(activeVehicle.maxVolumeM3)} m³ volume
              </p>
              {capacityPct(activeVehicle.assignedWeightKg, activeVehicle.maxWeightKg) != null && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(20,30,50,0.06)]">
                  <div
                    className="h-full rounded-full bg-[#4778D5] transition-all"
                    style={{ width: `${capacityPct(activeVehicle.assignedWeightKg, activeVehicle.maxWeightKg)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-4">
              <p className="text-[11px] font-medium text-[#777E87]">Assigned Route</p>
              <p className="mt-1 truncate font-mono text-xs font-bold text-[#17191D]">
                {activeVehicle.currentRouteId ?? 'No route assigned'}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[#4778D5]">
                {activeVehicle.assignedStopsCount > 0
                  ? `${activeVehicle.assignedStopsCount} stops scheduled`
                  : 'No stops assigned'}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-6 text-center text-xs text-[#777E87]">
            <p className="font-semibold text-[#17191D]">Fleet Standby</p>
            <p className="mt-1">
              {fleet.length > 0
                ? `${fleet.length} vehicle(s) ready in database. Launch Route Planning to dispatch route stops.`
                : 'No vehicles registered in database.'}
            </p>
          </div>
        )}
      </div>

      {/* Fleet Specification Table */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[rgba(20,30,50,0.06)]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#17191D]">Fleet Asset Specifications</h3>
              {!isLoadingFleet && !fleetError && (
                <span className="rounded-full border border-[rgba(71,120,213,0.2)] bg-[#4778D5]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#4778D5]">
                  {fleet.length} Asset{fleet.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[#777E87]">
              Payload thresholds, volumetric constraints, and primary driver shifts from PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshFleet}
              disabled={isLoadingFleet}
              className="rounded-xl border border-[rgba(20,30,50,0.1)] bg-white px-3.5 py-1.5 text-xs font-medium text-[#17191D] shadow-xs hover:bg-[#F5F6F8] transition-all disabled:opacity-50"
            >
              {isLoadingFleet ? 'Refreshing...' : 'Refresh Fleet'}
            </button>
            <span className="rounded-full border border-[#27865B]/20 bg-[#27865B]/10 px-3 py-1 text-xs font-medium text-[#27865B]">
              Live PostgreSQL
            </span>
          </div>
        </div>

        {isLoadingFleet ? (
          <div className="py-10 text-center text-xs text-[#777E87]">
            Loading vehicle registry...
          </div>
        ) : fleetError ? (
          <div className="rounded-xl border border-[#C65353]/20 bg-[#C65353]/5 p-6 text-center text-xs text-[#C65353]">
            <p className="font-semibold">Could not load fleet data</p>
            <p className="mt-1 text-[#777E87]">{fleetError}</p>
          </div>
        ) : fleet.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-6 text-center text-xs text-[#777E87]">
            No vehicles registered in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(20,30,50,0.08)] text-[#777E87]">
                  <th scope="col" className="pb-3 font-semibold">Vehicle ID</th>
                  <th scope="col" className="pb-3 font-semibold">Registration</th>
                  <th scope="col" className="pb-3 font-semibold">Classification</th>
                  <th scope="col" className="pb-3 font-semibold">Max Payload</th>
                  <th scope="col" className="pb-3 font-semibold">Max Volume</th>
                  <th scope="col" className="pb-3 font-semibold">Driver</th>
                  <th scope="col" className="pb-3 font-semibold">Home Depot</th>
                  <th scope="col" className="pb-3 font-semibold">Dispatch State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,30,50,0.04)]">
                {fleet.map((vehicle) => (
                  <tr
                    key={vehicle.vehicleId}
                    className="transition hover:bg-black/[0.015]"
                  >
                    <td className="py-3.5 font-mono font-medium text-[#17191D]">
                      {vehicle.vehicleId}
                    </td>
                    <td className="py-3.5 font-mono text-[#777E87]">{vehicle.registrationNo}</td>
                    <td className="py-3.5 font-medium text-[#17191D]">{vehicle.vehicleType}</td>
                    <td className="py-3.5 font-medium text-[#17191D] tabular-nums">
                      {formatWeight(vehicle.maxWeightKg)} kg
                    </td>
                    <td className="py-3.5 font-medium text-[#17191D] tabular-nums">
                      {formatVolume(vehicle.maxVolumeM3)} m³
                    </td>
                    <td className="py-3.5">
                      {vehicle.driverId ? (
                        <div>
                          <p className="font-mono font-medium text-[#17191D]">{vehicle.driverId}</p>
                          {vehicle.driverName && (
                            <p className="text-[10px] text-[#777E87]">{vehicle.driverName}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#9DA4AE]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {vehicle.depotId ? (
                        <div>
                          <p className="font-medium text-[#17191D]">{vehicle.depotName ?? vehicle.depotId}</p>
                          <p className="font-mono text-[10px] text-[#777E87]">{vehicle.depotId}</p>
                        </div>
                      ) : (
                        <span className="text-[#9DA4AE]">—</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <DispatchBadge status={vehicle.dispatchStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operating Depots & Warehouses */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex items-center justify-between pb-4 border-b border-[rgba(20,30,50,0.06)]">
          <div>
            <h3 className="font-semibold text-[#17191D]">Distribution Depots & Warehouses</h3>
            <p className="mt-0.5 text-xs text-[#777E87]">
              Origin points for route departure and inventory replenishment
            </p>
          </div>
          <span className="rounded-full border border-[rgba(71,120,213,0.2)] bg-[#4778D5]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#4778D5]">
            {depots.length} Operating Hubs
          </span>
        </div>

        {isLoadingSites ? (
          <p className="py-8 text-center text-xs text-[#777E87]">
            Loading hub locations from backend...
          </p>
        ) : depots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {depots.map((depot) => (
              <div
                key={depot.siteId}
                className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-4 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-[#4778D5]">
                    {depot.siteId}
                  </span>
                  <span className="rounded-full border border-[#4778D5]/20 bg-[#4778D5]/10 px-2 py-0.5 text-[10px] font-medium text-[#4778D5]">
                    {depot.siteType}
                  </span>
                </div>
                <h4 className="mt-2 font-bold text-[#17191D]">{depot.siteName}</h4>
                <p className="mt-1 text-[11px] text-[#777E87]">
                  {depot.address || 'Address unrecorded'}
                </p>
                <div className="mt-3 font-mono text-[11px] text-[#777E87]">
                  Lat: {depot.latitude}, Lon: {depot.longitude}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-6 text-center text-xs text-[#777E87]">
            No depot sites found.
          </div>
        )}
      </div>

      {/* Data Lineage Footer */}
      <div className="rounded-2xl border border-[rgba(20,30,50,0.06)] bg-white/50 p-5 text-xs text-[#777E87]">
        <h4 className="font-semibold text-[#17191D]">Fleet Data Lineage & Database Tables</h4>
        <div className="mt-3 grid gap-3 text-[11px] sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[rgba(20,30,50,0.06)] bg-white p-3">
            <p className="text-[#777E87]">Vehicle Registry</p>
            <p className="mt-1 font-mono font-medium text-[#17191D]">
              {fleet.length > 0 ? fleet.map((v) => v.vehicleId).join(', ') : '—'}
            </p>
            <p className="mt-0.5 text-[10px] text-[#4778D5]">vehicle table</p>
          </div>
          <div className="rounded-lg border border-[rgba(20,30,50,0.06)] bg-white p-3">
            <p className="text-[#777E87]">Payload Capacities</p>
            {fleet.length > 0 ? (
              fleet.map((v) => (
                <p key={v.vehicleId} className="mt-1 font-mono font-medium text-[#17191D]">
                  {formatWeight(v.maxWeightKg)} kg / {formatVolume(v.maxVolumeM3)} m³
                </p>
              ))
            ) : (
              <p className="mt-1 font-mono font-medium text-[#17191D]">—</p>
            )}
            <p className="mt-0.5 text-[10px] text-[#4778D5]">vehicle_capacity table</p>
          </div>
          <div className="rounded-lg border border-[rgba(20,30,50,0.06)] bg-white p-3">
            <p className="text-[#777E87]">Driver & Shift</p>
            {fleet.length > 0 ? (
              fleet.map((v) => (
                <p key={v.vehicleId} className="mt-1 font-mono font-medium text-[#17191D]">
                  {v.driverId ?? 'Unassigned'}
                </p>
              ))
            ) : (
              <p className="mt-1 font-mono font-medium text-[#17191D]">—</p>
            )}
            <p className="mt-0.5 text-[10px] text-[#4778D5]">driver + driver_shift tables</p>
          </div>
          <div className="rounded-lg border border-[rgba(20,30,50,0.06)] bg-white p-3">
            <p className="text-[#777E87]">Home Depot Hub</p>
            {fleet.length > 0 ? (
              fleet.map((v) => (
                <p key={v.vehicleId} className="mt-1 font-mono font-medium text-[#17191D]">
                  {v.depotId ?? '—'}
                </p>
              ))
            ) : (
              <p className="mt-1 font-mono font-medium text-[#17191D]">—</p>
            )}
            <p className="mt-0.5 text-[10px] text-[#4778D5]">customer_site table</p>
          </div>
        </div>
      </div>
    </div>
  )
}
