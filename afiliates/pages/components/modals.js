 export default function saquepopup()  {
    const container = document.createElement('div');
    const popupTemplate = `<!-- Popup para solicitar saque -->
            <div class="product-pop-container-3" id="product-pop-container-3">
                <div class="saque-popup">
                    <p style="margin-bottom: 6px; text-align: start; font-size: 16px;">Obs: uma vez solicitado nao sera
                        possivel cancelar*</p>
                    <div class="balance">
                        <h4>Saldo disponivel <i class="fas fa-credit-card"></i></h4>
                        <p id="balancePreview">0.00 MT</p>
                    </div>
                    <input style="font-weight: 600; height: 40px;" id="valor" type="number" placeholder="0 MT">
                    <p style="font-size: 12px; margin-bottom: 8px;">Por favor insira um valor inteiro*</p>
                    <div class="confirm">
                        <input type="checkbox" name="" id="confirm"> Confirmar solicitação<br>
                    </div>
                    <button id="solicitarSaqueBtn" style=" background-color: #0056b3;">Solicitar</button>
                    <button onclick="closeSaquePopup()"
                        style=" background-color: #ffffff; color: #0056b3; border: 1px solid #0056b3;">Cancelar</button>
                    <div id="response-message" class="response-message"></div>
                </div>
            </div>`;
            
            container.innerHTML = popupTemplate;
            return container;
};

