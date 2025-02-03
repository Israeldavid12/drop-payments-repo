import { setAnOutPut, addLoadAnim } from "../../animations/index.js";
import { getUserId } from "../../user/user_data.mjs";





document.getElementById("imageInput").addEventListener("change", function (event) {
    const file = event.target.files[0]; // Obtém o arquivo selecionado

    if (file) {
        const reader = new FileReader(); // Cria um leitor de arquivos

        reader.onload = function (e) {
            const img = document.getElementById("preview");
            img.src = e.target.result; // Define a imagem para o conteúdo lido
            img.style.display = "block"; // Exibe a imagem
        };

        reader.readAsDataURL(file); // Lê o arquivo como URL base64
    }
});

document.getElementById("bannerInput").addEventListener("change", function (event) {
    const file = event.target.files[0]; // Obtém o arquivo selecionado

    if (file) {
        const reader = new FileReader(); // Cria um leitor de arquivos

        reader.onload = function (e) {
            const img = document.getElementById("preview-2");
            img.src = e.target.result; // Define a imagem para o conteúdo lido
            img.style.display = "block"; // Exibe a imagem
        };

        reader.readAsDataURL(file); // Lê o arquivo como URL base64
    }
});



const form = document.getElementById('product-form');
const product_name = document.getElementById('name-product')
const price = document.getElementById('price-form');
const description = document.getElementById("description");
const contador = document.getElementById("char-counter");
const image = document.getElementById('imageInput');
const banner = document.getElementById('bannerInput')
const delivery_method = document.getElementById('delivery-method');
const productDoc = document.getElementById('productDoc')
const productLink = document.getElementById('productLink')
const limite = 200;




description.addEventListener("input", () => {
    let tamanhoTexto = description.value.length;
    contador.textContent = `${tamanhoTexto}/${limite}`;

    if (tamanhoTexto >= limite) {
        setAnOutPut('Você atingiu o limite de 200 caracteres!', 'E-M')
        return

    }
});

product_name.addEventListener("input", () => {
    let tamanhoTexto = product_name.value.length;

    if (tamanhoTexto >= 150) {
        setAnOutPut('Você atingiu o limite de 150 caracteres para o nome do produto!', 'E-M')
        return

    }
});

function verificarValor() {
    const input = document.getElementById("price-form");
    const maximo = 99999;

    if (input.value > maximo) {
        input.value = maximo; // Ajusta automaticamente para 200
    }
}


image.addEventListener('change', function (event) {
    const productImage = image.files[0];
    if (productImage && productImage.size > 5 * 1024 * 1024) { // Limite de 5 MB
        setTimeout(() => {
            image.value = '';
            document.getElementById('preview').src = '';
        }, 2500);
        setAnOutPut('O arquivo selecionado excede o limite de 5 MB.', 'E-M')
        return

    }
});



banner.addEventListener('change', function (event) {
    const productImage = banner.files[0];
    if (productImage && productImage.size > 5 * 1024 * 1024) { // Limite de 5 MB
        setTimeout(() => {
            banner.value = '';
            document.getElementById('preview-2').src = '';
        }, 2500);
        setAnOutPut('O arquivo selecionado excede o limite de 5 MB.', 'E-M')

    }
});


productDoc.addEventListener('change', function (event) {
    const productDocValue = productDoc.files[0];
    if (productDocValue && productDocValue.size > 50 * 1024 * 1024) { // Limite de 5 MB
        setTimeout(() => {
            productDoc.value = '';
        }, 2500);
        setAnOutPut('O arquivo selecionado excede o limite de 50 MB.', 'E-M')

    }
});

productLink.addEventListener('input', () => {
    let tamanhoTexto = productLink.value.length;

    if (tamanhoTexto >= 150) {
        setAnOutPut('Você atingiu o limite de 100 caracteres para o nome do produto!', 'E-M')
        return

    }
});


let DocURl = 'link';

delivery_method.addEventListener('change', () => {
    if (delivery_method.value === 'link') {
        document.getElementById('productLinkDiv').style.display = 'grid'
        document.getElementById('productDocDiv').style.display = 'none'
        DocURl = 'link';
        console.log(DocURl)

    }
    else if (delivery_method.value === 'doc') {
        document.getElementById('productLinkDiv').style.display = 'none'
        document.getElementById('productDocDiv').style.display = 'grid'
        DocURl = 'doc'
        console.log(DocURl)

    }
    else if (delivery_method.value === 'payment_only') {
        document.getElementById('productLinkDiv').style.display = 'none'
        document.getElementById('productDocDiv').style.display = 'none'
        DocURl = 'PAYMENT-ONLY'
        console.log(DocURl)


    }
})





async function saveProduct() {
    let product_url = '';
    try {
        const productName = document.getElementById('name-product').value
        const productPrice = document.getElementById('price-product').value
        const productDescription = document.getElementById('description').value
        const productImage = document.getElementById('imageInput').files[0]
        const productBanner = document.getElementById('bannerInput').files[0]


        if (DocURl === 'link') {
            product_url = document.getElementById('productLink').value
            console.log(product_url)

        } else if (DocURl === 'doc') {
            product_url = document.getElementById('productDoc').files[0]
            console.log(product_url)
        } else if (DocURl === 'PAYMENT-ONLY') {
            product_url = DocURl
            console.log(product_url)
        } else {
            product_url = document.getElementById('productLink').value
        }
        const formData = new FormData();

        // Append data to the FormData object
        formData.append('userId', await getUserId());
        formData.append('reqType', 'save_product'),
        formData.append('product_name', productName);
        formData.append('product_price', productPrice);
        formData.append('product_description', productDescription);
        formData.append('product_image', productImage);
        formData.append('product_banner', productBanner);
        formData.append('docUrl', product_url);

        const response = await axios.post('http://127.0.0.1:3000/api/upload', formData, {
            headers: {
                "Content-Type": "multipart/form-data", // Required for file uploads
            },
        });

        setAnOutPut(response.data.message, 'S-M')

        console.log(response)


    } catch (error) {
        console.log(error)
       if (error.response) {
        setAnOutPut(error.response.data.message, 'E-M')
       } else {
        setAnOutPut(error, 'E-M')
       }

    }
}









form.addEventListener('submit', async (e, product_name) => {
    e.preventDefault();
    addLoadAnim('create-product', 'Adicionar produto', 15000);
    saveProduct();


});