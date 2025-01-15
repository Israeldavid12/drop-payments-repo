// Função para copiar código de exemplo para a área de transferência
function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  
    // Alerta para informar que o texto foi copiado
    alert("Exemplo copiado para a área de transferência!");
  }
  