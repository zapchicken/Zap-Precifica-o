import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import {
  ShoppingCart,
  Package,
  FileText,
  DollarSign,
  Settings,
  Upload,
  Lightbulb,
  BarChart3,
  Menu,
  Zap,
  Building,
  Users,
  LogOut,
  User
} from "lucide-react"


interface LayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const navigationItems = [
  { id: "dashboard", label: "Painel Geral", icon: BarChart3, color: "text-primary" },
  { id: "produtos", label: "Produtos de Venda", icon: Package, color: "text-success" },
  { id: "fichas", label: "Fichas Técnicas", icon: FileText, color: "text-warning" },
  { id: "markup", label: "Config. Markup", icon: Settings, color: "text-muted-foreground" },
  {
    type: "section",
    label: "Cadastros",
    items: [
      { id: "despesas", label: "Despesas Fixas", icon: DollarSign, color: "text-destructive" },
      { id: "mao-de-obra", label: "Mão de Obra", icon: Users, color: "text-accent" },
      { id: "insumos", label: "Insumos", icon: ShoppingCart, color: "text-accent" },
      { id: "bases", label: "Bases / Prod. Intermediário", icon: Package, color: "text-warning" },
      { id: "fornecedor", label: "Fornecedor", icon: Building, color: "text-success" },
      { id: "vendas", label: "Importar Vendas", icon: Upload, color: "text-primary" },
    ]
  },
  { id: "sugestoes", label: "Sugestões IA", icon: Lightbulb, color: "text-accent" },
]

export function Layout({ children, currentPage = "dashboard" }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()

  // Determinar página atual baseada na rota
  const getCurrentPage = () => {
    const path = location.pathname
    if (path === "/" || path === "/dashboard") return "dashboard"
    if (path === "/produtos") return "produtos"
    if (path === "/fichas") return "fichas"
    if (path === "/markup") return "markup"
    if (path === "/despesas") return "despesas"
    if (path === "/mao-de-obra") return "mao-de-obra"
    if (path === "/insumos") return "insumos"
    if (path === "/bases") return "bases"
    if (path === "/fornecedor") return "fornecedor"
    if (path === "/vendas") return "vendas"
    if (path === "/sugestoes") return "sugestoes"
    return currentPage
  }

  const handleNavigation = (itemId: string) => {
    if (itemId === "dashboard") {
      navigate("/")
    } else {
      navigate(`/${itemId}`)
    }
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/19f1c32f-aef9-4f26-a789-713bf2814b18.png" alt="Zap Chicken" className="h-8 w-8" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Zap Chicken
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden md:flex items-center gap-3 p-6 border-b">
              <img src="/lovable-uploads/19f1c32f-aef9-4f26-a789-713bf2814b18.png" alt="Zap Chicken" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Zap Precificação
                </h1>
                <p className="text-sm text-muted-foreground">Sistema Inteligente</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item, index) => {
                // Se for uma seção
                if (item.type === "section") {
                  return (
                    <div key={index} className="space-y-2">
                      {/* Título da seção */}
                      <div className="px-3 py-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {item.label}
                        </h3>
                      </div>
                      {/* Items da seção */}
                      {item.items?.map((subItem) => {
                        const Icon = subItem.icon
                        const isActive = getCurrentPage() === subItem.id
                        
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleNavigation(subItem.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ml-2",
                              isActive 
                                ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20" 
                                : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className={cn("h-5 w-5", isActive ? "text-primary" : subItem.color)} />
                            <span className="font-medium">{subItem.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )
                }
                
                // Se for um item normal
                const Icon = item.icon
                const isActive = getCurrentPage() === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20" 
                        : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : item.color)} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t bg-secondary/30 space-y-3">
              <div className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
                <User className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Usuário logado</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                <p className="font-medium">🍗 Fast Food Analytics</p>
                <p>Maximize seus lucros!</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <div className="p-4 md:p-8 max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}