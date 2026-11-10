import React, { useMemo, useState } from 'react'
import type { CustomerSite, DeliveryRecord, OptimizationResult } from '../types'

interface DeliveriesViewProps {
  result: OptimizationResult | null
  deliveries: DeliveryRecord[]
  isLoadingDeliveries: boolean
  deliveriesError: string | null
  onRefreshDeliveries?: () => void
  customerSites: CustomerSite[]
  isLoadingSites: boolean
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  result,
  deliveries,
  isLoadingDeliveries,
  deliveriesError,
  onRefreshDeliveries,
  customerSites,
  isLoadingSites,
}) => {
  // Delivery filter states
  const [deliverySearch, setDeliverySearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Customer sites filter states
  const [siteSearch, setSiteSearch] = useState('')
  const [siteTypeFilter, setSiteTypeFilter] = useState('ALL')

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const q = deliverySearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        d.deliveryId.toLowerCase().includes(q) ||
        d.orderId.toLowerCase().includes(q) ||
        (d.siteName && d.siteName.toLowerCase().includes(q)) ||
        d.siteId.toLowerCase().includes(q) ||
        (d.siteAddress && d.siteAddress.toLowerCase().includes(q)) ||
        (d.routeId && d.routeId.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'ALL' ||
        d.status.toUpperCase() === statusFilter.toUpperCase()

      return matchesSearch && matchesStatus
    })
  }, [deliveries, deliverySearch, statusFilter])

  // Filter sites
  const filteredSites = useMemo(() => {
    return customerSites.filter((site) => {
      const matchesSearch =
        site.siteName.toLowerCase().includes(siteSearch.toLowerCase()) ||
        site.siteId.toLowerCase().includes(siteSearch.toLowerCase()) ||
        (site.address && site.address.toLowerCase().includes(siteSearch.toLowerCase()))

      const matchesType =
        siteTypeFilter === 'ALL' || site.siteType.toUpperCase() === siteTypeFilter.toUpperCase()

      return matchesSearch && matchesType
    })
  }, [customerSites, siteSearch, siteTypeFilter])

  // Delivery status counts
  const plannedCount = useMemo(
    () => deliveries.filter((d) => d.status === 'PLANNED').length,
    [deliveries],
  )
  const pendingCount = useMemo(
    () => deliveries.filter((d) => d.status === 'PENDING' || d.status === 'VALIDATED').length,
    [deliveries],
  )
  const sequencedCount = useMemo(
    () => deliveries.filter((d) => d.sequenceNumber != null).length,
    [deliveries],
  )

  return (
    <div className="space-y-6">
      {/* Backend API Pipeline Notice */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 text-xs text-[#17191D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4778D5]" />
            <p className="font-semibold text-[#17191D]">
              Delivery Records Pipeline
            </p>
            <span className="rounded-full border border-[rgba(71,120,213,0.2)] bg-[#4778D5]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#4778D5]">
              GET /api/v1/deliveries
            </span>
          </div>
          <p className="text-[#777E87]">
            Operational delivery requests and stop sequence numbers retrieved directly from PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshDeliveries && (
            <button
              onClick={onRefreshDeliveries}
              disabled={isLoadingDeliveries}
              className="rounded-xl border border-[rgba(20,30,50,0.1)] bg-white px-3.5 py-1.5 text-xs font-medium text-[#17191D] shadow-xs hover:bg-[#F5F6F8] transition-all disabled:opacity-50"
            >
              {isLoadingDeliveries ? 'Refreshing...' : 'Refresh Records'}
            </button>
          )}
        </div>
      </div>

      {/* Main Delivery Records & Assignments Table */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(20,30,50,0.06)]">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-semibold text-[#17191D]">
                Delivery Records & Sequence Assignments
              </h3>
              <span className="rounded-full border border-[rgba(71,120,213,0.2)] bg-[#4778D5]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#4778D5] tabular-nums">
                {deliveries.length} Records
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#777E87]">
              {plannedCount} planned · {sequencedCount} sequenced in stops · {pendingCount} awaiting optimization
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-full sm:w-60">
              <input
                id="delivery-search"
                type="text"
                placeholder="Search delivery, order, customer..."
                aria-label="Search delivery records"
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                className="w-full rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-3 py-2 text-xs text-[#17191D] placeholder:text-[#9DA4AE] outline-none shadow-xs transition focus:border-[#4778D5] focus:ring-2 focus:ring-[#4778D5]/20"
              />
            </div>

            <div>
              <select
                id="delivery-status-filter"
                aria-label="Filter by delivery status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-3 py-2 text-xs text-[#17191D] outline-none shadow-xs transition focus:border-[#4778D5] focus:ring-2 focus:ring-[#4778D5]/20"
              >
                <option value="ALL">All Statuses ({deliveries.length})</option>
                <option value="PLANNED">PLANNED ({plannedCount})</option>
                <option value="PENDING">PENDING</option>
                <option value="VALIDATED">VALIDATED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="UNSERVED">UNSERVED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {deliveriesError && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#C65353]/20 bg-[#C65353]/5 p-4 text-xs text-[#C65353]">
            <span>{deliveriesError}</span>
            {onRefreshDeliveries && (
              <button
                onClick={onRefreshDeliveries}
                className="rounded-lg border border-[#C65353]/20 bg-white px-3 py-1 font-semibold text-[#C65353] hover:bg-[#F5F6F8] transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoadingDeliveries ? (
          <div className="py-12 text-center text-xs text-[#777E87]">
            Loading delivery records from PostgreSQL...
          </div>
        ) : filteredDeliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(20,30,50,0.08)] text-[#777E87]">
                  <th scope="col" className="pb-3 font-semibold">Sequence</th>
                  <th scope="col" className="pb-3 font-semibold">Delivery ID</th>
                  <th scope="col" className="pb-3 font-semibold">Customer Site</th>
                  <th scope="col" className="pb-3 font-semibold">Demand Load</th>
                  <th scope="col" className="pb-3 font-semibold">Route ID</th>
                  <th scope="col" className="pb-3 font-semibold">Vehicle / Driver</th>
                  <th scope="col" className="pb-3 font-semibold">Priority</th>
                  <th scope="col" className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,30,50,0.04)]">
                {filteredDeliveries.map((delivery) => {
                  const hasRouteSequence = delivery.sequenceNumber != null

                  return (
                    <tr key={delivery.deliveryId} className="transition hover:bg-black/[0.015]">
                      <td className="py-3.5">
                        {hasRouteSequence ? (
                          <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4778D5]/10 font-mono text-[11px] font-bold text-[#4778D5]"
                            title={`Optimized Stop #${delivery.sequenceNumber}`}
                          >
                            {delivery.sequenceNumber}
                          </span>
                        ) : (
                          <span className="rounded-md border border-[rgba(20,30,50,0.06)] bg-[#F5F6F8] px-2 py-0.5 font-mono text-[10px] text-[#777E87]">
                            Standby
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <p className="font-mono font-medium text-[#17191D]">
                          {delivery.deliveryId}
                        </p>
                        <p className="font-mono text-[10px] text-[#777E87]">
                          {delivery.orderId}
                        </p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-medium text-[#17191D]">
                          {delivery.siteName || delivery.siteId}
                        </p>
                        <p className="max-w-xs truncate text-[11px] text-[#777E87]">
                          {delivery.siteAddress || 'No address specified'}
                        </p>
                      </td>
                      <td className="py-3.5 tabular-nums">
                        <span className="font-medium text-[#17191D]">
                          {Number(delivery.demandWeightKg).toFixed(0)} kg
                        </span>
                        <span className="text-[11px] text-[#777E87]">
                          {' '}· {Number(delivery.demandVolumeM3).toFixed(2)} m³
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs">
                        {delivery.routeId ? (
                          <span className="font-medium text-[#4778D5]">{delivery.routeId}</span>
                        ) : (
                          <span className="text-[#9DA4AE]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 text-xs">
                        {delivery.vehicleId ? (
                          <div>
                            <p className="font-medium text-[#17191D]">{delivery.vehicleId}</p>
                            <p className="text-[10px] text-[#777E87]">{delivery.driverId || 'Driver assigned'}</p>
                          </div>
                        ) : (
                          <span className="text-[#9DA4AE]">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            delivery.priority === 'URGENT'
                              ? 'border-[#C65353]/20 bg-[#C65353]/10 text-[#C65353]'
                              : delivery.priority === 'HIGH'
                                ? 'border-[#C28A35]/20 bg-[#C28A35]/10 text-[#C28A35]'
                                : 'border-[rgba(20,30,50,0.08)] bg-[#F5F6F8] text-[#777E87]'
                          }`}
                        >
                          {delivery.priority}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                            delivery.status === 'PLANNED'
                              ? 'border-[#27865B]/20 bg-[#27865B]/10 text-[#27865B]'
                              : delivery.status === 'PENDING'
                                ? 'border-[#C28A35]/20 bg-[#C28A35]/10 text-[#C28A35]'
                                : delivery.status === 'DELIVERED'
                                  ? 'border-[#4778D5]/20 bg-[#4778D5]/10 text-[#4778D5]'
                                  : 'border-[rgba(20,30,50,0.08)] bg-[#F5F6F8] text-[#777E87]'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-8 text-center text-xs text-[#777E87]">
            <p className="font-semibold text-[#17191D]">
              {deliverySearch || statusFilter !== 'ALL'
                ? 'No matching delivery records'
                : 'No delivery records registered in database'}
            </p>
            <p className="mt-1">
              {deliverySearch || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'Delivery orders registered in PostgreSQL will appear here.'}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[rgba(20,30,50,0.06)] pt-3 text-[11px] text-[#777E87]">
          <span>
            Showing {filteredDeliveries.length} of {deliveries.length} records
          </span>
          <span className="font-mono">Endpoint: /api/v1/deliveries</span>
        </div>
      </div>

      {/* Unserved Deliveries (from active optimization run, if any) */}
      {result && result.unserved && result.unserved.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-7">
          <div className="mb-4 pb-3 border-b border-[rgba(20,30,50,0.06)]">
            <h3 className="font-semibold text-[#C65353]">
              Unserved Delivery Demands ({result.unserved.length})
            </h3>
            <p className="text-xs text-[#777E87]">
              Requests that exceeded vehicle payload or volumetric capacity thresholds
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(20,30,50,0.08)] text-[#777E87]">
                  <th scope="col" className="pb-3 font-semibold">Delivery ID</th>
                  <th scope="col" className="pb-3 font-semibold">Reason</th>
                  <th scope="col" className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,30,50,0.04)]">
                {result.unserved.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-mono font-medium text-[#17191D]">{item.deliveryId}</td>
                    <td className="py-3 text-[11px] text-[#C65353]">{item.reason}</td>
                    <td className="py-3">
                      <span className="rounded-full border border-[#C65353]/20 bg-[#C65353]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#C65353]">
                        UNSERVED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Customer Sites Directory */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(20,30,50,0.06)]">
          <div>
            <h3 className="font-semibold text-[#17191D]">
              Customer Sites & Delivery Destinations
            </h3>
            <p className="mt-0.5 text-xs text-[#777E87]">
              Customer drop-off points and regional coordinates from <code>/api/v1/customer-sites</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-full sm:w-60">
              <input
                id="site-search"
                type="text"
                placeholder="Search sites or IDs..."
                aria-label="Search sites or IDs"
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                className="w-full rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-3 py-2 text-xs text-[#17191D] placeholder:text-[#9DA4AE] outline-none shadow-xs transition focus:border-[#4778D5] focus:ring-2 focus:ring-[#4778D5]/20"
              />
            </div>

            <div>
              <select
                id="site-type-filter"
                aria-label="Filter customer sites by facility type"
                value={siteTypeFilter}
                onChange={(e) => setSiteTypeFilter(e.target.value)}
                className="rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-3 py-2 text-xs text-[#17191D] outline-none shadow-xs transition focus:border-[#4778D5] focus:ring-2 focus:ring-[#4778D5]/20"
              >
                <option value="ALL">All Site Types ({customerSites.length})</option>
                <option value="CUSTOMER">Customer Sites</option>
                <option value="WAREHOUSE">Warehouses</option>
                <option value="DEPOT">Depots</option>
              </select>
            </div>
          </div>
        </div>

        {isLoadingSites ? (
          <p className="py-10 text-center text-xs text-[#777E87]">
            Fetching customer sites from backend...
          </p>
        ) : filteredSites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(20,30,50,0.08)] text-[#777E87]">
                  <th scope="col" className="pb-3 font-semibold">Site ID</th>
                  <th scope="col" className="pb-3 font-semibold">Site Name</th>
                  <th scope="col" className="pb-3 font-semibold">Classification</th>
                  <th scope="col" className="pb-3 font-semibold">Address</th>
                  <th scope="col" className="pb-3 font-semibold">Coordinates</th>
                  <th scope="col" className="pb-3 font-semibold">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,30,50,0.04)]">
                {filteredSites.map((site) => (
                  <tr key={site.siteId} className="transition hover:bg-black/[0.015]">
                    <td className="py-3.5 font-mono font-medium text-[#4778D5]">
                      {site.siteId}
                    </td>
                    <td className="py-3.5 font-medium text-[#17191D]">
                      {site.siteName}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                          site.siteType === 'WAREHOUSE' || site.siteType === 'DEPOT'
                            ? 'border-[#4778D5]/20 bg-[#4778D5]/10 text-[#4778D5]'
                            : 'border-[#27865B]/20 bg-[#27865B]/10 text-[#27865B]'
                        }`}
                      >
                        {site.siteType}
                      </span>
                    </td>
                    <td className="max-w-xs truncate py-3.5 text-[#777E87]">
                      {site.address || '—'}
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-[#777E87]">
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                          site.active
                            ? 'border-[#27865B]/20 bg-[#27865B]/10 text-[#27865B]'
                            : 'border-[rgba(20,30,50,0.08)] bg-[#F5F6F8] text-[#777E87]'
                        }`}
                      >
                        <span className="h-1 w-1 rounded-full bg-current" />
                        {site.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-6 text-center text-xs text-[#777E87]">
            No matching customer sites found.
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[rgba(20,30,50,0.06)] pt-3 text-[11px] text-[#777E87]">
          <span>
            Showing {filteredSites.length} of {customerSites.length} facilities
          </span>
          <span className="font-mono">Endpoint: /api/v1/customer-sites</span>
        </div>
      </div>
    </div>
  )
}
