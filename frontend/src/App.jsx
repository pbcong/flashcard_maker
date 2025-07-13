import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <AppRouter />
      </div>
    </AuthProvider>
  )
}

export default App
