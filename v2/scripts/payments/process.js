import { productId } from "../product-data/get-product-data.js";
import { getUserIdByProductID } from "../product-data/userId.js";

function checkFields() {
    const div = document.querySelectorAll(".input-billing-adress")
    const output = document.querySelector(".output")
    const inputs = document.querySelectorAll(".billing-fields")
    let state = true;
    if (inputs[1].style.display != "none") {
        if (inputs[1].value === "") {
            div[1].classList.add("field-un-filled")
            state = false
            output.innerHTML = "<p>Por favor preencha o endereço de envio</p>";
            output.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return false;
        }
    } else {
        return true
    }
}



function buyerData() {


    const fields_div = document.querySelectorAll(".input-billing-adress");
    const fields_input = document.querySelectorAll(".billing-fields");

    let data = {};

    for (let i = 0; i < fields_input.length; i++) {

        if (fields_input[i].value != "") {
            data[fields_input[i].placeholder] = fields_input[i].value || "N/A";
        }
    }

    console.log("CAMPOS COLETADOS : ", data);
    return data;

}



async function paymentPayload(currency) {
    const data = await getUserIdByProductID();
    const payload = {
        productId: data.productId,
        originalAmount: data
    }
    return payload

}
const cart = async () => {
    const data = await getUserIdByProductID();
    const currencyCode = document.getElementById("currency").value;
    if (currencyCode === "MZ") {
        return {
            price: Number(data.price),
            currencyCode: "MZ"

        }

    } else if (currencyCode === "BR") {
        return {
            price: Number(data.price),
            currencyCode: "BR"

        }
    } else if (currencyCode === "USA") {
        return {
            price: Number(data.price),
            currencyCode: "USA"

        }
    }

}
console.log(await cart())

function displayPaymentMethod(name) {
    const div = document.createElement("div")
    const container = document.querySelector(".payment-methods-container")
    const mpesa_template = `<div class="input-billing-adress">
                <i class="bi bi-telephone"></i>
                <input type="text" placeholder="Telefone">
            </div> <br> <button class="mpesa-button">Pagar com M-Pesa</button>`;
    const emola_template = `<h2>Metodo de pagamento indisponivel!</h2> `;
    const paypal_template = ` <div id="paypal-button-container" class="paypal-button-container"></div>`;


    if (name === "mpesa") {
        container.innerHTML = '';
        div.innerHTML = mpesa_template;
        container.appendChild(div)
    }
    if (name === "emola") {
        container.innerHTML = '';
        div.innerHTML = emola_template;
        container.appendChild(div)
    }
    if (name === "pix") {
        container.innerHTML = '';
        div.innerHTML = emola_template;
        container.appendChild(div)
    }
    if (name === "paypal") {
       
        setTimeout(() => {
            window.paypal
                .Buttons({
                    style: {
                        shape: "rect",
                        layout: "vertical",
                        color: "gold",
                        label: "paypal",
                    },

                    async createOrder() {
                        const conditional = checkFields()
                        if (checkFields() === false) {
                            console.log(conditional)

                            return false;

                        } else {
                            console.log(conditional)
                        }
                        try {

                            const response = await fetch("http://127.0.0.1:3010/api/all-payment", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                               
                                // like product ids and quantities
                                body: JSON.stringify({
                                    reqType: "/api/orders",
                                    cart: await cart()
                                }),
                            });

                            const orderData = await response.json();

                            if (orderData.id) {
                                return orderData.id;
                            }
                            const errorDetail = orderData?.details?.[0];
                            const errorMessage = errorDetail
                                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                : JSON.stringify(orderData);

                            throw new Error(errorMessage);
                        } catch (error) {
                            console.error(error.response.data.error_datails);
                            // resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
                        }
                    },

                    async onApprove(data, actions) {
                        console.log(data.orderID)
                        try {
                            const response = await fetch(
                                `http://127.0.0.1:3010/api/all-payment`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        reqType: "/api/orders/:orderID/capture",
                                        orderID: data.orderID,
                                        productData: await getUserIdByProductID(),
                                        buyerData: buyerData(),
                                       

                                    }),
                                }
                            );

                            const orderData = await response.json();
                            // Three cases to handle:
                            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                            //   (2) Other non-recoverable errors -> Show a failure message
                            //   (3) Successful transaction -> Show confirmation or thank you message

                            const errorDetail = orderData?.details?.[0];

                            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                                // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                                // recoverable state, per
                                // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                                return actions.restart();
                            } else if (errorDetail) {
                                // (2) Other non-recoverable errors -> Show a failure message
                                throw new Error(
                                    `${errorDetail.description} (${orderData.debug_id})`
                                );
                            } else if (!orderData.purchase_units) {
                                throw new Error(JSON.stringify(orderData));
                            } else {
                                // (3) Successful transaction -> Show confirmation or thank you message
                                // Or go to another URL:  actions.redirect('thank_you.html');
                                

                                const email = document.getElementById("buyer-email").value;
                                window.location.href = `http://127.0.0.1:5501/v2/sucess/index.html?payer_email=${email}`


                                console.log(
                                    `Transaction ${transaction.status}: ${transaction.id}<br>
          <br>See console for all available details`
                                );
                                console.log(
                                    "Capture result",
                                    orderData,
                                    JSON.stringify(orderData, null, 2)
                                );
                            }
                        } catch (error) {
                            console.error(error);
                            console.log(
                                `Sorry, your transaction could not be processed...<br><br>${error}`
                            );
                        }
                    },
                })
                .render("#paypal-button-container");

        }, 200)
        container.innerHTML = '';
        div.innerHTML = paypal_template;
        container.appendChild(div)
    }
}








function setPaymentMethod() {
    console.log(window.location.hash)
    switch (window.location.hash) {
        case "#/e-mola":
            console.log("e-mola")
            displayPaymentMethod("emola")
            console.log("e-mola")
            break;
        case "#/m-pesa":
            displayPaymentMethod("mpesa")
            console.log("m-pesa")
            break;
        case "#/paypal":
            displayPaymentMethod("paypal")
            console.log("paypal")
            break;
        case "#/pix":
            displayPaymentMethod("pix")
            console.log("pix")
            break;
        default:
            break;
    }
}

setPaymentMethod()


window.addEventListener('hashchange', async () => {
    switch (window.location.hash) {
        case "#/e-mola":
            displayPaymentMethod("emola")
            console.log("e-mola")
            break;
        case "#/m-pesa":
            displayPaymentMethod("mpesa")
            console.log("m-pesa")
            break;
        case "#/paypal":
            displayPaymentMethod("paypal")
            console.log("paypal")
            break;
        case "#/pix":
            displayPaymentMethod("pix")
            console.log("pix")
            break;
        default:
            break;
    }
})



