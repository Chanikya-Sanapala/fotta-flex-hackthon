import { useCallback, useEffect, useState } from 'react'
import type { CustomerSite, DeliveryRecord, FleetVehicle, NavigationTab, OptimizationResult } from './types'
import {
  checkBackendHealth,
  fetchCustomerSites,
  fetchDeliveries,
  fetchFleet,
  formatApiError,
  runOptimizationApi,
} from './services/api'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { OverviewView } from './components/OverviewView'
import { RoutePlanningView } from './components/RoutePlanningView'
import { FleetView } from './components/FleetView'
import { DeliveriesView } from './components/DeliveriesView'

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Planning form state
  const [planningDate, setPlanningDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [scenario, setScenario] = useState('HYDERABAD_DEMO')
  const [traffic, setTraffic] = useState('NORMAL')

  // Optimization state
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Backend state
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [isCheckingApi, setIsCheckingApi] = useState(false)

  // Customer sites state
  const [customerSites, setCustomerSites] = useState<CustomerSite[]>([])
  const [isLoadingSites, setIsLoadingSites] = useState(false)

  // Delivery records state
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false)
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null)

  // Fleet state
  const [fleet, setFleet] = useState<FleetVehicle[]>([])
  const [isLoadingFleet, setIsLoadingFleet] = useState(false)
  const [fleetError, setFleetError] = useState<string | null>(null)

  const loadDeliveries = useCallback(async () => {
    setIsLoadingDeliveries(true)
    setDeliveriesError(null)
    try {
      const data = await fetchDeliveries()
      setDeliveries(data)
    } catch (err) {
      setDeliveriesError(formatApiError(err))
    } finally {
      setIsLoadingDeliveries(false)
    }
  }, [])

  const loadFleet = useCallback(async () => {
    setIsLoadingFleet(true)
    setFleetError(null)
    try {
      const data = await fetchFleet()
      setFleet(data)
    } catch (err) {
      setFleetError(formatApiError(err))
    } finally {
      setIsLoadingFleet(false)
    }
  }, [])

  async function checkBackend() {
    setIsCheckingApi(true)
    try {
      const isOnline = await checkBackendHealth()
      setApiOnline(isOnline)
      if (isOnline) {
        if (customerSites.length === 0) {
          setIsLoadingSites(true)
          try {
            const sites = await fetchCustomerSites()
            setCustomerSites(sites)
          } finally {
            setIsLoadingSites(false)
          }
        }
        void loadDeliveries()
        void loadFleet()
      }
    } finally {
      setIsCheckingApi(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const initData = async () => {
      const [isOnline, sitesResult, deliveriesResult, fleetResult] = await Promise.allSettled([
        checkBackendHealth(),
        fetchCustomerSites(),
        fetchDeliveries(),
        fetchFleet(),
      ])

      if (!isMounted) return

      if (isOnline.status === 'fulfilled') {
        setApiOnline(isOnline.value)
      } else {
        setApiOnline(false)
      }

      if (sitesResult.status === 'fulfilled') {
        setCustomerSites(sitesResult.value)
      }

      if (deliveriesResult.status === 'fulfilled') {
        setDeliveries(deliveriesResult.value)
      } else if (deliveriesResult.status === 'rejected') {
        setDeliveriesError(formatApiError(deliveriesResult.reason))
      }

      if (fleetResult.status === 'fulfilled') {
        setFleet(fleetResult.value)
      } else if (fleetResult.status === 'rejected') {
        setFleetError(formatApiError(fleetResult.reason))
      }
    }

    void initData()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleRunOptimization() {
    if (loading || !planningDate) return

    setLoading(true)
    setError(null)

    try {
      const response = await runOptimizationApi({
        planningDate,
        scenarioName: scenario.trim() || 'DEFAULT',
        trafficScenario: traffic,
      })
      setResult(response)
      setApiOnline(true)
      void loadDeliveries()
      void loadFleet()
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#17191D]">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main layout */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Header bar */}
        <Header
          currentTab={currentTab}
          apiOnline={apiOnline}
          isCheckingApi={isCheckingApi}
          onRefreshApi={checkBackend}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* View container */}
        <main className="flex-1 p-5 sm:p-8">
          {currentTab === 'overview' && (
            <OverviewView
              result={result}
              customerSites={customerSites}
              isLoadingSites={isLoadingSites}
              apiOnline={apiOnline}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'planning' && (
            <RoutePlanningView
              planningDate={planningDate}
              setPlanningDate={setPlanningDate}
              scenario={scenario}
              setScenario={setScenario}
              traffic={traffic}
              setTraffic={setTraffic}
              loading={loading}
              error={error}
              result={result}
              onRunOptimization={handleRunOptimization}
              onClearError={() => setError(null)}
            />
          )}

          {currentTab === 'fleet' && (
            <FleetView
              fleet={fleet}
              isLoadingFleet={isLoadingFleet}
              fleetError={fleetError}
              customerSites={customerSites}
              isLoadingSites={isLoadingSites}
              onRefreshFleet={loadFleet}
            />
          )}

          {currentTab === 'deliveries' && (
            <DeliveriesView
              result={result}
              deliveries={deliveries}
              isLoadingDeliveries={isLoadingDeliveries}
              deliveriesError={deliveriesError}
              onRefreshDeliveries={loadDeliveries}
              customerSites={customerSites}
              isLoadingSites={isLoadingSites}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[rgba(20,30,50,0.06)] bg-white/40 px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#777E87]">
            <span className="font-medium text-[#17191D]">RoutePilot · Logistics Optimization Platform</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    apiOnline ? 'bg-[#27865B]' : 'bg-[#777E87]'
                  }`}
                />
                Spring Boot API (Port 8080)
              </span>
              <span>React 19 + Vite</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
