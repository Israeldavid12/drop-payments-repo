

async function createOrderCallback() {
    resultMessage("");
    try {
        const response = await fetch("http://127.0.0.1:3010/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product ids and quantities
            body: JSON.stringify({
                cart: [
                    {
                        id: "1",
                        quantity: "1",
                    },
                ],
            }),
        });

        const orderData = await response.json();

        if (orderData.id) {
            return orderData.id;
        } else {
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error(error);
        resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
    }
}

async function onApproveCallback(data, actions) {
    try {
        const response = await fetch(`http://127.0.0.1:3010/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const orderData = await response.json();
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
        const errorDetail = orderData?.details?.[0];

        if (errorDetail || !transaction || transaction.status === "DECLINED") {
            // (2) Other non-recoverable errors -> Show a failure message
            let errorMessage;
            if (transaction) {
                errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
            } else if (errorDetail) {
                errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
            } else {
                errorMessage = JSON.stringify(orderData);
            }

            throw new Error(errorMessage);
        } else {
            // (3) Successful transaction -> Show confirmation or thank you message
            // Or go to another URL:  actions.redirect('thank_you.html');
            resultMessage(
                `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`
            );
            console.log(
                "Capture result",
                orderData,
                JSON.stringify(orderData, null, 2)
            );
        }
    } catch (error) {
        console.error(error);
        resultMessage(
            `Sorry, your transaction could not be processed...<br><br>${error}`
        );
    }
}

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
                        try {
                            const response = await fetch("http://127.0.0.1:3010/api/all-payment", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                // use the "body" param to optionally pass additional order information
                                // like product ids and quantities
                                body: JSON.stringify({
                                    reqType: "/api/orders",
                                    cart: [
                                        {
                                            id: "Y1",
                                            quantity: "YOUR_PRODUCT_QUANTITY",
                                        },
                                    ],
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
                        try {
                            const response = await fetch(
                                `http://127.0.0.1:3010/api/all-payment/${data.orderID}/capture`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        reqType: "/api/orders",
                                        cart: [
                                            {
                                                id: "YOUR_PRODUCT_ID",
                                                quantity: "YOUR_PRODUCT_QUANTITY",

                                            },
                                        ],
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
                                const transaction =
                                    orderData?.purchase_units?.[0]?.payments
                                        ?.captures?.[0] ||
                                    orderData?.purchase_units?.[0]?.payments
                                        ?.authorizations?.[0];
                                resultMessage(
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
                            resultMessage(
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
        default:
            break;
    }
})


window.addEventListener('load', async () => {
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
        default:
            break;
    }
})

