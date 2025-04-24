import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import FlashcardSets from './components/FlashcardSets'
import FlashcardSetView from './components/FlashcardSetView'
import CreateFlashcardSet from './components/CreateFlashcardSet'
import EditFlashcardSet from './components/EditFlashcardSet'
import Navbar from './components/Navbar'

// Protected route component
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" />
  }
  return children
}

// Layout component for authenticated pages
function AuthenticatedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function AppRoutes() {
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

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App
