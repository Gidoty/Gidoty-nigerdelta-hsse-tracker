import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import PageLoader from './components/PageLoader.jsx'
import ConnectivityStatus from './components/ConnectivityStatus.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Report = lazy(() => import('./pages/Report.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const AppShell = lazy(() => import('./pages/AppShell.jsx'))

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1 pt-20 print:pt-0">
        <ConnectivityStatus />
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/about" element={<About />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<PageLoader />}>
            <AppShell />
          </Suspense>
        }
      />

      {/* Old routes from the previous multi-page architecture now live inside /app */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="/tracker" element={<Navigate to="/dashboard" replace />} />
      <Route path="/methane" element={<Navigate to="/dashboard" replace />} />
      <Route path="/data" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
