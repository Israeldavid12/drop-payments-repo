from flask import Flask, request, jsonify
from flask_cors import CORS  # Importa o CORS
from pprint import pprint
from portalsdk import APIContext, APIMethodType, APIRequest
import random
import os
import logging

app = Flask(__name__)

# Permite requisições de qualquer origem para todos os endpoints ou personalize conforme necessário
CORS(app, resources={r"/api/mpesa-payment-c2b": {"origins": "https://www.dropaymentsmz.online"}})  # Substitua "*" por uma URL específica se necessário
logging.basicConfig(level=logging.ERROR)

@app.route('/api/mpesa-payment-c2b', methods=['POST'])





def mpesa_payment_c2b():
    try:
        # Recuperando dados do corpo da requisição
        data = request.get_json()

        transaction_reference = data.get('input_TransactionReference')
        customer_msisdn = data.get('input_CustomerMSISDN')
        amount = data.get('input_Amount')
        third_party_reference = data.get('input_ThirdPartyReference')
        service_provider_code = data.get('input_ServiceProviderCode')

        if not all([transaction_reference, customer_msisdn, amount, third_party_reference, service_provider_code]):
            return jsonify({'error': 'Dados insuficientes na requisição'}), 400

        if not customer_msisdn.isdigit() or len(customer_msisdn) != 9:
            return jsonify({'error': 'Número de telefone inválido'}), 400


        # Gera um número aleatório entre 1000 e 10000
        random_number = str(random.randint(1000, 10000)).strip() 
        third_party_reference_formated = str(third_party_reference + random_number).strip() 
        print(third_party_reference_formated)
  

        # Verificando se o número do cliente contém apenas dígitos
        if not customer_msisdn.isdigit() or len(customer_msisdn) != 9:
            return jsonify({'error': 'Número de telefone inválido'}), 400

        # Adicionando o código do país (258) ao número do cliente
        customer_msisdn_formated = str('258'+customer_msisdn).strip()  #
        print(customer_msisdn_formated)

        # Configurando o contexto da API
        api_context = APIContext()
        api_context.api_key = '1l56oc6b5u0qfps5d9ezv00qab6bdqu9'
        api_context.public_key = '''MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmptSWqV7cGUUJJhUBxsMLonux24u+FoTlrb+4Kgc6092JIszmI1QUoMohaDDXSVueXx6IXwYGsjjWY32HGXj1iQhkALXfObJ4DqXn5h6E8y5/xQYNAyd5bpN5Z8r892B6toGzZQVB7qtebH4apDjmvTi5FGZVjVYxalyyQkj4uQbbRQjgCkubSi45Xl4CGtLqZztsKssWz3mcKncgTnq3DHGYYEYiKq0xIj100LGbnvNz20Sgqmw/cH+Bua4GJsWYLEqf/h/yiMgiBbxFxsnwZl0im5vXDlwKPw+QnO2fscDhxZFAwV06bgG0oEoWm9FnjMsfvwm0rUNYFlZ+TOtCEhmhtFp+Tsx9jPCuOd5h2emGdSKD8A6jtwhNa7oQ8RtLEEqwAn44orENa1ibOkxMiiiFpmmJkwgZPOG/zMCjXIrrhDWTDUOZaPx/lEQoInJoE2i43VN/HTGCCw8dKQAwg0jsEXau5ixD0GUothqvuX3B9taoeoFAIvUPEq35YulprMM7ThdKodSHvhnwKG82dCsodRwY428kg2xM/UjiTENog4B6zzZfPhMxFlOSFX4MnrqkAS+8Jamhy1GgoHkEMrsT5+/ofjCx0HjKbT5NuA2V/lmzgJLl3jIERadLzuTYnKGWxVJcGLkWXlEPYLbiaKzbJb2sYxt+Kt5OxQqC1MCAwEAAQ=='''
        api_context.ssl = True
        api_context.method_type = APIMethodType.POST
        api_context.address = 'api.sandbox.vm.co.mz'
        api_context.port = 18352
        api_context.path = '/ipg/v1x/c2bPayment/singleStage/'

        # Adicionando cabeçalhos
        api_context.add_header('Origin', '*')  # Permite requisições de qualquer origem
        
        # Adicionando parâmetros à requisição
        api_context.add_parameter('input_TransactionReference', transaction_reference)
        api_context.add_parameter('input_CustomerMSISDN', customer_msisdn_formated)
        api_context.add_parameter('input_Amount', amount)
        api_context.add_parameter('input_ThirdPartyReference', third_party_reference_formated)
        api_context.add_parameter('input_ServiceProviderCode', service_provider_code)

        # Executando a requisição
        api_request = APIRequest(api_context)
        result = api_request.execute()

        response_body = result.body if isinstance(result.body, dict) else result.body.decode()
        if result.status_code != 200:
            return jsonify({'error': 'Falha no pagamento', 'details': response_body}), result.status_code

        # Formatando e retornando a resposta
        response = {
            'status_code': result.status_code,
            'headers': result.headers,
            'body': result.body
        }
        print(result.status_code)
        print(result.body)
        return jsonify(response), result.status_code
        

    except Exception as e:
        app.logger.error(f"Erro: {str(e)}")
        return jsonify({'ocorreu um erro': str(e)}), 500
        print('ocorreu um exepcion')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
