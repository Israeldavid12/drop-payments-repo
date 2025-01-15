// main.js
import { pegarValoresDeMultiplasChaves } from './checkoutDef.js';

document.addEventListener('DOMContentLoaded', () => {
  pegarValoresDeMultiplasChaves()
    .then((data) => {
      if (data) {
        // Atualiza os checkboxes com os dados obtidos
        document.getElementById("autoSalesCheckbox").checked = data.autoSales === true;
        document.getElementById("priceCheckbox").checked = data.manualPrice === true;
        document.getElementById("nameCheckbox").checked = data.nameBuyer === true;
        document.getElementById("emailCheckbox").checked = data.emailBuyer === true;
        document.getElementById("whatsappCheckbox").checked = data.whatsappBuyer === true;
        document.getElementById("mozCheckbox").checked = data.mozIcon === true;
        document.getElementById("supportCheckbox").checked = data.supportCheckbox === true;
        document.getElementById("whatCheck").checked = data.whatCheckEnabled === true;
        document.getElementById("supportLink").value = data.supportLink;
       
      } else {
        console.log("Nenhum dado foi encontrado.");
      }
    })
    .catch((error) => {
      console.error("Erro ao obter os dados:", error);
    });
});

