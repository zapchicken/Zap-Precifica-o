// =====================================================
// SCRIPT DE DEBUG PARA IMPORTAÇÃO DE VENDAS
// =====================================================
// 
// ⚠️  ATENÇÃO: Este script vai ajudar a identificar
// problemas na importação de vendas
//
// =====================================================

// 1. VERIFICAR SE O ARQUIVO FOI SELECIONADO
console.log('=== DEBUG IMPORTAÇÃO DE VENDAS ===');

// Verificar se o arquivo está sendo selecionado
const fileInput = document.querySelector('input[type="file"]');
if (fileInput) {
  console.log('✅ Input de arquivo encontrado');
  console.log('Accept:', fileInput.accept);
} else {
  console.log('❌ Input de arquivo NÃO encontrado');
}

// 2. VERIFICAR SE O BOTÃO DE IMPORTAÇÃO EXISTE
const importButton = document.querySelector('button[type="button"]');
if (importButton) {
  console.log('✅ Botão de importação encontrado');
  console.log('Texto do botão:', importButton.textContent);
} else {
  console.log('❌ Botão de importação NÃO encontrado');
}

// 3. VERIFICAR SE HÁ ERROS NO CONSOLE
console.log('=== VERIFICANDO ERROS ===');
console.log('Verifique o console do navegador para erros');

// 4. VERIFICAR SE O FORMATO FOI SELECIONADO
const formatoSelect = document.querySelector('select');
if (formatoSelect) {
  console.log('✅ Select de formato encontrado');
  console.log('Valor selecionado:', formatoSelect.value);
} else {
  console.log('❌ Select de formato NÃO encontrado');
}

// 5. VERIFICAR SE OS CAMPOS DE DATA E CANAL EXISTEM
const dataInput = document.querySelector('input[type="date"]');
if (dataInput) {
  console.log('✅ Input de data encontrado');
  console.log('Valor da data:', dataInput.value);
} else {
  console.log('❌ Input de data NÃO encontrado');
}

// 6. VERIFICAR SE HÁ MENSAGENS DE ERRO
const errorMessages = document.querySelectorAll('[role="alert"]');
if (errorMessages.length > 0) {
  console.log('❌ Mensagens de erro encontradas:');
  errorMessages.forEach((msg, index) => {
    console.log(`Erro ${index + 1}:`, msg.textContent);
  });
} else {
  console.log('✅ Nenhuma mensagem de erro encontrada');
}

// 7. VERIFICAR SE O ARQUIVO FOI PROCESSADO
const progressBar = document.querySelector('[role="progressbar"]');
if (progressBar) {
  console.log('✅ Barra de progresso encontrada');
  console.log('Valor:', progressBar.getAttribute('aria-valuenow'));
} else {
  console.log('❌ Barra de progresso NÃO encontrada');
}

// 8. VERIFICAR SE HÁ TOASTS DE ERRO
const toasts = document.querySelectorAll('[data-sonner-toast]');
if (toasts.length > 0) {
  console.log('❌ Toasts de erro encontrados:');
  toasts.forEach((toast, index) => {
    console.log(`Toast ${index + 1}:`, toast.textContent);
  });
} else {
  console.log('✅ Nenhum toast de erro encontrado');
}

// 9. VERIFICAR SE O ARQUIVO ESTÁ SENDO LIDO
if (fileInput && fileInput.files && fileInput.files.length > 0) {
  const file = fileInput.files[0];
  console.log('✅ Arquivo selecionado:');
  console.log('- Nome:', file.name);
  console.log('- Tamanho:', file.size);
  console.log('- Tipo:', file.type);
  console.log('- Última modificação:', file.lastModified);
} else {
  console.log('❌ Nenhum arquivo selecionado');
}

// 10. VERIFICAR SE HÁ PROBLEMAS DE REDE
console.log('=== VERIFICANDO CONECTIVIDADE ===');
console.log('Verifique se há erros de rede no console');

// 11. VERIFICAR SE O SUPABASE ESTÁ CONECTADO
console.log('=== VERIFICANDO SUPABASE ===');
console.log('Verifique se há erros do Supabase no console');

// 12. INSTRUÇÕES PARA DEBUG
console.log('=== INSTRUÇÕES PARA DEBUG ===');
console.log('1. Abra o Console do Navegador (F12)');
console.log('2. Verifique se há erros em vermelho');
console.log('3. Verifique se há warnings em amarelo');
console.log('4. Verifique se há mensagens de rede');
console.log('5. Verifique se há mensagens do Supabase');
console.log('6. Verifique se há mensagens de validação');

// 13. TESTE MANUAL
console.log('=== TESTE MANUAL ===');
console.log('1. Selecione um arquivo CSV');
console.log('2. Verifique se o formato está selecionado');
console.log('3. Se formato "imagem", verifique se a data está preenchida');
console.log('4. Clique em importar');
console.log('5. Verifique se há mensagens de erro');

// 14. POSSÍVEIS PROBLEMAS
console.log('=== POSSÍVEIS PROBLEMAS ===');
console.log('1. Arquivo não está sendo lido corretamente');
console.log('2. Formato não está sendo selecionado');
console.log('3. Data não está sendo preenchida (formato imagem)');
console.log('4. Erro na validação dos dados');
console.log('5. Erro na conexão com Supabase');
console.log('6. Erro na função de processamento');
console.log('7. Erro na função de salvamento');

// 15. SOLUÇÕES SUGERIDAS
console.log('=== SOLUÇÕES SUGERIDAS ===');
console.log('1. Verifique se o arquivo está no formato correto');
console.log('2. Verifique se o formato está selecionado');
console.log('3. Verifique se a data está preenchida (formato imagem)');
console.log('4. Verifique se há erros no console');
console.log('5. Verifique se há erros de rede');
console.log('6. Verifique se há erros do Supabase');
console.log('7. Verifique se há erros de validação');
