import { setAnOutPut } from "../../animations/index.js";

export class Listeners {
    static verificarLimite(id, limite, is_counter = false) {
        const element = document.getElementById(id);
        const contador = document.getElementById("char-counter");


        element.addEventListener("input", () => {
            let tamanhoTexto = element.value.length;
            if (is_counter) {
                contador.textContent = `${tamanhoTexto}/${limite}`;
            }

            console.log(id, limite)
            if (tamanhoTexto >= limite) {
                setAnOutPut('Você atingiu o limite de 150 caracteres para o nome do produto!', 'E-M')
                element.value = '';
                return

            }
        });

    }

    static verificarTamanhoDoArquivo(file_id, limite) {
        const maximo = limite * 1024 * 1024; // Limite em MB
        const image = document.getElementById(file_id);

        image.addEventListener('change', function () {
            console.log(file_id, limite)
            const productImage = image.files[0];
            if (productImage && productImage.size > maximo) { // Limite de 5 MB
                setTimeout(() => {
                    image.value = '';
                    document.getElementById('preview').src = '';
                }, 2500);
                setAnOutPut('O arquivo selecionado excede o limite de 5 MB.', 'E-M')
                return

            }
        });
    }

    static deliveryMethod(element_id) {
        const method = document.getElementById(element_id);

        method.addEventListener('change', () => {
            if (method.value === 'link') {
                document.getElementById('productLinkDiv').style.display = 'grid'
                document.getElementById('productDocDiv').style.display = 'none'
                console.log('link')
                sessionStorage.setItem('selected_method', 'link')
                return 'link'

            } else if (method.value === 'doc') {
                document.getElementById('productLinkDiv').style.display = 'none'
                document.getElementById('productDocDiv').style.display = 'grid'
                console.log('doc')
                sessionStorage.setItem('selected_method', 'doc')
                return 'doc'
            } else if (method.value === 'payment_only') {
                document.getElementById('productLinkDiv').style.display = 'none'
                document.getElementById('productDocDiv').style.display = 'none'
                console.log('payment_only')
                sessionStorage.setItem('selected_method', 'PAYMENT-ONLY')
                return 'PAYMENT-ONLY'
            } else {
                sessionStorage.setItem('selected_method', 'link')
                return 'link'
            }

        });

    }

 

    static previewImage(id, preview_id) {
        document.getElementById(id).addEventListener("change", function (event) {
            const file = event.target.files[0]; // Obtém o arquivo selecionado

            if (file) {
                const reader = new FileReader(); // Cria um leitor de arquivos

                reader.onload = function (e) {
                    const img = document.getElementById(preview_id); // Obtém o elemento de imagem para exibir a prévia
                    img.src = e.target.result; // Define a imagem para o conteúdo lido
                    img.style.display = "block"; // Exibe a imagem
                };

                reader.readAsDataURL(file); // Lê o arquivo como URL base64
            }
        });
    }



} 