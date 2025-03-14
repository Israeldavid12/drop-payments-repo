import { addLoadAnim, pageLoader, setAnOutPut } from "../../animations/index.js";
import { getUserId } from "../../user/user_data.mjs";


export function value(id) {
    const value = document.getElementById(id).checked;
    return value
}
async function setFieldsData() {
    try {
        pageLoader(true)
        const fields_data = await axios.post('http://127.0.0.1:3013/api/v2/live/server', {
            userId: await getUserId(),
            reqType: 'user_checkout_config'
        });
        const input_fields = fields_data.data.checkout;
        console.log(input_fields.mpesa)

        if (input_fields) {
            if (input_fields.mpesa === true) {
                document.getElementById("mpesa").checked = true;
            }

            if (input_fields.emola === true) {
                document.getElementById("emola").checked = true;
            }
            if (input_fields.paypal === true) {
                document.getElementById("paypal").checked = true;
            }

            if (input_fields.manualPrice === true) {
                document.getElementById("manualPrice").checked = true;
            }

            if (input_fields.nameBuyer === true) {
                document.getElementById("nameBuyer").checked = true;
            }

            if (input_fields.emailBuyer === true) {
                document.getElementById("emailBuyer").checked = true;
            }
            if (input_fields.whatsappBuyer === true) {
                document.getElementById("whatsappBuyer").checked = true;
            }
        } else {

        }




        setTimeout(() => {
            pageLoader(false)
        }, 1000)

    } catch (error) {
        console.log(error)
    }
}


async function saveFieldsData() {
    try {

        addLoadAnim("save-config", "Salvar alteracoes", true);

        let payloadSettings = {
            reqType: 'save_user_checkout_config',
            userId: await getUserId(),
            checkout: {
                autoSales: false,
                bannerCheckbox: true,
                emailBuyer: value('emailBuyer'),
                emola: value('emola'),
                paypal: value('paypal'),
                manualPrice: value('manualPrice'),
                mozIcon: false,
                mpesa: value('mpesa'),
                nameBuyer: value('nameBuyer'),
                supportCheckbox: false,
                supportLink: "",
                whatCheckEnabled: false,
                whatsappBuyer: value('whatsappBuyer')
            }
        }

        const request = await axios.post('http://127.0.0.1:3013/api/v2/live/server', payloadSettings);

        console.log(request.data)

        const response = request.data.message;
        setAnOutPut(response, 'S-M');

        addLoadAnim("save-config", "Salvar alteracoes", false)

    } catch (error) {
        console.log(error)
        addLoadAnim("save-config", "Salvar alteracoes", false);
    }


}


document.body.addEventListener("click", async function (event) {
    if (event.target && event.target.matches('.save-config-checkout')) {
       await saveFieldsData();
    }
})

setFieldsData()