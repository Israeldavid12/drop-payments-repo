import { formatBalance } from "../../../app/src/animations/index.js";
import { displayProductData } from "../product-data/get-product-data.js";


async function changeCurrency(exchange_type) {
    const data = await displayProductData()
    console.log(data.price)
    const exchange = await axios.post("https://www.dropaymentsmz.online/api/v2/live/server", {
        reqType: "exchange",
        exchange_type: exchange_type,
        price: data.price
    })
    console.log(exchange.data.result)
    return exchange.data.result

}



const currency = document.getElementById("currency")
currency.addEventListener("change", async function () {
    let currency_now = currency.value
    const price_field = document.getElementById("productPrice")

    if (currency_now === "BR") {
        const brl_currency = await changeCurrency("MZN-BRL")
        price_field.textContent = formatBalance(brl_currency, "BRL")

    } else if (currency_now === "USA") {
        const brl_currency = await changeCurrency("MZN-USD")
        price_field.textContent = formatBalance(brl_currency, "USD")

    } else if (currency_now === "RSA") {
        const brl_currency = await changeCurrency("MZN-ZAR")
        price_field.textContent = formatBalance(brl_currency, "ZAR")

    } else {
        const data = await displayProductData()
        price_field.textContent = (data.price).toFixed(2) + " MT"
    }


});

