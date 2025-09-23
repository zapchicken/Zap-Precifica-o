// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import FichasTecnicas from './pages/FichasTecnicas'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import ConfiguracaoMarkup from './pages/ConfiguracaoMarkup'
import DespesasFixas from './pages/DespesasFixas'
import MaoDeObra from './pages/MaoDeObra'
import Insumos from './pages/Insumos'
import Bases from './pages/Bases'
import Fornecedor from './pages/Fornecedor'
import ImportarVendas from './pages/ImportarVendas'
import Sugestoes from './pages/Sugestoes'
import { AuthProvider } from './contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          
          {/* Rota principal - Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Rotas do sistema */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fichas"
            element={
              <ProtectedRoute>
                <FichasTecnicas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/markup"
            element={
              <ProtectedRoute>
                <ConfiguracaoMarkup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/despesas"
            element={
              <ProtectedRoute>
                <DespesasFixas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mao-de-obra"
            element={
              <ProtectedRoute>
                <MaoDeObra />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insumos"
            element={
              <ProtectedRoute>
                <Insumos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bases"
            element={
              <ProtectedRoute>
                <Bases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fornecedor"
            element={
              <ProtectedRoute>
                <Fornecedor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendas"
            element={
              <ProtectedRoute>
                <ImportarVendas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sugestoes"
            element={
              <ProtectedRoute>
                <Sugestoes />
              </ProtectedRoute>
            }
          />
          
          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App