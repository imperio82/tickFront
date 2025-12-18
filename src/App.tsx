import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { AdminRoute } from './components/AdminRoute'
import LoginPage from './modules/auth/login'
import RegistroFormulario from './modules/auth/register'
import { HomeDashboard } from './modules/home/indexHome'
import CompetitorsView from './modules/competitor-analysis/CompetitorsView'
import CompetitorAnalysisForm from './modules/competitor-analysis/CompetitorAnalysisForm'
import CategoryAnalysisForm from './modules/competitor-analysis/CategoryAnalysisForm'
import TrendingAnalysisForm from './modules/competitor-analysis/TrendingAnalysisForm'
import ComparativeAnalysisForm from './modules/competitor-analysis/ComparativeAnalysisForm'
import AnalysisResults from './modules/competitor-analysis/AnalysisResults'
import AnalysisHistory from './modules/history/AnalysisHistory'
import UserProfile from './modules/profile/UserProfile'
import ProfileAnalysisForm from './modules/profile-analysis/ProfileAnalysisForm'
import VideoSelectionStep from './modules/profile-analysis/VideoSelectionStep'
import AnalysisProgress from './modules/profile-analysis/AnalysisProgress'
import InsightsResults from './modules/profile-analysis/InsightsResults'
import AdminDashboard from './modules/admin/AdminDashboard'
import UserManagement from './modules/admin/UserManagement'
import PackageManagement from './modules/admin/PackageManagement'
import TransactionHistory from './modules/admin/TransactionHistory'
import UserHistory from './modules/admin/UserHistory'
import UserCredits from './modules/credits/UserCredits'
import CalendarView from './modules/calendar/CalendarView'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegistroFormulario />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competitors"
        element={
          <ProtectedRoute>
            <CompetitorsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/competitors"
        element={
          <ProtectedRoute>
            <CompetitorAnalysisForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/category"
        element={
          <ProtectedRoute>
            <CategoryAnalysisForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/trending"
        element={
          <ProtectedRoute>
            <TrendingAnalysisForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/comparative"
        element={
          <ProtectedRoute>
            <ComparativeAnalysisForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/profile"
        element={
          <ProtectedRoute>
            <ProfileAnalysisForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:id"
        element={
          <ProtectedRoute>
            <AnalysisResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-analysis/:analysisId/videos"
        element={
          <ProtectedRoute>
            <VideoSelectionStep />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-analysis/:analysisId/progress/:jobId"
        element={
          <ProtectedRoute>
            <AnalysisProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-analysis/:analysisId/insights"
        element={
          <ProtectedRoute>
            <InsightsResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AnalysisHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/credits"
        element={
          <ProtectedRoute>
            <UserCredits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarView />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users/:userId/history"
        element={
          <AdminRoute>
            <UserHistory />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/packages"
        element={
          <AdminRoute>
            <PackageManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <AdminRoute>
            <TransactionHistory />
          </AdminRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 Not Found */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
