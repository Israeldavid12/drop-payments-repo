import { addLoadAnim, pageLoader } from "../../animations/index.js";
import { getUserId } from "../../user/user_data.mjs";


export function value(id) {
    const value = document.getElementById(id).checked;
    return value
}
async function setFieldsData() {
    try {
        pageLoader(true)
        const fields_data = await axios.post('https://www.dropaymentsmz.online/api/balance', {
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


document.body.addEventListener("click", function (event) {
    if (event.target && event.target.matches('.save-config-checkout')) {
        addLoadAnim("save-config", "Salvar alteracoes", true)
        const mpesa = value("mpesa")
        console.log(mpesa)
        //  addLoadAnim("save-config", "Salvar alteracoes", false)
    }
})

// setFieldsData()