import { pageLoader } from "../../../app/src/animations/index.js";
import { productNotFoundAlert } from "../alerts/product-not-found.js";

const UrlParams = new URLSearchParams(window.location.search);
const productId = UrlParams.get('id');



async function getProductData() {

    try {
        const productData = await axios.post('http://127.0.0.1:3013/api/balance', {
            productId: productId,
            reqType: 'product_data',
        });

        if (productData.data.code === 'E-0') {
            console.log('Produto nao encontrado');
            productNotFoundAlert();
            pageLoader(false);
            return
           
        } else {
            const product = productData.data.product;
            const price = Number(product.price).toFixed(2);
            const uid = product.userId;
            document.getElementById('productName').textContent = product.name;
            document.getElementById('productPrice').textContent = price + ' MT';
            document.getElementById('image-url').src = product.imageUrl;

            setTimeout(() => {
                pageLoader(false)
            }, 1500);

            return {
                uid: uid,
                bannerUrl: product.bannerUrl
            };
        }


    } catch (error) {
       console.log(error);
    }

}


async function userCheckoutConfig(data) {

   try {
    const checkout_data = await axios.post('http://127.0.0.1:3013/api/balance', {
        userId: data.uid,
        reqType: 'user_checkout_config'
    });

   
    const {bannerCheckbox, emailBuyer, manualPrice} = checkout_data.data.checkout;
    console.log(checkout_data.data.checkout);

    if (bannerCheckbox === true) {
        console.log(data.bannerUrl);
        document.getElementById('baner-url').src = data.bannerUrl;
        document.getElementById('baner-url').style.display = 'block';
    } 

    if (manualPrice === true) {
        document.getElementById('divpriceInserted').style.display = 'flex';
    }
    
    // if (emailBuyer === true) {
    //     document.getElementById('').style.display = 
    // }



   } catch (error) {
    console.log(error)
   }
}



getProductData(productId)

userCheckoutConfig(await getProductData());
