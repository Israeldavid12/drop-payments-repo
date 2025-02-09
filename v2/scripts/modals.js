export async function getPage(dir_name) {
    const page = await axios.get(dir_name)
    return page.data
}




export const purchasePopup = async (flag, type) => {

    if (flag === true) {
        if (type === "e-mola") {
            const div = document.createElement('div');
            div.classList.add('dynamic-popup')
            div.innerHTML = await getPage("../checkout/modals-statics/purcchase-popup.html");
            document.body.appendChild(div);
            document.getElementById("imagePopup").src = "../assets/emola.png";
            document.querySelector(".info-error").style.color = "#F4861E";
            const allLdsRingDivs = document.querySelectorAll('.lds-ring div');
            allLdsRingDivs.forEach(div => {
                div.style.borderColor = `#F4861E transparent transparent transparent`;
            });
        } else if (type === "m-pesa") {
            const div = document.createElement('div');
            div.classList.add('dynamic-popup')
            div.innerHTML = await getPage("../checkout/modals-statics/purcchase-popup.html");;
            document.body.appendChild(div);
        }
    } else if (flag === false) {
        document.body.querySelector('.dynamic-popup').remove()
    } else {
        console.error('ERRO AO CHMAR FUNCAO')
    }


}


export const setPurchaseNot = () => {
    const template = `<div class="checkmark">✔</div>
        <div class="message">
            <strong>Nova compra adquirida</strong>
            <span id="buyer-name"></span> efetuou uma nova compra
        </div>
        <div class="close-btn" id="close-notification">✕</div>`;
}