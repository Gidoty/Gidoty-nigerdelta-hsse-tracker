import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/appshell/TopBar.jsx'
import Drawer from '../components/appshell/Drawer.jsx'
import PlaceholderPanel from '../components/appshell/PlaceholderPanel.jsx'
import PanelSkeleton from '../components/appshell/panels/shared/PanelSkeleton.jsx'
import ConnectivityStatus from '../components/ConnectivityStatus.jsx'
import { DEFAULT_CATEGORY, DEFAULT_PARAMETER, findParameter, getCategory } from '../data/parameters.js'
import { loadRealReports, exportReportsToCsv } from '../utils/dashboardUtils.js'
import { exportEscalationCsv, isAwaitingOperatorResponse } from '../utils/trackerUtils.js'
import { storage } from '../utils/storage.js'

const MOBILE_BREAKPOINT = 768

const PANEL_COMPONENTS = {
  'my-submitted-reports': lazy(() => import('../components/appshell/panels/MySubmittedReportsPanel.jsx')),
  'live-heatmap': lazy(() => import('../components/appshell/panels/LiveHeatmapPanel.jsx')),
  'incident-feed': lazy(() => import('../components/appshell/panels/IncidentFeedPanel.jsx')),
  'response-time-analytics': lazy(() => import('../components/appshell/panels/ResponseTimeAnalyticsPanel.jsx')),
  'cleanup-status-board': lazy(() => import('../components/appshell/panels/CleanupBoardPanel.jsx')),
  'methane-emissions': lazy(() => import('../components/appshell/panels/MethaneEmissionsPanel.jsx')),
  'co2-equivalent': lazy(() => import('../components/appshell/panels/Co2EquivalentPanel.jsx')),
  'co2-from-combustion': lazy(() => import('../components/appshell/panels/Co2CombustionPanel.jsx')),
  'community-symptom-monitor': lazy(() => import('../components/appshell/panels/CommunitySymptomMonitorPanel.jsx')),
  'who-aqg-reference-panel': lazy(() => import('../components/appshell/panels/WhoAqgReferencePanel.jsx')),
  'affected-population-counter': lazy(() => import('../components/appshell/panels/AffectedPopulationCounterPanel.jsx')),
  'nosdra-notification-letter': lazy(() => import('../components/appshell/panels/NosdraNotificationLetterPanel.jsx')),
  'foi-request-document': lazy(() => import('../components/appshell/panels/FoiRequestDocumentPanel.jsx')),
  'methane-emission-report': lazy(() => import('../components/appshell/panels/MethaneEmissionReportPanel.jsx')),
  'csv-data-export': lazy(() => import('../components/appshell/panels/CsvDataExportPanel.jsx')),
}

const FULL_BLEED_PANELS = new Set(['live-heatmap', 'incident-feed'])

function loadLastParam() {
  const stored = storage.getLastParam()
  if (stored && findParameter(stored.parameter)) return stored
  return { category: DEFAULT_CATEGORY, parameter: DEFAULT_PARAMETER }
}

export default function AppShell() {
  const navigate = useNavigate()
  const initial = useMemo(() => loadLastParam(), [])

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState(initial.category)
  const [activeParameterId, setActiveParameterId] = useState(initial.parameter)
  const [reports, setReports] = useState(() => loadRealReports())

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && drawerOpen) setDrawerOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen])

  useEffect(() => {
    const handleDataUpdated = (event) => setReports(event.detail.reports)
    window.addEventListener('hsse-data-updated', handleDataUpdated)
    // Cross-tab fallback: CustomEvent only fires within this tab, so keep polling
    // for changes made to hsse_reports from another tab or window.
    const interval = setInterval(() => setReports(loadRealReports()), 30000)
    return () => {
      window.removeEventListener('hsse-data-updated', handleDataUpdated)
      clearInterval(interval)
    }
  }, [])

  const activeCategory = getCategory(activeCategoryId) ?? getCategory(DEFAULT_CATEGORY)
  const activeParameterEntry = findParameter(activeParameterId)
  const activeParameter =
    activeParameterEntry?.parameter ?? findParameter(DEFAULT_PARAMETER).parameter

  const handleSelectParameter = useCallback(
    (categoryId, parameterId) => {
      if (parameterId === 'submit-new-incident') {
        navigate('/report')
        setDrawerOpen(false)
        return
      }

      setActiveCategoryId(categoryId)
      setActiveParameterId(parameterId)
      storage.setLastParam({ category: categoryId, parameter: parameterId })

      if (window.innerWidth < MOBILE_BREAKPOINT) setDrawerOpen(false)
    },
    [navigate],
  )

  const handleToggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), [])
  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), [])

  const overdueReports = reports.filter(isAwaitingOperatorResponse)

  const quickAction = useMemo(() => {
    const label = activeCategory.quickAction
    if (activeCategory.id === 'TRACK') {
      return { label, onClick: () => exportEscalationCsv(reports) }
    }
    if (activeCategory.id === 'DATA') {
      return { label, onClick: () => exportReportsToCsv(reports) }
    }
    if (activeCategory.id === 'REPORT' || activeCategory.id === 'MONITOR' || activeCategory.id === 'HEALTH') {
      return { label, onClick: () => navigate('/report') }
    }
    return { label, onClick: () => {}, disabled: true }
  }, [activeCategory, reports, navigate])

  const PanelComponent = PANEL_COMPONENTS[activeParameter.panel]

  return (
    <div className="fixed inset-0 flex flex-col bg-bg text-text print:static print:h-auto print:overflow-visible">
      <TopBar
        drawerOpen={drawerOpen}
        onToggleDrawer={handleToggleDrawer}
        category={activeCategory}
        parameter={activeParameter}
        quickAction={quickAction}
        overdueReports={overdueReports}
      />

      <Drawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        activeParameterId={activeParameterId}
        onSelectParameter={handleSelectParameter}
        reportsCount={reports.length}
      />

      {drawerOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 top-14 z-[150] bg-black/70 md:hidden"
          onClick={handleCloseDrawer}
          aria-hidden="true"
        />
      )}

      <div className="fixed inset-x-0 top-14 z-[90] print:hidden">
        <ConnectivityStatus />
      </div>

      <div
        className={`flex-1 overflow-hidden pt-14 transition-[margin] duration-300 ease-in-out print:static print:ml-0 print:h-auto print:overflow-visible print:pt-0 ${
          drawerOpen ? 'md:ml-[300px]' : 'ml-0'
        }`}
      >
        <div
          key={activeParameterId}
          className={`panel-enter h-full print:h-auto print:overflow-visible ${
            FULL_BLEED_PANELS.has(activeParameter.panel) ? '' : 'overflow-y-auto p-3 sm:p-4 lg:p-6'
          }`}
        >
          {PanelComponent ? (
            <Suspense fallback={<PanelSkeleton />}>
              <PanelComponent />
            </Suspense>
          ) : (
            <PlaceholderPanel parameter={activeParameter} category={activeCategory} />
          )}
        </div>
      </div>
    </div>
  )
}
