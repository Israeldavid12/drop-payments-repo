import { setAnOutPut, addLoadAnim } from "../../animations/index.js";
import { UserData } from "../../user/v2/userData.js";
import { Utils } from "./Utils.js";
import { Listeners } from "./listeners.js";





Listeners.verificarLimite('name-product', 150);
Listeners.verificarLimite('description', 200, true);
Listeners.verificarLimite('productLink', 150);
Listeners.verificarTamanhoDoArquivo('imageInput', 5);
Listeners.verificarTamanhoDoArquivo('bannerInput', 5);
Listeners.verificarTamanhoDoArquivo('productDoc', 40);
Listeners.previewImage('imageInput', 'preview');
Listeners.previewImage('bannerInput', 'preview-2');
Listeners.deliveryMethod('delivery-method');



 


async function saveProduct() {

    try {

        Utils.verificarPreco('price-product');

        //PRESIGNED IMAGE URL
        const image_data = await Utils.generatePresignedUrl('imageInput', 'images');
        const image_url_signed = image_data.presignedUrl;
        const image_path = image_data.filePath;
        const upload_image = await Utils.uploadFile('imageInput', image_url_signed, image_path);

        //PRESIGNED BANNER URL 
        const banner_data = await Utils.generatePresignedUrl('bannerInput', 'banners');
        const banner_url_signed = banner_data.presignedUrl;
        const banner_path = banner_data.filePath;
        const upload_banner = await Utils.uploadFile('bannerInput', banner_url_signed, banner_path);

        Listeners.deliveryMethod('delivery-method');
        const method = sessionStorage.getItem('selected_method');
        console.log('ACESSO AO PRODUTO: ', method)
        const product_acess = await Utils.productAcess(method)

        const productData = {
            userId: await UserData.getUserId(),
            product_name: $('#name-product').val(),
            product_price: $('#price-product').val(),
            product_description: $('#description').val(),
            category: $('#category').val(),
            product_acess: product_acess,
            image_url: upload_image,
            banner_url: upload_banner,

        }


        const response = await axios.post('http://localhost:3013/api/v2/live/server', {
            reqType: 'create/product',
            productData: productData,

        });

        if (response.data) {
            setAnOutPut(response.data.message, "S-M")
            return
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


document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    addLoadAnim('create-product', 'Adicionar produto', true); 

    await saveProduct(); // espera a função async terminar

    addLoadAnim('create-product', 'Adicionar produto', false); // remove animação de loading
});



