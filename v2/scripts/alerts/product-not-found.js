export function productNotFoundAlert() {
    const div = document.createElement('div');

    const template = `<div class="product-not-found"  >
        <img src="../assets/box.png" alt="">
        <p>PRODUTO NÃO ENCONTRADO <br> OU REMOVIDO! [ E-015 ]</p>
    </div>`;
    div.innerHTML = template;

    document.body.insertBefore(div, document.body.firstChild);
    
}