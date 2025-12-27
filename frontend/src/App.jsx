import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen app-bg">
          <AppRouter />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
