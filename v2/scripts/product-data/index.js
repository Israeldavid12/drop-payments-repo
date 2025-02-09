import { pageLoader } from "../../../app/src/animations/index.js";
import { productNotFoundAlert } from "../alerts/product-not-found.js";
import { purchasePopup, getPage } from "../modals.js";

const UrlParams = new URLSearchParams(window.location.search);
const productId = UrlParams.get('id');

getPage("../checkout/modals-statics/purcchase-popup.html")

async function getProductData() {

    try {
        const productData = await axios.post('https://www.dropaymentsmz.online/api/balance', {
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
            pageLoader(false)

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


        const { bannerCheckbox, emailBuyer, manualPrice } = checkout_data.data.checkout;
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
        productNotFoundAlert();
        return
    }
}



// getProductData(productId)

// userCheckoutConfig(await getProductData());

// purchasePopup(false, 'm-pesa')

// // setTimeout(() => {
// //     purchasePopup(false, '')
// // }, 3000)


document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.mpesa-button')) {
        purchasePopup(true, "m-pesa")
        console.log('mpesa')
    }

});