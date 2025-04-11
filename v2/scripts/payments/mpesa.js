import { purchasePopup, getPage } from "../modals.js";
import { getProductId } from "../product-data/get-product-data.js";
import { checkFields } from "./process.js";


function buyerData() {
    const name = document.getElementById('buyer-name').value;
    const email = document.getElementById('buyer-email').value;
    const phone = document.getElementById('buyer-contact').value;

    const check_fields = checkFields();
    if (checkFields() === false) {
        console.log(check_fields)

        return false;

    } else {
        console.log(check_fields)
    }

    return {
        name: name,
        email: email,
        phone: phone
    };
}


async function processMpesaPayment() {
    try {
        const productId = await getProductId();
        const customerMSISDN = document.getElementById('customerMSISDN').value;
        const buyer_data = buyerData();
     
        if (buyer_data === false) {
            return;
        }


        const requestData = {
            customerMSISDN: customerMSISDN,
            productId: productId,
            buyerData: buyer_data,
        };

        const res = await axios.post('http://127.0.0.1:3030/api/v2/payment/mpesa/capture/', requestData, {
        });

        console.log(res.data);



    } catch (error) {
        console.log(error)

    }


}



document.body.addEventListener('click', async function (event) {
    if (event.target && event.target.matches('.mpesa-button')) {
        purchasePopup(true, "m-pesa");

        await processMpesaPayment();
        
        setTimeout(() => {
            purchasePopup(false, "m-pesa");
        }, 2000);

    }

});