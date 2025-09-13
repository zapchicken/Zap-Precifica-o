import React, { useState } from 'react';
import { useDespesasFixas, NovaDespesaFixa } from '../src/hooks/useDespesasFixas';

export function TesteDespesasFixas() {
  const {
    despesas,
    loading,
    error,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    getTotalMensal,
    getDespesasByCategoria,
    getDespesasVencendo,
    clearError
  } = useDespesasFixas();

  const [novaDespesa, setNovaDespesa] = useState<NovaDespesaFixa>({
    nome: '',
    categoria: '',
    valor: 0,
    frequencia: 'mensal'
  });

  const [editando, setEditando] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NovaDespesaFixa>({
    nome: '',
    categoria: '',
    valor: 0,
    frequencia: 'mensal'
  });

  // Criar nova despesa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDespesa.nome || !novaDespesa.categoria || novaDespesa.valor <= 0) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const resultado = await createDespesa(novaDespesa);
    if (resultado) {
      setNovaDespesa({
        nome: '',
        categoria: '',
        valor: 0,
        frequencia: 'mensal'
      });
      alert('Despesa criada com sucesso!');
    }
  };

  // Iniciar edição
  const iniciarEdicao = (despesa: any) => {
    setEditando(despesa.id);
    setEditForm({
      nome: despesa.nome,
      descricao: despesa.descricao || '',
      categoria: despesa.categoria,
      valor: despesa.valor,
      frequencia: despesa.frequencia,
      data_vencimento: despesa.data_vencimento || '',
      dia_vencimento: despesa.dia_vencimento || undefined,
      status: despesa.status,
      observacoes: despesa.observacoes || ''
    });
  };

  // Salvar edição
  const salvarEdicao = async (id: string) => {
    const sucesso = await updateDespesa(id, editForm);
    if (sucesso) {
      setEditando(null);
      alert('Despesa atualizada com sucesso!');
    }
  };

  // Cancelar edição
  const cancelarEdicao = () => {
    setEditando(null);
  };

  // Deletar despesa
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta despesa?')) {
      const sucesso = await deleteDespesa(id);
      if (sucesso) {
        alert('Despesa deletada com sucesso!');
      }
    }
  };

  // Formatar valor monetário
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Formatar data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Carregando despesas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">🧪 Teste do Hook useDespesasFixas</h1>

      {/* Resumo */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">📊 Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{despesas.length}</div>
            <div className="text-sm text-gray-600">Total de Despesas</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatarValor(getTotalMensal())}</div>
            <div className="text-sm text-gray-600">Total Mensal</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{getDespesasVencendo(7).length}</div>
            <div className="text-sm text-gray-600">Vencendo em 7 dias</div>
          </div>
        </div>
      </div>

      {/* Formulário para criar nova despesa */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">➕ Criar Nova Despesa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={novaDespesa.nome}
                onChange={(e) => setNovaDespesa({...novaDespesa, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Aluguel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <input
                type="text"
                value={novaDespesa.categoria}
                onChange={(e) => setNovaDespesa({...novaDespesa, categoria: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Moradia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input
                type="number"
                step="0.01"
                value={novaDespesa.valor}
                onChange={(e) => setNovaDespesa({...novaDespesa, valor: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequência *</label>
              <select
                value={novaDespesa.frequencia}
                onChange={(e) => setNovaDespesa({...novaDespesa, frequencia: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mensal">Mensal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="semanal">Semanal</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Criar Despesa
          </button>
        </form>
      </div>

      {/* Lista de despesas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Lista de Despesas</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erro:</strong> {error}
            <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {despesas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma despesa encontrada. Crie uma nova despesa acima!
          </div>
        ) : (
          <div className="space-y-4">
            {despesas.map((despesa) => (
              <div key={despesa.id} className="border border-gray-200 rounded-lg p-4">
                {editando === despesa.id ? (
                  // Formulário de edição
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editForm.nome}
                        onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={editForm.categoria}
                        onChange={(e) => setEditForm({...editForm, categoria: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.valor}
                        onChange={(e) => setEditForm({...editForm, valor: parseFloat(e.target.value) || 0})}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => salvarEdicao(despesa.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Visualização da despesa
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{despesa.nome}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          despesa.status === 'ativa' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {despesa.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{despesa.categoria}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{formatarValor(despesa.valor)}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{despesa.frequencia}</span>
                        {despesa.data_vencimento && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Vence: {formatarData(despesa.data_vencimento)}</span>
                          </>
                        )}
                        {despesa.dia_vencimento && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Dia {despesa.dia_vencimento} de cada mês</span>
                          </>
                        )}
                      </div>
                      {despesa.descricao && (
                        <p className="text-sm text-gray-500 mt-1">{despesa.descricao}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => iniciarEdicao(despesa)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(despesa.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estatísticas por categoria */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Estatísticas por Categoria</h2>
        <div className="space-y-3">
          {Array.from(new Set(despesas.map(d => d.categoria))).map(categoria => {
            const despesasCategoria = getDespesasByCategoria(categoria);
            const totalCategoria = despesasCategoria.reduce((sum, d) => sum + d.valor, 0);
            
            return (
              <div key={categoria} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{categoria}</span>
                <div className="text-right">
                  <div className="font-semibold">{formatarValor(totalCategoria)}</div>
                  <div className="text-sm text-gray-600">{despesasCategoria.length} despesa(s)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
