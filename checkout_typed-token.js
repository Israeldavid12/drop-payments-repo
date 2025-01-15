async function getToken() {
    const client_id = '9ba19544-740b-4886-8727-275d483ecb92'; // Seu client_id
    const client_secret = '84INb0Pfv9jGmlwfCCRl92EHfktsE5Th92bqxd3h'; // Seu client_secret
    const url = 'https://e2payments.explicador.co.mz/v1/auth/token'; // Endpoint de autenticação
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`) // Codificação base64
    };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: headers
    });
  
    const data = await response.json();
  
    if (response.ok) {
      const accessToken = data.access_token;
      console.log('Token de acesso:', accessToken);
      
      // Armazenando o token no localStorage
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } else {
      console.error('Erro ao gerar o token:', data);
    }
  }
  
  // Chamada da função para gerar e armazenar o token
  getToken();
  