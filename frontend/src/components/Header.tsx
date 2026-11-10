import React from 'react'
import type { NavigationTab } from '../types'

interface HeaderProps {
  currentTab: NavigationTab
  apiOnline: boolean | null
  isCheckingApi: boolean
  onRefreshApi: () => void
  onOpenMobileMenu: () => void
}

const tabTitles: Record<NavigationTab, { subtitle: string; title: string }> = {
  overview: {
    subtitle: 'OPERATIONS',
    title: 'Control Center Overview',
  },
  planning: {
    subtitle: 'OPTIMIZATION',
    title: 'Route Planning & Dispatch',
  },
  fleet: {
    subtitle: 'ASSETS',
    title: 'Fleet & Vehicle Operations',
  },
  deliveries: {
    subtitle: 'FULFILLMENT',
    title: 'Delivery Records & Sites',
  },
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  apiOnline,
  isCheckingApi,
  onRefreshApi,
  onOpenMobileMenu,
}) => {
  const current = tabTitles[currentTab]

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(20,30,50,0.08)] bg-white/75 px-6 py-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu button (text-only) */}
        <button
          onClick={onOpenMobileMenu}
          className="inline-flex items-center justify-center rounded-lg border border-[rgba(20,30,50,0.12)] bg-white px-3 py-1.5 text-xs font-medium text-[#17191D] hover:bg-[#F5F6F8] transition-colors lg:hidden"
          aria-label="Open navigation menu"
        >
          Menu
        </button>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#777E87]">
            {current.subtitle}
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-[#17191D] sm:text-xl">
            {current.title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* API connection indicator badge */}
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-full border border-[rgba(20,30,50,0.08)] bg-white/90 px-3.5 py-1.5 text-xs font-medium text-[#17191D] shadow-[0_1px_2px_rgba(20,30,50,0.04)]"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              apiOnline === true
                ? 'bg-[#27865B]'
                : apiOnline === false
                  ? 'bg-[#C65353]'
                  : 'bg-[#C28A35]'
            }`}
          />
          <span>
            {apiOnline === true
              ? 'Backend API Connected'
              : apiOnline === false
                ? 'Backend Offline'
                : 'Connecting...'}
          </span>
        </div>

        {/* Text-only refresh button */}
        <button
          onClick={onRefreshApi}
          disabled={isCheckingApi}
          className="inline-flex items-center justify-center rounded-xl border border-[rgba(20,30,50,0.1)] bg-white px-3.5 py-1.5 text-xs font-medium text-[#17191D] shadow-[0_1px_2px_rgba(20,30,50,0.04)] hover:bg-[#F5F6F8] active:scale-[0.98] transition-all disabled:opacity-50"
          title="Refresh backend status"
          aria-label="Refresh backend status"
        >
          {isCheckingApi ? 'Checking...' : 'Check Status'}
        </button>
      </div>
    </header>
  )
}
