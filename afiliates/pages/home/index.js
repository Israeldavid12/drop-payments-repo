export default () => {
    const container = document.createElement('div');

    const templatePage = `<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar Pixel do Facebook</title>
    <link rel="shortcut icon" href="assests/dp-logo.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
   
    <link rel="stylesheet" href="fb_pixel.css">
</head>

<body>
   

 
         <a href="#inicio"> <p><i class="fa-thin fa-house"></i> > Pagina incial </p> </a>
        <div class="box">
            <p class="titulo">Insira o codigo pixel no campo abaixo <i class="fa fa-code" aria-hidden="true"></i></p>
            <p style="text-align: center; font-size: 14px;" id="output"></p>
            <textarea id="textarea" name="text" placeholder="Insira o código do pixel aqui"
                class="form-control pixelInput" id="exampleFormControlTextarea1" rows="3"></textarea>
            <button id="save-pixel">Salvar codigo <i class="fas fa-save"></i>
            </button>
            <button class="back-button" onclick="backPage()"> Voltar <i class="fa fa-arrow-left" aria-hidden="true"></i>
            </button>
            <p> <i class="fa fa-info-circle" aria-hidden="true"></i> O codigo pixel inserido aqui sera carregado em
                todas as paginas de pagamento *</p>
        </div>
        <p>&copy; DROP PAYMENTS E.I</p>
    
   

  
</body>

</html>`;

container.innerHTML = templatePage;

return container;

}