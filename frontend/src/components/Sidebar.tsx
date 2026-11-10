import React from 'react'
import type { NavigationTab } from '../types'

interface SidebarProps {
  currentTab: NavigationTab
  onSelectTab: (tab: NavigationTab) => void
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  id: NavigationTab
  label: string
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'planning', label: 'Route Planning' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'deliveries', label: 'Deliveries' },
]

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const handleNavClick = (tabId: NavigationTab) => {
    onSelectTab(tabId)
    onClose()
  }

  const content = (
    <div className="flex h-full flex-col p-6">
      {/* Brand Header (Text-only wordmark) */}
      <div className="flex items-center justify-between pb-6 border-b border-[rgba(20,30,50,0.06)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4778D5]" />
            <h1 className="text-base font-semibold tracking-tight text-[#17191D]">
              RoutePilot
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-[#777E87]">
            Logistics Intelligence
          </p>
        </div>

        {/* Mobile close button (text-only) */}
        <button
          onClick={onClose}
          className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium text-[#777E87] hover:bg-black/5 hover:text-[#17191D] transition-colors lg:hidden"
          aria-label="Close navigation"
        >
          Close
        </button>
      </div>

      {/* Navigation Section */}
      <div className="mt-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#777E87]">
          Workspace
        </p>

        <nav className="space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#4778D5]/10 text-[#4778D5] font-semibold'
                    : 'text-[#17191D] hover:bg-black/[0.04] text-opacity-80 hover:text-opacity-100'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4778D5]" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Engine & Status Section */}
      <div className="mt-auto space-y-3 pt-6 border-t border-[rgba(20,30,50,0.06)]">
        <div className="rounded-xl border border-[rgba(20,30,50,0.06)] bg-[#F5F6F8]/80 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#777E87]">Algorithm</span>
            <span className="font-medium text-[#27865B] text-[11px]">Ready</span>
          </div>
          <p className="mt-1 font-semibold text-[#17191D]">Nearest Neighbour</p>
          <p className="mt-0.5 text-[11px] text-[#777E87] leading-relaxed">
            Haversine routing heuristic with capacity constraints
          </p>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-[#777E87]">
          <span>Spring Boot Platform</span>
          <span className="font-mono text-[#17191D]">v4.1.2</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[rgba(20,30,50,0.08)] bg-white/80 backdrop-blur-md lg:block">
        {content}
      </aside>

      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[rgba(20,30,50,0.08)] bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  )
}
