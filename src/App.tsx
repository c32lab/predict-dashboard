import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SWRConfig } from 'swr'
import NavBar from './components/layout/NavBar'

const PredictDashboard = lazy(() => import('./pages/PredictDashboard'))
const PredictionDetailPage = lazy(() => import('./pages/PredictionDetailPage'))
const AccuracyPage = lazy(() => import('./pages/AccuracyPage'))
const ChainPage = lazy(() => import('./pages/ChainPage'))
const BacktestPage = lazy(() => import('./pages/BacktestPage'))
const QualityPage = lazy(() => import('./pages/QualityPage'))
const DecayPage = lazy(() => import('./pages/DecayPage'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))
const ReviewOverviewPage = lazy(() => import('./pages/ReviewOverviewPage'))
const PatternPerformancePage = lazy(() => import('./pages/PatternPerformancePage'))

// Derive the app's base path from production script URLs.
// In production, Vite emits <script src="./assets/index-xxx.js"> which the browser
// resolves relative to the served path. Under /predict/ this becomes
// /predict/assets/index-xxx.js, so we extract "/predict".
// In dev mode (no /assets/ path), returns "" (root).
function getBasename(): string {
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')
  for (const s of scripts) {
    const match = s.src.match(/^https?:\/\/[^/]+(\/.*?)\/assets\//)
    if (match) return match[1] || ''
  }
  return ''
}

const APP_BASENAME = getBasename()

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
      Loading...
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename={APP_BASENAME}>
      <SWRConfig value={{
        onError: (error, key) => { console.error(`[SWR Error] ${key}:`, error.message) },
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}>
        <div className="bg-gray-950 text-gray-100 min-h-screen">
          <NavBar />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<PredictDashboard />} />
              <Route path="/predictions/:id" element={<PredictionDetailPage />} />
              <Route path="/accuracy" element={<AccuracyPage />} />
              <Route path="/chain" element={<ChainPage />} />
              <Route path="/backtest" element={<BacktestPage />} />
              <Route path="/quality" element={<QualityPage />} />
              <Route path="/decay" element={<DecayPage />} />
              <Route path="/review" element={<ReviewOverviewPage />} />
              <Route path="/review/:id" element={<ReviewPage />} />
              <Route path="/patterns" element={<PatternPerformancePage />} />
            </Routes>
          </Suspense>
        </div>
      </SWRConfig>
    </BrowserRouter>
  )
}
export default App
