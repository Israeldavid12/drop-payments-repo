import { pageLoader } from "../../../app/src/animations/index.js";
import { productNotFoundAlert } from "../alerts/product-not-found.js";
pageLoader(true)

export async function displayProductData() {

    const urlParams = new URLSearchParams(document.location.search)
    const productId = urlParams.get('id')
    console.log(productId)

    try {
        const productData = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            productId: productId,
            reqType: 'product_data',
        });

        if (productData.data.code === 'E-0') {
            console.log('Produto nao encontrado');
            pageLoader(false);
            productNotFoundAlert();
           
            return

        } else {
            const product = productData.data.product;
            const price = Number(product.price).toFixed(2);
            const uid = product.userId;
            document.getElementById('productName').textContent = product.name;
            document.getElementById('productPrice').textContent = price + ' MT';
            document.getElementById('image-url').src = product.imageUrl;
           

            return {
                uid: uid,
                bannerUrl: product.bannerUrl
            };
        }


    } catch (error) {
        console.log(error);
        productNotFoundAlert();
        return
    }

}


async function userCheckoutConfig(data) {

    try {
        const checkout_data = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            userId: data.uid,
            reqType: 'user_checkout_config'
        });


        const { bannerCheckbox, emailBuyer, manualPrice, nameBuyer, whatsappBuyer } = checkout_data.data.checkout;
        console.log(checkout_data.data.checkout);

        if (bannerCheckbox === true) {
            console.log(data.bannerUrl);
            document.querySelector('.banner').src = data.bannerUrl;
            document.querySelector('.banner').style.display = 'block';
        } else {
            document.querySelector('.banner').remove();
        }

        if ( manualPrice === true) {
            
        } else {
            document.querySelector(".box-manual-payment").remove()
        }

        
        if (nameBuyer === true) {
            
        } else {
            document.querySelectorAll(".input-billing-adress")[0].style.display = "none";
        }

        
        if (emailBuyer === true) {
            
        } else {
            document.querySelectorAll(".input-billing-adress")[1].style.display = "none";
        }


        if (whatsappBuyer === true) {
            
        } else {
            document.querySelectorAll(".input-billing-adress")[2].style.display = "none";
        }

        pageLoader(false)

    } catch (error) {
        console.log(error)
        return
    }
}

userCheckoutConfig(await displayProductData())
