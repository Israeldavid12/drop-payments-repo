      // JavaScript para esconder a tela de carregamento quando a página estiver completamente carregada
      window.addEventListener('load', function () {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('content').classList.remove('hidden');
    });

    function toggleDropdown(id) {
        var element = document.getElementById(id);
        var isDisplayed = element.style.display === 'block';
        element.style.display = isDisplayed ? 'none' : 'block';
        const profileFoto = document.getElementById("userMenu");
       profileFoto.classList.add('zoomIn'); // Adiciona a animação
    }


    function toggleDropdownmy(id) {
        var element = document.getElementById(id);
        var isDisplayed = element.style.display === 'block';
        element.style.display = isDisplayed ? 'none' : 'block';
    }


    document.getElementById("productForm").style.display = 'none';
    document.getElementById("productFormUpsell").style.display = 'none';
    document.getElementById("productFormDownsell").style.display = 'none';
    
   

    const principalProduct = document.getElementById('principalProduct');
    principalProduct.addEventListener('click', () => {
        document.getElementById("active2").style.display = "none";
        document.getElementById("active").style.display = "block";
        document.getElementById("conteudo").style.display = 'none';
        document.getElementById("productFormUpsell").style.display = 'none';
        document.getElementById("productForm").style.display = 'block';
        document.getElementById("productFormDownsell").style.display = 'none';
        
    });

    const homepage = document.getElementById('homepage');
    homepage.addEventListener('click', () => {
        document.getElementById("active2").style.display = "none";
        document.getElementById("conteudo").style.display = 'block';
        document.getElementById("active").style.display = "block";
        document.getElementById("productForm").style.display = 'none';
        document.getElementById("productFormDownsell").style.display = 'none';
        document.getElementById("productFormUpsell").style.display = 'none';
        
    });

    const upsellProduct = document.getElementById('upsellProduct');
    upsellProduct.addEventListener('click', () => {
        document.getElementById("conteudo").style.display = 'none';
        document.getElementById("productForm").style.display = 'none';
        document.getElementById("productFormUpsell").style.display = 'block';
        
    });

    const downsellProduct = document.getElementById('downsellProduct');
    downsellProduct.addEventListener('click', () => {
        document.getElementById("productFormDownsell").style.display = 'block';
        document.getElementById("conteudo").style.display = 'none';
        document.getElementById("productForm").style.display = 'none';
        document.getElementById("productFormUpsell").style.display = 'none';
    });


    const produtos = document.getElementById('principalProductmy');

   produtos.addEventListener('click', () => {
        window.location.href = "https://www.dropaymentsmz.online/produtos";
    });
   
    const vendas = document.getElementById('vendasPage');

   vendas.addEventListener('click', () => {
        window.location.href = "https://www.dropaymentsmz.online/vendas";
    });

    const upsell = document.getElementById('upsellProductmy');

    upsell.addEventListener('click', () => {
         window.location.href = "https://www.dropaymentsmz.online/upsells";
     });


     const downsell = document.getElementById('downsellProductmy');

     downsell.addEventListener('click', () => {
          window.location.href = "https://www.dropaymentsmz.online/downsells";
      });


      const paymentMethod = document.getElementById('paymentMethod');

    paymentMethod.addEventListener('click', () => {
          window.location.href = "https://www.dropaymentsmz.online/payment-method";
       });

       const myacc = document.getElementById('myacc');

       myacc.addEventListener('click', () => {
             window.location.href = "https://www.dropaymentsmz.online/myaccount";
          });

          
          
       const help = document.getElementById('help');

         help.addEventListener('click', () => {
                window.location.href = "https://api.whatsapp.com/send?phone=258863814050&text=Preciso%20de%20ajuda...";
             });
        
   const pixelpage = document.getElementById('pixelpage');

    pixelpage.addEventListener('click', () => {
       window.location.href = "https://www.dropaymentsmz.online/fb-pixel";
   });

   const editcheckout = document.getElementById('editcheckout');

   editcheckout.addEventListener('click', () => {
       window.location.href = "https://www.dropaymentsmz.online/checkout_config";
   });

   document.getElementById("shopifyIntegration").addEventListener('click', () => {
    document.getElementById("active").style.display = "none";
    document.getElementById("active2").style.display = "block";
 });

 
 document.getElementById("apiDoc").addEventListener('click', () => {
    window.location.href = "https://www.dropaymentsmz.online/api-docs/#/default";
 });

   
   const funelPage = document.getElementById('funelPage');

   funelPage.addEventListener('click', () => {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('mpesaPopup').style.display = 'block';
    infoText.textContent = "A criacao de Funil de Venda estara disponivel em breve.";
    document.querySelector('.imagePopup').src = 'assests/mpesa.jpg';
    document.getElementById('infoError').style.color = "red";

   });

   function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('mpesaPopup').style.display = 'none';
}

document.getElementById('saques').addEventListener('click', function() {
    window.location.href = "https://www.dropaymentsmz.online/saques";
});


document.getElementById('instaPage').addEventListener('click', function() {
    window.location.href = "https://www.instagram.com/drop_payments_mz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
});
document.getElementById('supportPage').addEventListener('click', function() {
    window.location.href = "https://api.whatsapp.com/send?phone=258863814050&text=Preciso%20de%20ajuda...";
});

document.getElementById('apiCrendentials').addEventListener('click', function() {
    window.location.href = "https://api.whatsapp.com/send?phone=258863814050&text=Quero%20obter%20acesso%20a%20API.";
});

const infoText =  document.getElementById("textInfo");

//document.getElementById('shopifyIntegration').addEventListener('click', function() {
  //  document.getElementById('overlay').style.display = 'block';
  ///  document.getElementById('mpesaPopup').style.display = 'block';
  // infoText.textContent = "A integracao com Shopify estara disponivel em breve.";
// });




document.getElementById('productType').addEventListener('change', function() {
    const linkDiv = document.getElementById('productLinkDiv');
    const fileDiv = document.getElementById('productDocDiv');
    const fileInput = document.getElementById('productDoc');

    if (this.checked) {
        linkDiv.style.display = 'block'; // Mostrar campo de link externo
        fileDiv.style.display = 'none';  // Ocultar campo de arquivo PDF
        fileInput.required = false; // Tornar o arquivo PDF não obrigatório
    } else {
        linkDiv.style.display = 'none'; // Ocultar campo de link externo
        fileDiv.style.display = 'block'; // Mostrar campo de arquivo PDF
        fileInput.required = true;  // Tornar o arquivo PDF obrigatório novamente
    }
});





document.getElementById('donate').addEventListener('click', function() {
    window.location.href = "https://api.whatsapp.com/send?phone=258863814050";
});

document.getElementById('saquesHistoryView').addEventListener('click', function() {
    window.location.href = "https://dropaymentsmz.online/saques";
});

document.getElementById('vendasHistoryView').addEventListener('click', function() {
    window.location.href = "https://dropaymentsmz.online/vendas";
});

document.getElementById('comunidade').addEventListener('click', function() {
    window.location.href = "https://chat.whatsapp.com/EWw6uuMvY91DIp0sDZm1MT";
});

document.getElementById('showSaquepop').addEventListener('click', function() {
    const popupBackground3 = document.getElementById('product-pop-container-3');
    popupBackground3.style.display = 'block';
});

document.getElementById('showSaquepopPay').addEventListener('click', function() {
    const popupBackground4 = document.getElementById('product-pop-container-4');
    popupBackground4.style.display = 'block';
});
document.getElementById('sendMoney').addEventListener('click', function() {
    const sendMoneyInfo = document.getElementById('sendMoneyInfo');
    sendMoneyInfo.style.display = 'block';
});


 // Função para selecionar o menu
 function selectMenu(selectedItem) {
    // Remover o background de todos os itens
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
      item.classList.remove('selected');
    });

    // Adicionar o background ao item clicado
    selectedItem.classList.add('selected');
  }



  const imagem = document.getElementById('paypalBalance');
  const button = document.getElementById('hideBalance');
  let isBlurred = false;

  button.addEventListener('click', () => {
      if (isBlurred) {
          // Remove o blur e muda o ícone
          imagem.style.filter = 'none';
          button.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
      } else {
          // Adiciona o blur e muda o ícone
          imagem.style.filter = 'blur(5px)';
          button.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
      }

      // Alterna o estado
      isBlurred = !isBlurred;
  });


  
  const saldoDisponivel = document.getElementById('saldoDisponivel');
  const hideFirstBalance = document.getElementById('hideFirstBalance');
  let isBlurredt_Two = false;

  hideFirstBalance.addEventListener('click', () => {
      if (isBlurredt_Two) {
          // Remove o blur e muda o ícone
          saldoDisponivel.style.filter = 'none';
          hideFirstBalance.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
      } else {
          // Adiciona o blur e muda o ícone
          saldoDisponivel.style.filter = 'blur(5px)';
          hideFirstBalance.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
      }

      // Alterna o estado
      isBlurredt_Two = !isBlurredt_Two;
  });

 






// Função que converte valor de moeda MZN para número inteiro
function convertCurrencyToNumber(currency) {
    // Remove "MZN", pontos de milhar e converte a vírgula decimal para ponto
    let numericValue = currency.replace(/[^\d,]/g, ''); // Remove MZN e caracteres não numéricos, exceto vírgula
    numericValue = numericValue.replace(/\./g, ''); // Remove os pontos de milhar
    numericValue = numericValue.replace(',', '.'); // Substitui vírgula por ponto decimal
    return parseFloat(numericValue); // Converte para float
}

// Função que atualiza a barra de progresso
function updateProgressBar(value) {
    const max = 100000; // valor máximo: 1 milhão
    const progress = (value / max) * 100; // calcula a percentagem
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progress-text');

    // Atualiza a largura da barra de progresso
    progressBar.style.width = progress + '%';

    // Atualiza o texto da barra
   progressText.textContent = value.toLocaleString('pt-BR', { style: 'currency', currency: 'MZN' });
}

  // Função que busca o valor do elemento e atualiza a barra após 5 segundos
  function fetchValueAndUpdateProgress() {
    // Simula o tempo de busca no banco de dados (5 segundos)
    setTimeout(function() {
        const valueFromDB = document.getElementById('vendasFeitas').textContent; // Obtém o valor do span
        const numericValue = convertCurrencyToNumber(valueFromDB); // Converte para número
        updateProgressBar(numericValue); // Atualiza a barra de progresso
    }, 9000);
}

// Chama a função de fetch após 5s
fetchValueAndUpdateProgress()