import { useState } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useMaoDeObra } from "@/hooks/useMaoDeObra"
import { 
  Users, 
  Plus, 
  Trash2, 
  Calculator, 
  Share,
  Save,
  UserCheck,
  Briefcase,
  Clock,
  Edit
} from "lucide-react"

export default function MaoDeObra() {
  const { toast } = useToast()
  
  // Hook do Supabase
  const {
    loading,
    prolabores,
    funcionarios,
    freelancers,
    adicionarProlabore,
    adicionarFuncionario,
    adicionarFreelancer,
    atualizarProlabore,
    atualizarFuncionario,
    atualizarFreelancer,
    removerProlabore,
    removerFuncionario,
    removerFreelancer,
    calcularCustoFuncionario,
    totalProlabore,
    totalFuncionarios,
    totalFreelancers,
    totalGeral
  } = useMaoDeObra()

  // Formulários
  const [formProlabore, setFormProlabore] = useState({
    nome_socio: '',
    valor_mensal: 0
  })

  const [formFuncionario, setFormFuncionario] = useState({
    nome: '',
    cargo: '',
    salario_bruto: 0,
    quantidade: 1,
    vale_transporte: 0,
    vale_refeicao_por_dia: 0,
    vale_refeicao_mensal: 0,
    plano_saude: 0,
    seguro_vida: 0,
    treinamento: 0,
    uniformes: 0,
    outros_beneficios: 0,
    horas_extras: 0,
    horas_noturnas_por_dia: 0,
    dias_semana: 6
  })

  const [formFreelancer, setFormFreelancer] = useState({
    funcao: '',
    valor_diaria: 0,
    quantidade_pessoas: 1,
    dias_mes: 0
  })

  // Estados para edição
  const [editandoFuncionario, setEditandoFuncionario] = useState<string | null>(null)
  const [editandoProlabore, setEditandoProlabore] = useState<string | null>(null)
  const [editandoFreelancer, setEditandoFreelancer] = useState<string | null>(null)

  // Funções para adicionar itens
  const handleAdicionarProlabore = async () => {
    if (!formProlabore.nome_socio || formProlabore.valor_mensal <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do prolabore",
        variant: "destructive"
      })
      return
    }

    try {
      await adicionarProlabore(formProlabore)
      setFormProlabore({ nome_socio: '', valor_mensal: 0 })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleAdicionarFuncionario = async () => {
    if (!formFuncionario.nome || !formFuncionario.cargo || formFuncionario.salario_bruto <= 0) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios do funcionário",
        variant: "destructive"
      })
      return
    }

    try {
      await adicionarFuncionario(formFuncionario)
      setFormFuncionario({
        nome: '',
        cargo: '',
        salario_bruto: 0,
        quantidade: 1,
        vale_transporte: 0,
        vale_refeicao_por_dia: 0,
        vale_refeicao_mensal: 0,
        plano_saude: 0,
        seguro_vida: 0,
        treinamento: 0,
        uniformes: 0,
        outros_beneficios: 0,
        horas_extras: 0,
        horas_noturnas_por_dia: 0,
        dias_semana: 6
      })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleAdicionarFreelancer = async () => {
    if (!formFreelancer.funcao || formFreelancer.valor_diaria <= 0 || formFreelancer.dias_mes <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do freelancer",
        variant: "destructive"
      })
      return
    }

    try {
      await adicionarFreelancer(formFreelancer)
      setFormFreelancer({ funcao: '', valor_diaria: 0, quantidade_pessoas: 1, dias_mes: 0 })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  // Funções para editar itens
  const handleEditarFuncionario = (funcionario: any) => {
    setEditandoFuncionario(funcionario.id)
    setFormFuncionario({
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      salario_bruto: funcionario.salario_bruto,
      quantidade: funcionario.quantidade,
      vale_transporte: funcionario.vale_transporte,
      vale_refeicao_por_dia: funcionario.vale_refeicao_por_dia || 0,
      vale_refeicao_mensal: funcionario.vale_refeicao_mensal || 0,
      plano_saude: funcionario.plano_saude,
      seguro_vida: funcionario.seguro_vida,
      treinamento: funcionario.treinamento,
      uniformes: funcionario.uniformes,
      outros_beneficios: funcionario.outros_beneficios,
      horas_extras: funcionario.horas_extras,
      horas_noturnas_por_dia: funcionario.horas_noturnas_por_dia,
      dias_semana: funcionario.dias_semana
    })
  }

  const handleSalvarEdicaoFuncionario = async () => {
    if (!editandoFuncionario) return

    try {
      await atualizarFuncionario(editandoFuncionario, formFuncionario)
      setEditandoFuncionario(null)
      setFormFuncionario({
        nome: '',
        cargo: '',
        salario_bruto: 0,
        quantidade: 1,
        vale_transporte: 0,
        vale_refeicao_por_dia: 0,
        vale_refeicao_mensal: 0,
        plano_saude: 0,
        seguro_vida: 0,
        treinamento: 0,
        uniformes: 0,
        outros_beneficios: 0,
        horas_extras: 0,
        horas_noturnas_por_dia: 0,
        dias_semana: 6
      })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleEditarProlabore = (prolabore: any) => {
    setEditandoProlabore(prolabore.id)
    setFormProlabore({
      nome_socio: prolabore.nome_socio,
      valor_mensal: prolabore.valor_mensal
    })
  }

  const handleSalvarEdicaoProlabore = async () => {
    if (!editandoProlabore) return

    try {
      await atualizarProlabore(editandoProlabore, formProlabore)
      setEditandoProlabore(null)
      setFormProlabore({ nome_socio: '', valor_mensal: 0 })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleEditarFreelancer = (freelancer: any) => {
    setEditandoFreelancer(freelancer.id)
    setFormFreelancer({
      funcao: freelancer.funcao,
      valor_diaria: freelancer.valor_diaria,
      quantidade_pessoas: freelancer.quantidade_pessoas,
      dias_mes: freelancer.dias_mes
    })
  }

  const handleSalvarEdicaoFreelancer = async () => {
    if (!editandoFreelancer) return

    try {
      await atualizarFreelancer(editandoFreelancer, formFreelancer)
      setEditandoFreelancer(null)
      setFormFreelancer({ funcao: '', valor_diaria: 0, quantidade_pessoas: 1, dias_mes: 0 })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  // Função para calcular vale-refeição mensal automaticamente
  const calcularValeRefeicaoMensal = (valorPorDia: number, diasSemana: number) => {
    return valorPorDia * diasSemana * 4.33 // 4.33 semanas por mês
  }

  const handleCancelarEdicao = () => {
    setEditandoFuncionario(null)
    setEditandoProlabore(null)
    setEditandoFreelancer(null)
    setFormFuncionario({
      nome: '',
      cargo: '',
      salario_bruto: 0,
      quantidade: 1,
      vale_transporte: 0,
      vale_refeicao_por_dia: 0,
      vale_refeicao_mensal: 0,
      plano_saude: 0,
      seguro_vida: 0,
      treinamento: 0,
      uniformes: 0,
      outros_beneficios: 0,
      horas_extras: 0,
      horas_noturnas_por_dia: 0,
      dias_semana: 6
    })
    setFormProlabore({ nome_socio: '', valor_mensal: 0 })
    setFormFreelancer({ funcao: '', valor_diaria: 0, quantidade_pessoas: 1, dias_mes: 0 })
  }

  // Função para compartilhar no WhatsApp
  const compartilharWhatsApp = () => {
    let mensagem = "📊 *RELATÓRIO DE MÃO DE OBRA*\n\n"
    
    if (prolabores.length > 0) {
      mensagem += "👥 *PROLABORE:*\n"
      prolabores.forEach(p => {
        mensagem += `• ${p.nome_socio}: R$ ${p.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` + "\n"
      })
      mensagem += `*Subtotal Prolabore:* R$ ${totalProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` + "\n\n"
    }

    if (funcionarios.length > 0) {
      mensagem += "👔 *FUNCIONÁRIOS CLT:*\n"
      funcionarios.forEach(f => {
        const { custoTotal } = calcularCustoFuncionario(f)
        mensagem += `• ${f.nome} (${f.cargo}) - ${f.quantidade}x: R$ ${custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` + "\n"
      })
      mensagem += `*Subtotal Funcionários:* R$ ${totalFuncionarios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` + "\n\n"
    }

    if (freelancers.length > 0) {
      mensagem += "🎯 *FREELANCERS:*\n"
      freelancers.forEach(f => {
        const total = f.valor_diaria * f.quantidade_pessoas * f.dias_mes
        mensagem += `• ${f.funcao} (${f.quantidade_pessoas}x - ${f.dias_mes} dias): R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` + "\n"
      })
      mensagem += `*Subtotal Freelancers:* R$ ${totalFreelancers.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` + "\n\n"
    }

    mensagem += `💰 *TOTAL GERAL:* R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  return (
    <Layout currentPage="mao-de-obra">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mão de Obra
            </h1>
            <p className="text-muted-foreground mt-1">
              Calcule os custos completos de prolabore, funcionários CLT e freelancers
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={compartilharWhatsApp}>
              <Share className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button>
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prolabore</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {totalProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funcionários CLT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {totalFuncionarios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Freelancers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                R$ {totalFreelancers.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção Prolabore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Prolabore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeSocio">Nome do Sócio *</Label>
                <Input
                  id="nomeSocio"
                  value={formProlabore.nome_socio}
                  onChange={(e) => setFormProlabore(prev => ({ ...prev, nome_socio: e.target.value }))}
                  placeholder="Nome do sócio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorProlabore">Valor Mensal (R$) *</Label>
                <Input
                  id="valorProlabore"
                  type="number"
                  value={formProlabore.valor_mensal || ''}
                  onChange={(e) => setFormProlabore(prev => ({ ...prev, valor_mensal: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAdicionarProlabore} className="w-full" disabled={loading}>
                  <Plus className="h-4 w-4" />
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </div>

            {/* Lista de Prolabores */}
            {prolabores.length > 0 && (
              <div className="space-y-2">
                <Separator />
                <h4 className="font-medium text-sm text-muted-foreground">Prolabores Cadastrados</h4>
                {prolabores.map((prolabore) => (
                  <div key={prolabore.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{prolabore.nome_socio}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {prolabore.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarProlabore(prolabore)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Prolabore - {prolabore.nome_socio}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="editNomeSocio">Nome do Sócio *</Label>
                              <Input
                                id="editNomeSocio"
                                value={formProlabore.nome_socio}
                                onChange={(e) => setFormProlabore(prev => ({ ...prev, nome_socio: e.target.value }))}
                                placeholder="Nome do sócio"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="editValorProlabore">Valor Mensal (R$) *</Label>
                              <Input
                                id="editValorProlabore"
                                type="number"
                                value={formProlabore.valor_mensal || ''}
                                onChange={(e) => setFormProlabore(prev => ({ ...prev, valor_mensal: parseFloat(e.target.value) || 0 }))}
                                placeholder="0,00"
                              />
                            </div>

                            <div className="flex gap-4 justify-end">
                              <Button variant="outline" onClick={handleCancelarEdicao}>
                                Cancelar
                              </Button>
                              <Button onClick={handleSalvarEdicaoProlabore} disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removerProlabore(prolabore.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção Funcionários CLT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-success" />
              Funcionários CLT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Formulário para novo funcionário */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeFuncionario">Nome do Funcionário *</Label>
                  <Input
                    id="nomeFuncionario"
                    value={formFuncionario.nome}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Input
                    id="cargo"
                    value={formFuncionario.cargo}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, cargo: e.target.value }))}
                    placeholder="Ex: Atendente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salarioBruto">Salário Bruto (R$) *</Label>
                  <Input
                    id="salarioBruto"
                    type="number"
                    value={formFuncionario.salario_bruto || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, salario_bruto: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formFuncionario.quantidade || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Benefícios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valeTransporte">Vale-Transporte (R$)</Label>
                  <Input
                    id="valeTransporte"
                    type="number"
                    value={formFuncionario.vale_transporte || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, vale_transporte: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valeRefeicaoPorDia">Vale-Refeição por Dia (R$)</Label>
                  <Input
                    id="valeRefeicaoPorDia"
                    type="number"
                    value={formFuncionario.vale_refeicao_por_dia || ''}
                    onChange={(e) => {
                      const valorPorDia = parseFloat(e.target.value) || 0
                      const valorMensal = calcularValeRefeicaoMensal(valorPorDia, formFuncionario.dias_semana)
                      setFormFuncionario(prev => ({ 
                        ...prev, 
                        vale_refeicao_por_dia: valorPorDia,
                        vale_refeicao_mensal: valorMensal
                      }))
                    }}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cálculo automático: {((formFuncionario.vale_refeicao_por_dia || 0) * (formFuncionario.dias_semana || 6) * 4.33).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planoSaude">Plano de Saúde (R$)</Label>
                  <Input
                    id="planoSaude"
                    type="number"
                    value={formFuncionario.plano_saude || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, plano_saude: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seguroVida">Seguro de Vida (R$)</Label>
                  <Input
                    id="seguroVida"
                    type="number"
                    value={formFuncionario.seguro_vida || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, seguro_vida: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treinamento">Treinamento (R$)</Label>
                  <Input
                    id="treinamento"
                    type="number"
                    value={formFuncionario.treinamento || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, treinamento: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniformes">Uniformes/EPIs (R$)</Label>
                  <Input
                    id="uniformes"
                    type="number"
                    value={formFuncionario.uniformes || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, uniformes: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outrosBeneficios">Outros Benefícios (R$)</Label>
                  <Input
                    id="outrosBeneficios"
                    type="number"
                    value={formFuncionario.outros_beneficios || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, outros_beneficios: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horasExtras">Horas Extras/Mês</Label>
                  <Input
                    id="horasExtras"
                    type="number"
                    value={formFuncionario.horas_extras || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, horas_extras: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horasNoturnasPorDia">Horas noturnas por dia</Label>
                  <Input
                    id="horasNoturnasPorDia"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formFuncionario.horas_noturnas_por_dia || ''}
                    onChange={(e) => setFormFuncionario(prev => ({ ...prev, horas_noturnas_por_dia: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diasSemana">Dias trabalhados por semana</Label>
                  <Input
                    id="diasSemana"
                    type="number"
                    min="0"
                    max="7"
                    step="1"
                    value={formFuncionario.dias_semana || ''}
                    onChange={(e) => {
                      const diasSemana = parseInt(e.target.value) || 0
                      const valorMensal = calcularValeRefeicaoMensal(formFuncionario.vale_refeicao_por_dia, diasSemana)
                      setFormFuncionario(prev => ({ 
                        ...prev, 
                        dias_semana: diasSemana,
                        vale_refeicao_mensal: valorMensal
                      }))
                    }}
                    placeholder="6"
                  />
                </div>
              </div>

              <Button onClick={handleAdicionarFuncionario} className="w-full md:w-auto" disabled={loading}>
                <Plus className="h-4 w-4" />
                {loading ? 'Adicionando...' : 'Adicionar Funcionário'}
              </Button>
            </div>

            {/* Lista de Funcionários */}
            {funcionarios.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h4 className="font-medium text-sm text-muted-foreground">Funcionários Cadastrados</h4>
                {funcionarios.map((funcionario) => {
                  const calculos = calcularCustoFuncionario(funcionario)
                  return (
                    <div key={funcionario.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{funcionario.nome}</h5>
                          <p className="text-sm text-muted-foreground">
                            {funcionario.cargo} • {funcionario.quantidade}x funcionário(s)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditarFuncionario(funcionario)}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Funcionário - {funcionario.nome}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Formulário de edição */}
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="editNomeFuncionario">Nome do Funcionário *</Label>
                                      <Input
                                        id="editNomeFuncionario"
                                        value={formFuncionario.nome}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, nome: e.target.value }))}
                                        placeholder="Nome completo"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="editCargo">Cargo *</Label>
                                      <Input
                                        id="editCargo"
                                        value={formFuncionario.cargo}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, cargo: e.target.value }))}
                                        placeholder="Ex: Atendente"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editSalarioBruto">Salário Bruto (R$) *</Label>
                                      <Input
                                        id="editSalarioBruto"
                                        type="number"
                                        value={formFuncionario.salario_bruto || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, salario_bruto: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editQuantidade">Quantidade *</Label>
                                      <Input
                                        id="editQuantidade"
                                        type="number"
                                        min="1"
                                        value={formFuncionario.quantidade || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                                        placeholder="1"
                                      />
                                    </div>
                                  </div>

                                  {/* Benefícios */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="editValeTransporte">Vale-Transporte (R$)</Label>
                                      <Input
                                        id="editValeTransporte"
                                        type="number"
                                        value={formFuncionario.vale_transporte || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, vale_transporte: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editValeRefeicaoPorDia">Vale-Refeição por Dia (R$)</Label>
                                      <Input
                                        id="editValeRefeicaoPorDia"
                                        type="number"
                                        value={formFuncionario.vale_refeicao_por_dia || ''}
                                        onChange={(e) => {
                                          const valorPorDia = parseFloat(e.target.value) || 0
                                          const valorMensal = calcularValeRefeicaoMensal(valorPorDia, formFuncionario.dias_semana)
                                          setFormFuncionario(prev => ({ 
                                            ...prev, 
                                            vale_refeicao_por_dia: valorPorDia,
                                            vale_refeicao_mensal: valorMensal
                                          }))
                                        }}
                                        placeholder="0,00"
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        Cálculo automático: {((formFuncionario.vale_refeicao_por_dia || 0) * (formFuncionario.dias_semana || 6) * 4.33).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês
                                      </p>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editPlanoSaude">Plano de Saúde (R$)</Label>
                                      <Input
                                        id="editPlanoSaude"
                                        type="number"
                                        value={formFuncionario.plano_saude || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, plano_saude: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editSeguroVida">Seguro de Vida (R$)</Label>
                                      <Input
                                        id="editSeguroVida"
                                        type="number"
                                        value={formFuncionario.seguro_vida || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, seguro_vida: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editTreinamento">Treinamento (R$)</Label>
                                      <Input
                                        id="editTreinamento"
                                        type="number"
                                        value={formFuncionario.treinamento || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, treinamento: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editUniformes">Uniformes/EPIs (R$)</Label>
                                      <Input
                                        id="editUniformes"
                                        type="number"
                                        value={formFuncionario.uniformes || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, uniformes: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editOutrosBeneficios">Outros Benefícios (R$)</Label>
                                      <Input
                                        id="editOutrosBeneficios"
                                        type="number"
                                        value={formFuncionario.outros_beneficios || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, outros_beneficios: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editHorasExtras">Horas Extras/Mês</Label>
                                      <Input
                                        id="editHorasExtras"
                                        type="number"
                                        value={formFuncionario.horas_extras || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, horas_extras: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="editHorasNoturnasPorDia">Horas noturnas por dia</Label>
                                      <Input
                                        id="editHorasNoturnasPorDia"
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formFuncionario.horas_noturnas_por_dia || ''}
                                        onChange={(e) => setFormFuncionario(prev => ({ ...prev, horas_noturnas_por_dia: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="editDiasSemana">Dias trabalhados por semana</Label>
                                      <Input
                                        id="editDiasSemana"
                                        type="number"
                                        min="0"
                                        max="7"
                                        step="1"
                                        value={formFuncionario.dias_semana || ''}
                                        onChange={(e) => {
                                          const diasSemana = parseInt(e.target.value) || 0
                                          const valorMensal = calcularValeRefeicaoMensal(formFuncionario.vale_refeicao_por_dia, diasSemana)
                                          setFormFuncionario(prev => ({ 
                                            ...prev, 
                                            dias_semana: diasSemana,
                                            vale_refeicao_mensal: valorMensal
                                          }))
                                        }}
                                        placeholder="6"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-4 justify-end">
                                  <Button variant="outline" onClick={handleCancelarEdicao}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleSalvarEdicaoFuncionario} disabled={loading}>
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerFuncionario(funcionario.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Salário Base</p>
                          <p className="font-medium">R$ {funcionario.salario_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">INSS Patronal (20%)</p>
                          <p className="font-medium">R$ {calculos.inssPatronal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">FGTS (8%)</p>
                          <p className="font-medium">R$ {calculos.fgts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">13º Salário</p>
                          <p className="font-medium">R$ {calculos.decimoTerceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Férias + 1/3</p>
                          <p className="font-medium">R$ {calculos.ferias.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Provisão Rescisão</p>
                          <p className="font-medium">R$ {calculos.rescisao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Horas Extras</p>
                          <p className="font-medium">R$ {calculos.custoHorasExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Adicional Noturno</p>
                          <p className="font-medium">R$ {calculos.custoAdicionalNoturno.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Custo por Funcionário</p>
                          <p className="font-medium">R$ {calculos.custoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Custo Total do Cargo:</span>
                          <Badge variant="secondary" className="text-base px-3 py-1">
                            R$ {calculos.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção Freelancers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Freelancers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="funcao">Função *</Label>
                <Input
                  id="funcao"
                  value={formFreelancer.funcao}
                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, funcao: e.target.value }))}
                  placeholder="Ex: Designer"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorDiaria">Valor da Diária (R$) *</Label>
                <Input
                  id="valorDiaria"
                  type="number"
                  value={formFreelancer.valor_diaria || ''}
                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, valor_diaria: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadePessoas">Qtd Pessoas *</Label>
                <Input
                  id="quantidadePessoas"
                  type="number"
                  min="1"
                  value={formFreelancer.quantidade_pessoas || ''}
                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, quantidade_pessoas: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diasMes">Dias no Mês *</Label>
                <Input
                  id="diasMes"
                  type="number"
                  min="1"
                  max="31"
                  value={formFreelancer.dias_mes || ''}
                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, dias_mes: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAdicionarFreelancer} className="w-full" disabled={loading}>
                  <Plus className="h-4 w-4" />
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </div>

            {/* Lista de Freelancers */}
            {freelancers.length > 0 && (
              <div className="space-y-2">
                <Separator />
                <h4 className="font-medium text-sm text-muted-foreground">Freelancers Cadastrados</h4>
                {freelancers.map((freelancer) => {
                  const custoTotal = freelancer.valor_diaria * freelancer.quantidade_pessoas * freelancer.dias_mes
                  return (
                    <div key={freelancer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{freelancer.funcao}</p>
                        <p className="text-sm text-muted-foreground">
                          {freelancer.quantidade_pessoas}x pessoa(s) • {freelancer.dias_mes} dias • 
                          R$ {freelancer.valor_diaria.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/dia
                        </p>
                        <Badge variant="outline" className="mt-1">
                          Total: R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarFreelancer(freelancer)}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Freelancer - {freelancer.funcao}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="editFuncao">Função *</Label>
                                <Input
                                  id="editFuncao"
                                  value={formFreelancer.funcao}
                                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, funcao: e.target.value }))}
                                  placeholder="Ex: Designer"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="editValorDiaria">Valor da Diária (R$) *</Label>
                                <Input
                                  id="editValorDiaria"
                                  type="number"
                                  value={formFreelancer.valor_diaria || ''}
                                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, valor_diaria: parseFloat(e.target.value) || 0 }))}
                                  placeholder="0,00"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editQuantidadePessoas">Qtd Pessoas *</Label>
                                <Input
                                  id="editQuantidadePessoas"
                                  type="number"
                                  min="1"
                                  value={formFreelancer.quantidade_pessoas || ''}
                                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, quantidade_pessoas: parseInt(e.target.value) || 1 }))}
                                  placeholder="1"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editDiasMes">Dias no Mês *</Label>
                                <Input
                                  id="editDiasMes"
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={formFreelancer.dias_mes || ''}
                                  onChange={(e) => setFormFreelancer(prev => ({ ...prev, dias_mes: parseInt(e.target.value) || 0 }))}
                                  placeholder="0"
                                />
                              </div>

                              <div className="flex gap-4 justify-end">
                                <Button variant="outline" onClick={handleCancelarEdicao}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleSalvarEdicaoFreelancer} disabled={loading}>
                                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerFreelancer(freelancer.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Final */}
        {(prolabores.length > 0 || funcionarios.length > 0 || freelancers.length > 0) && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Resumo Total - Mão de Obra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Prolabore</p>
                    <p className="text-xl font-bold text-primary">
                      R$ {totalProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Funcionários CLT</p>
                    <p className="text-xl font-bold text-success">
                      R$ {totalFuncionarios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Freelancers</p>
                    <p className="text-xl font-bold text-accent">
                      R$ {totalFreelancers.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Geral</p>
                    <p className="text-2xl font-bold text-destructive">
                      R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={compartilharWhatsApp}>
                    <Share className="h-4 w-4" />
                    Exportar WhatsApp
                  </Button>
                  <Button>
                    <Save className="h-4 w-4" />
                    Salvar para Precificação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}