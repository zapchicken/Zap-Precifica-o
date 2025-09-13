import React, { useState } from 'react';
import { useDespesasFixas } from '../src/hooks/useDespesasFixas';

export function TesteSimples() {
  const {
    despesas,
    loading,
    error,
    createDespesa,
    user
  } = useDespesasFixas();

  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Formulário submetido!');
    console.log('📝 Nome:', nome);
    console.log('💰 Valor:', valor);
    console.log('👤 Usuário:', user);

    if (!nome || !valor) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      const novaDespesa = {
        nome,
        categoria: 'Teste',
        valor: parseFloat(valor),
        frequencia: 'mensal' as const
      };

      console.log('📤 Tentando criar despesa:', novaDespesa);
      
      const resultado = await createDespesa(novaDespesa);
      console.log('📥 Resultado:', resultado);

      if (resultado) {
        alert('✅ Despesa criada com sucesso!');
        setNome('');
        setValor('');
      } else {
        alert('❌ Falha ao criar despesa');
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      alert('Erro ao criar despesa: ' + err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Teste Simples</h1>
      
      {/* Status */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p><strong>Usuário:</strong> {user ? user.email : 'Não autenticado'}</p>
        <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
        <p><strong>Erro:</strong> {error || 'Nenhum'}</p>
        <p><strong>Despesas:</strong> {despesas.length}</p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Despesa</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Ex: Aluguel"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Valor</label>
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="0.00"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Criar Despesa
        </button>
      </form>

      {/* Lista de despesas */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Despesas Existentes:</h2>
        {despesas.length === 0 ? (
          <p className="text-gray-500">Nenhuma despesa encontrada</p>
        ) : (
          <ul className="space-y-2">
            {despesas.map((despesa) => (
              <li key={despesa.id} className="p-2 bg-gray-50 rounded">
                <strong>{despesa.nome}</strong> - R$ {despesa.valor}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
