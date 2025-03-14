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


 async function generatePresignedUrl(file_id, dir_file) {
    const file = document.getElementById(file_id);
    const file_name = file.files[0].name;
    const file_type = file.files[0].type;


    const response = await axios.post('https://www.dropaymentsmz.online/api/create-product', {
        reqType: 'presigned_url',
        userId: await getUserId(),
        dir_file: dir_file,
        fileName: file_name,
        contentType: file_type
    })

    console.log(response)

    return {
        presignedUrl: response.data.presignedUrl,
        filePath: response.data.filePath
    };
}



async function uploadFile(file_id, presignedUrl, file_path) {
    const file = document.getElementById(file_id).files[0];

    if (!file) {
        console.error("Nenhum arquivo selecionado!");
        return;
    }

    console.log("Presigned URL:", presignedUrl);

    const response = await axios.put(presignedUrl, file, {
        headers: {
            "Content-Type": file.type, // Importante para arquivos com tipo correto
        }
    });

    console.log(response)

    if (response.status === 200) {
        console.log("Upload concluído com sucesso!");
        const fileUrl = `https://megaofertasco.store/${file_path}`;
        console.log("Acesse o arquivo em:", fileUrl);
        return fileUrl;
    } else {
        console.error("Erro ao enviar arquivo:", response.statusText);
        return response.statusText;
    }
}



description.addEventListener("input", () => {
    let tamanhoTexto = description.value.length;
    contador.textContent = `${tamanhoTexto}/${limite}`;

    if (tamanhoTexto >= limite) {
        setAnOutPut('Você atingiu o limite de 200 caracteres!', 'E-M')
        description.value = '';
        return

    }
});

product_name.addEventListener("input", () => {
    let tamanhoTexto = product_name.value.length;

    if (tamanhoTexto >= 150) {
        setAnOutPut('Você atingiu o limite de 150 caracteres para o nome do produto!', 'E-M')
        product_name.value = '';
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

        if (parseInt(productPrice) >= 40000) {
            return setAnOutPut('Por favor insira um valor nao superior a 39999', 'E-M');
        }

        //PRESIGNED IMAGE URL
        const image_data = await generatePresignedUrl('imageInput', 'images');
        const image_url_signed = image_data.presignedUrl;
        const image_path = image_data.filePath;
        const upload_image = await uploadFile('imageInput', image_url_signed, image_path);

        //PRESIGNED BANNER URL 
        const banner_data = await generatePresignedUrl('bannerInput', 'banners');
        const banner_url_signed = banner_data.presignedUrl;
        const banner_path = banner_data.filePath;
        const upload_banner = await uploadFile('bannerInput', banner_url_signed, banner_path);


        if (DocURl === 'link') {
            product_url = document.getElementById('productLink').value
            console.log(product_url)

        } else if (DocURl === 'doc') {
            // PRESIGNED DOCUMENT URL
            const doc_data = await generatePresignedUrl('productDoc', 'docs');
            const doc_url_signed = doc_data.presignedUrl;
            const doc_path = doc_data.filePath;
            product_url = await uploadFile('productDoc', doc_url_signed, doc_path);
            console.log(product_url)

        } else if (DocURl === 'PAYMENT-ONLY') {
            product_url = DocURl
            console.log(product_url)
        } else {
            product_url = document.getElementById('productLink').value
        }
       
        

        const response = await axios.post('https://www.dropaymentsmz.online/api/create-product', {
            reqType: 'create',
            userId: await getUserId(),  
            product_name: productName, 
            product_price: productPrice, 
            product_description: productDescription, 
            docUrl: product_url, 
            image_url: upload_image, 
            banner_url: upload_banner,

        });

      
        
        if (response.data.message) {
            setAnOutPut(response.data.message, "S-M")
            return
        } else {
            setAnOutPut(response, 'S-M')
            return;
        }


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
    addLoadAnim('create-product', 'Adicionar produto', true);
    await saveProduct();
    addLoadAnim('create-product', 'Adicionar produto', false);


});