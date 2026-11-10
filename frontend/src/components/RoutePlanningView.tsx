import React from 'react'
import type { OptimizationResult } from '../types'

interface RoutePlanningViewProps {
  planningDate: string
  setPlanningDate: (date: string) => void
  scenario: string
  setScenario: (scenario: string) => void
  traffic: string
  setTraffic: (traffic: string) => void
  loading: boolean
  error: string | null
  result: OptimizationResult | null
  onRunOptimization: () => void
  onClearError: () => void
}

export const RoutePlanningView: React.FC<RoutePlanningViewProps> = ({
  planningDate,
  setPlanningDate,
  scenario,
  setScenario,
  traffic,
  setTraffic,
  loading,
  error,
  result,
  onRunOptimization,
  onClearError,
}) => {
  return (
    <div className="space-y-6">
      {/* Estimation Notice Banner */}
      <div className="glass-panel flex items-start justify-between rounded-2xl p-4 text-xs text-[#17191D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4778D5]" />
            <p className="font-semibold text-[#17191D]">
              Routing Engine & Distance Estimation Notice
            </p>
          </div>
          <p className="text-[#777E87] leading-relaxed">
            Distances and travel durations are calculated via Haversine straight-line coordinates and standard dwell-time heuristics. Actual telemetry and road delays may vary.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[rgba(71,120,213,0.2)] bg-[#4778D5]/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#4778D5]">
          Nearest Neighbour v1.0
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Form Configuration Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-7">
          <div className="mb-6 pb-4 border-b border-[rgba(20,30,50,0.06)]">
            <h3 className="font-semibold text-[#17191D]">Run Configuration</h3>
            <p className="mt-0.5 text-xs text-[#777E87]">
              Specify planning constraints and operational scenario
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!loading && planningDate) {
                onRunOptimization()
              }
            }}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="planning-date"
                className="mb-1.5 block text-xs font-medium text-[#17191D]"
              >
                Planning Date <span className="text-[#C65353]">*</span>
              </label>
              <input
                id="planning-date"
                type="date"
                required
                value={planningDate}
                onChange={(e) => {
                  setPlanningDate(e.target.value)
                  if (error) onClearError()
                }}
                className="w-full rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-3.5 py-2.5 text-sm text-[#17191D] outline-none shadow-xs transition focus:border-[#4778D5] focus:ring-2 focus:ring-[#4778D5]/20"
              />
              <p className="mt-1 text-[11px] text-[#777E87]">
                Target schedule date for orders, vehicles, and active driver shifts
              </p>
            </div>

            <div>
              <label
                htmlFor="scenario-name"
                className="mb-1.5 block text-xs font-medium text-[#17191D]"
              >
                Scenario Identifier
              </label>
              <input
                id="scenario-name"
                type="text"
                maxLength={60}
                placeholder="e.g. HYDERABAD_DEMO"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-3.5 py-2.5 text-sm text-[#17191D] placeholder:text-[#9DA4AE] outline-none shadow-xs transition focus:border-[#4778D5] focus:ring-2 focus:ring-[#4778D5]/20"
              />
              <p className="mt-1 text-[11px] text-[#777E87]">
                Logged in audit trails for scenario benchmarking
              </p>
            </div>

            <div>
              <label
                htmlFor="traffic-scenario"
                className="mb-1.5 block text-xs font-medium text-[#17191D]"
              >
                Traffic Profile
              </label>
              <select
                id="traffic-scenario"
                value={traffic}
                onChange={(e) => setTraffic(e.target.value)}
                className="w-full rounded-xl border border-[rgba(20,30,50,0.12)] bg-white px-3.5 py-2.5 text-sm text-[#17191D] outline-none shadow-xs transition focus:border-[#4778D5] focus:ring-2 focus:ring-[#4778D5]/20"
              >
                <option value="NORMAL">Normal Traffic Conditions</option>
                <option value="PEAK">Peak Hour Congestion</option>
                <option value="LOW">Low Traffic / Off-Peak</option>
              </select>
              <p className="mt-1 text-[11px] text-[#777E87]">
                Applies travel duration multipliers across road segments
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !planningDate}
                className="flex w-full items-center justify-center rounded-xl bg-[#4778D5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3B66B7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Executing Route Optimizer...' : 'Run Optimization'}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-[#C65353]/20 bg-[#C65353]/5 p-4 text-xs text-[#C65353]">
                <p className="font-semibold text-[#C65353]">Optimization Error</p>
                <p className="mt-1 leading-relaxed text-[#17191D]">{error}</p>
              </div>
            )}
          </form>

          <div className="mt-6 border-t border-[rgba(20,30,50,0.06)] pt-4 text-xs text-[#777E87]">
            <p className="font-medium text-[#17191D]">Active Engine Rules</p>
            <ul className="mt-1.5 space-y-1 text-[11px]">
              <li>• Greedy nearest-neighbour sequence with depot return</li>
              <li>• Dual-limit payload validation (weight kg + volume m³)</li>
              <li>• Driver shift schedule and availability checks</li>
            </ul>
          </div>
        </div>

        {/* Results Display Panel */}
        <div className="glass-panel flex flex-col rounded-2xl p-6 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[rgba(20,30,50,0.06)]">
            <div>
              <h3 className="font-semibold text-[#17191D]">Optimization Results</h3>
              <p className="mt-0.5 text-xs text-[#777E87]">
                Route sequence, stop order, and dispatch payload
              </p>
            </div>
            {result && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  result.assignedCount > 0
                    ? 'border-[#27865B]/20 bg-[#27865B]/10 text-[#27865B]'
                    : 'border-[#C28A35]/20 bg-[#C28A35]/10 text-[#C28A35]'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {result.assignedCount > 0 ? result.status : 'COMPLETED · NO STOPS'}
              </span>
            )}
          </div>

          {result ? (
            <div className="flex-1 space-y-5">
              {result.assignedCount === 0 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#C28A35]/20 bg-[#C28A35]/5 p-5 text-xs">
                    <p className="font-semibold text-[#C28A35]">
                      No Pending Deliveries for Date
                    </p>
                    <p className="mt-2 leading-relaxed text-[#777E87]">
                      {result.message ||
                        'The optimizer ran successfully, but no pending deliveries were found in the database for the selected date.'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-4 text-xs text-[#777E87]">
                    <p className="text-[11px] font-medium text-[#777E87]">Run ID</p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-[#17191D]">{result.runId}</p>
                    <p className="mt-2 text-[11px] font-medium text-[#777E87]">Algorithm</p>
                    <p className="mt-0.5 font-medium text-[#17191D]">{result.algorithm}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Allocation Header Chips */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5">
                      <p className="text-[11px] font-medium text-[#777E87]">Assigned Vehicle</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-[#4778D5]">
                        {result.vehicleId}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5">
                      <p className="text-[11px] font-medium text-[#777E87]">Assigned Driver</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-[#27865B]">
                        {result.driverId}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3.5 col-span-2 sm:col-span-1">
                      <p className="text-[11px] font-medium text-[#777E87]">Route ID</p>
                      <p className="mt-1 truncate font-mono text-xs font-semibold text-[#17191D]">
                        {result.routeId || 'DRAFT'}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3">
                      <p className="text-[11px] font-medium text-[#777E87]">Assigned</p>
                      <p className="mt-1 text-xl font-bold text-[#17191D] tabular-nums">
                        {result.assignedCount} <span className="text-xs font-normal text-[#777E87]">stops</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3">
                      <p className="text-[11px] font-medium text-[#777E87]">Distance</p>
                      <p className="mt-1 text-xl font-bold text-[#17191D] tabular-nums">
                        {Number(result.totalDistanceKm).toFixed(1)} <span className="text-xs font-normal text-[#777E87]">km</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3">
                      <p className="text-[11px] font-medium text-[#777E87]">Duration</p>
                      <p className="mt-1 text-xl font-bold text-[#17191D] tabular-nums">
                        {result.totalDurationMinutes} <span className="text-xs font-normal text-[#777E87]">min</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-white p-3">
                      <p className="text-[11px] font-medium text-[#777E87]">Payload</p>
                      <p className="mt-1 text-xl font-bold text-[#17191D] tabular-nums">
                        {Number(result.totalWeightKg).toFixed(0)} <span className="text-xs font-normal text-[#777E87]">kg</span>
                      </p>
                    </div>
                  </div>

                  {/* Delivery Stops Sequence (Numbered Text Only, No Icons) */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#17191D]">
                        Stop Sequence ({result.orderedDeliveries.length} stops)
                      </p>
                      <span className="text-[11px] text-[#777E87]">
                        Depot → Stops → Return
                      </span>
                    </div>

                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {result.orderedDeliveries.map((deliveryId, index) => (
                        <div
                          key={deliveryId}
                          className="flex items-center justify-between rounded-xl border border-[rgba(20,30,50,0.06)] bg-white px-4 py-2.5 transition hover:border-[#4778D5]/30 hover:bg-[#F9FAFB]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4778D5]/10 font-mono text-xs font-semibold text-[#4778D5]">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-mono text-xs font-semibold text-[#17191D]">
                                {deliveryId}
                              </p>
                              <p className="text-[11px] text-[#777E87]">
                                Sequence Stop #{index + 1}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-md border border-[rgba(20,30,50,0.08)] bg-[#F5F6F8] px-2 py-0.5 text-[10px] font-medium text-[#777E87]">
                            Stop {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unserved Deliveries (if any) */}
                  {result.unserved && result.unserved.length > 0 && (
                    <div className="rounded-xl border border-[#C65353]/20 bg-[#C65353]/5 p-4">
                      <p className="text-xs font-semibold text-[#C65353]">
                        Unserved Deliveries ({result.unserved.length})
                      </p>
                      <div className="mt-2 space-y-1.5 text-xs">
                        {result.unserved.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[11px]"
                          >
                            <span className="font-mono text-[#17191D]">{item.deliveryId}</span>
                            <span className="font-medium text-[#C65353]">{item.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Run Metadata */}
                  <div className="border-t border-[rgba(20,30,50,0.06)] pt-3 text-[11px] text-[#777E87]">
                    <span>Run Reference: </span>
                    <span className="font-mono text-[#17191D]">{result.runId}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(20,30,50,0.12)] bg-white/50 p-8 text-center">
              <p className="text-sm font-semibold text-[#17191D]">
                Awaiting Run Execution
              </p>
              <p className="mt-1 max-w-xs text-xs text-[#777E87]">
                Select a planning date and click Run Optimization to generate balanced multi-stop routes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
