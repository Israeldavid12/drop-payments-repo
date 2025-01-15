import { post } from 'axios';

// Função para gerar o token de autenticação (CC Token)
async function getE2PaymentsToken() {
  try {
    const response = await post('https://e2payments.explicador.co.mz/v1/oauth/token', {
      client_id: '9ba19544-740b-4886-8727-275d483ecb92',
      client_secret: '84INb0Pfv9jGmlwfCCRl92EHfktsE5Th92bqxd3h',
      grant_type: 'client_credentials'
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token; // Retorna o token
    } else {
      throw new Error('Failed to retrieve token');
    }
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

export default getE2PaymentsToken;
