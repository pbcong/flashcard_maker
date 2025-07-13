import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import FlashcardSets from '../pages/FlashcardSets'
import FlashcardSetView from '../pages/FlashcardSetView'
import CreateFlashcardSet from '../pages/CreateFlashcardSet'
import EditFlashcardSet from '../pages/EditFlashcardSet'
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'
import ProtectedRoute from './components/ProtectedRoute'

export default function AppRouter() {
  return (
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
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
