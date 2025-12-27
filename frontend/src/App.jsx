import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AppRouter from './router/AppRouter'
import BinxoaiDecorations from './components/BinxoaiDecorations'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen app-bg relative">
          <BinxoaiDecorations />
          <div className="relative z-10">
            <AppRouter />
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
