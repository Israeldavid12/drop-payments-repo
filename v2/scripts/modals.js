export const purchasePopup = () => {
    const template = ` <div id="mpesaPopup">
        <div class="inline">
            <div class="lds-ring" bis_skin_checked="1">
                <div bis_skin_checked="1"></div>
                <div bis_skin_checked="1"></div>
                <div bis_skin_checked="1"></div>
                <div bis_skin_checked="1"></div>
            </div>
            <p id="infoError" style="color: #E21923; font-size: 16px; font-weight: bold; margin-left: 8px;">Insira o PIN
                e aguarde...</p>
        </div>

        <hr>
        <img class="imagePopup" id="imagePopup" src="../../checkou-assets/mpesa-red.png" alt="emola"
            style="border-radius: 10px; margin: 20px auto 10px; width: 60px; height: 60px;">
        <p>Introduza o PIN no Popup que aparecerá no seu telemóvel com o número indicado para finalizar o pagamento</p>
        <p style="font-size: 12px; margin-top: 4px; color: #0e0e0e; "><strong>*Por favor não recarregue ou saia desta
                página antes de concluir o pagamento!</strong></p>
        <button id="fechar" onclick="closePopup()" class="supporteEmail">Tentar novamente</button>
    </div>`;

    
}


export const setPurchaseNot = () => {
    const template = `<div class="checkmark">✔</div>
        <div class="message">
            <strong>Nova compra adquirida</strong>
            <span id="buyer-name"></span> efetuou uma nova compra
        </div>
        <div class="close-btn" id="close-notification">✕</div>`;
}