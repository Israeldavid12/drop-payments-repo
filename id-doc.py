import random
import string

def generate_random_string():
    # Gera 12 caracteres numéricos aleatórios
    numbers = ''.join(random.choices(string.digits, k=12))
    # Gera uma letra aleatória
    letter = random.choice(string.ascii_uppercase)
    # Combina números e a letra
    return numbers + letter

# Gerar o número aleatório
random_string = generate_random_string()
random_string
print(random_string)
