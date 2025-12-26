import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'
import ProtectedRoute from './components/ProtectedRoute'

const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const FlashcardSets = lazy(() => import('../pages/FlashcardSets'))
const FlashcardSetView = lazy(() => import('../pages/FlashcardSetView'))
const CreateFlashcardSet = lazy(() => import('../pages/CreateFlashcardSet'))
const EditFlashcardSet = lazy(() => import('../pages/EditFlashcardSet'))
const Study = lazy(() => import('../pages/Study'))

const CenteredSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
  </div>
)

export default function AppRouter() {
  return (
    <Suspense fallback={<CenteredSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <FlashcardSets />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <CreateFlashcardSet />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sets/:setId"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <FlashcardSetView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sets/:setId/edit"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <EditFlashcardSet />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sets/:setId/study"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Study />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  )
}

