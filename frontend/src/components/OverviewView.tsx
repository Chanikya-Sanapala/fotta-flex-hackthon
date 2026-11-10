import React, { useMemo } from 'react'
import type { CustomerSite, NavigationTab, OptimizationResult } from '../types'

interface OverviewViewProps {
  result: OptimizationResult | null
  customerSites: CustomerSite[]
  isLoadingSites: boolean
  apiOnline: boolean | null
  onNavigate: (tab: NavigationTab) => void
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  result,
  customerSites,
  isLoadingSites,
  apiOnline,
  onNavigate,
}) => {
  const warehouses = useMemo(
    () => customerSites.filter((s) => s.siteType === 'WAREHOUSE' || s.siteType === 'DEPOT'),
    [customerSites],
  )
  const deliveryPoints = useMemo(
    () => customerSites.filter((s) => s.siteType === 'CUSTOMER'),
    [customerSites],
  )

  const stats = [
    {
      label: 'Deliveries Assigned',
      value: result ? result.assignedCount.toString() : '—',
      detail: result
        ? result.assignedCount === 0
          ? '0 deliveries in run'
          : `${result.assignedCount} successfully sequenced`
        : 'Awaiting optimization run',
      accent: 'border-[#4778D5]',
    },
    {
      label: 'Route Distance',
      value:
        result && result.assignedCount > 0
          ? `${Number(result.totalDistanceKm).toFixed(2)} km`
          : result && result.assignedCount === 0
            ? '0.00 km'
            : '—',
      detail: 'Straight-line Haversine estimate',
      accent: 'border-[#27865B]',
    },
    {
      label: 'Estimated Duration',
      value:
        result && result.assignedCount > 0
          ? `${result.totalDurationMinutes} min`
          : result && result.assignedCount === 0
            ? '0 min'
            : '—',
      detail: 'Travel & service time estimate',
      accent: 'border-[#C28A35]',
    },
    {
      label: 'Vehicle Payload',
      value:
        result && result.assignedCount > 0
          ? `${Number(result.totalWeightKg).toFixed(0)} kg`
          : result && result.assignedCount === 0
            ? '0 kg'
            : '—',
      detail:
        result && result.assignedCount > 0
          ? `${Number(result.totalVolumeM3).toFixed(2)} m³ volume utilized`
          : 'Payload capacity utilized',
      accent: 'border-[#4778D5]',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Glass Card */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(71,120,213,0.2)] bg-[#4778D5]/10 px-3 py-1 text-[11px] font-semibold text-[#4778D5]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4778D5]" />
            Routing Intelligence
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#17191D] sm:text-3xl">
            Intelligent Fleet Dispatch & Optimization
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#777E87]">
            Balanced multi-stop delivery sequences evaluating vehicle payload limits,
            spatial proximity, and priority constraints in real-time.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('planning')}
              className="inline-flex items-center justify-center rounded-xl bg-[#4778D5] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#3B66B7] active:scale-[0.99] transition-all"
            >
              Launch Route Planning
            </button>
            <button
              onClick={() => onNavigate('fleet')}
              className="inline-flex items-center justify-center rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-5 py-2.5 text-xs font-medium text-[#17191D] shadow-sm hover:bg-[#F5F6F8] active:scale-[0.99] transition-all"
            >
              Inspect Fleet Status
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-panel rounded-2xl p-5 border-l-4 transition-all hover:bg-white/95"
            style={{ borderLeftColor: stat.accent === 'border-[#4778D5]' ? '#4778D5' : stat.accent === 'border-[#27865B]' ? '#27865B' : '#C28A35' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#777E87]">
              {stat.label}
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-[#17191D] tabular-nums sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-[#777E87]">{stat.detail}</p>
          </div>
        ))}
      </section>

      {/* Overview 2-Column Content Grid */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Latest Optimization Run Card */}
        <div className="glass-panel flex flex-col rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between pb-3 border-b border-[rgba(20,30,50,0.06)]">
            <div>
              <h3 className="font-semibold text-[#17191D]">Latest Optimization Run</h3>
              <p className="mt-0.5 text-xs text-[#777E87]">
                Current routing allocation and sequence status
              </p>
            </div>
            {result ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27865B]/20 bg-[#27865B]/10 px-3 py-0.5 text-xs font-medium text-[#27865B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#27865B]" />
                {result.status}
              </span>
            ) : (
              <span className="rounded-full border border-[rgba(20,30,50,0.08)] bg-black/[0.04] px-3 py-0.5 text-xs font-medium text-[#777E87]">
                No Active Run
              </span>
            )}
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5">
                  <p className="text-[11px] font-medium text-[#777E87]">Run Reference</p>
                  <p className="mt-1 truncate font-mono text-xs font-semibold text-[#17191D]">
                    {result.runId}
                  </p>
                </div>
                <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5">
                  <p className="text-[11px] font-medium text-[#777E87]">Vehicle ID</p>
                  <p className="mt-1 truncate font-mono text-xs font-semibold text-[#17191D]">
                    {result.vehicleId || 'Unassigned'}
                  </p>
                </div>
                <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5 col-span-2 sm:col-span-1">
                  <p className="text-[11px] font-medium text-[#777E87]">Driver ID</p>
                  <p className="mt-1 truncate font-mono text-xs font-semibold text-[#17191D]">
                    {result.driverId || 'Unassigned'}
                  </p>
                </div>
              </div>

              {result.assignedCount > 0 ? (
                <div className="rounded-xl border border-[rgba(71,120,213,0.15)] bg-[#4778D5]/[0.03] p-4 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#17191D]">
                    <span>Route Summary</span>
                    <span className="font-mono text-[#4778D5]">{result.orderedDeliveries.length} Stops Scheduled</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#777E87]">
                    Vehicle {result.vehicleId} will service {result.assignedCount} delivery points covering approximately {Number(result.totalDistanceKm).toFixed(1)} km in ~{result.totalDurationMinutes} minutes.
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => onNavigate('planning')}
                      className="font-medium text-xs text-[#4778D5] hover:text-[#3B66B7] transition-colors"
                    >
                      View Delivery Sequence →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[rgba(194,138,53,0.2)] bg-[#C28A35]/5 p-4 text-xs text-[#C28A35]">
                  <p className="font-semibold">Notice: Zero Assigned Stops</p>
                  <p className="mt-1 text-xs text-[#777E87]">
                    {result.message || 'Optimization completed with 0 pending delivery assignments for the selected planning parameters.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-8 text-center">
              <p className="text-sm font-semibold text-[#17191D]">
                No optimization generated yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-[#777E87]">
                Go to Route Planning to configure parameters and generate an optimized route.
              </p>
              <button
                onClick={() => onNavigate('planning')}
                className="mt-4 rounded-xl bg-[#4778D5] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3B66B7] transition-all"
              >
                Go to Route Planning
              </button>
            </div>
          )}
        </div>

        {/* Customer Sites & Infrastructure Network Card */}
        <div className="glass-panel flex flex-col rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between pb-3 border-b border-[rgba(20,30,50,0.06)]">
            <div>
              <h3 className="font-semibold text-[#17191D]">Logistics Network</h3>
              <p className="mt-0.5 text-xs text-[#777E87]">
                Registered distribution hubs and customer delivery sites
              </p>
            </div>
            <button
              onClick={() => onNavigate('deliveries')}
              className="text-xs font-medium text-[#4778D5] hover:text-[#3B66B7] transition-colors"
            >
              View All Sites →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5 text-center">
              <p className="text-[11px] font-medium text-[#777E87]">Total Sites</p>
              <p className="mt-1 text-2xl font-bold text-[#17191D] tabular-nums">
                {isLoadingSites ? '—' : customerSites.length}
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5 text-center">
              <p className="text-[11px] font-medium text-[#777E87]">Depots & Hubs</p>
              <p className="mt-1 text-2xl font-bold text-[#4778D5] tabular-nums">
                {isLoadingSites ? '—' : warehouses.length}
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5 text-center">
              <p className="text-[11px] font-medium text-[#777E87]">Customer Sites</p>
              <p className="mt-1 text-2xl font-bold text-[#27865B] tabular-nums">
                {isLoadingSites ? '—' : deliveryPoints.length}
              </p>
            </div>
          </div>

          <div className="mt-4 flex-1 space-y-2">
            <p className="text-xs font-medium text-[#777E87]">Operational Hubs</p>
            {isLoadingSites ? (
              <p className="py-6 text-center text-xs text-[#777E87]">
                Loading facility locations...
              </p>
            ) : customerSites.length > 0 ? (
              <div className="space-y-2">
                {customerSites.slice(0, 3).map((site) => (
                  <div
                    key={site.siteId}
                    className="flex items-center justify-between rounded-xl border border-[rgba(20,30,50,0.06)] bg-white px-3.5 py-2.5 text-xs"
                  >
                    <div className="truncate">
                      <p className="truncate font-semibold text-[#17191D]">
                        {site.siteName}
                      </p>
                      <p className="truncate text-[11px] text-[#777E87]">
                        {site.address || `${site.latitude}, ${site.longitude}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                        site.siteType === 'WAREHOUSE' || site.siteType === 'DEPOT'
                          ? 'border-[#4778D5]/20 bg-[#4778D5]/10 text-[#4778D5]'
                          : 'border-[#27865B]/20 bg-[#27865B]/10 text-[#27865B]'
                      }`}
                    >
                      {site.siteType}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-6 text-center text-xs text-[#777E87]">
                {apiOnline === false
                  ? 'Backend is offline. Ensure Spring Boot is running on port 8080.'
                  : 'No customer sites registered in database.'}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[rgba(20,30,50,0.06)] pt-3 text-[11px] text-[#777E87]">
            <span>Live Stream: <code>/api/v1/customer-sites</code></span>
            <button
              onClick={() => onNavigate('deliveries')}
              className="font-medium text-[#17191D] hover:text-[#4778D5] transition-colors"
            >
              Directory
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
