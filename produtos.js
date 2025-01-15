// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { getDatabase, ref as refDb, set, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfNNPtqhpG7ShUJo8n89ONoKOq45Xy91w",
    authDomain: "drop-payments-mz.firebaseapp.com",
    databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "drop-payments-mz",
    storageBucket: "drop-payments-mz.appspot.com",
    messagingSenderId: "983262508468",
    appId: "1:983262508468:web:c0a6e26cf8789807b26ee1",
    measurementId: "G-JBP3RN50WS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);






// Função para fazer o upload de uma nova imagem no Firebase Storage
async function uploadImage(file, productId) {
    if (!file) return null;

    const storageRef = ref(storage, `products/images/${productId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

// Função para criar o modal de edição de produto
function createEditModal(product) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Editar Produto</h2>
            <form id="edit-product-form">
                <label for="edit-image">Imagem do Produto</label>
                <input type="file" id="edit-image" accept="image/*">

                <label for="edit-name">Nome do Produto</label>
                <input type="text" id="edit-name" value="${product.name}">

                <label for="edit-price">Preço</label>
                <input type="text" id="edit-price" value="${product.price}">

                <button type="submit">Salvar</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });

    const form = document.getElementById('edit-product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button');
        submitButton.textContent = "Salvando alterações...";

        const newName = document.getElementById('edit-name').value;
        const newPrice = document.getElementById('edit-price').value;
        const newImageFile = document.getElementById('edit-image').files[0];

        let newImageUrl = product.imageUrl;
        if (newImageFile) {
            newImageUrl = await uploadImage(newImageFile, product.productId);
        }

        const productRef = doc(db, 'products', product.productId);
        await updateDoc(productRef, {
            imageUrl: newImageUrl,
            name: newName,
            price: newPrice
        });

        modal.remove();
        window.location.reload();
    });
}










function createModalLinks(product) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Links de divulgação</h2>
            
            <form style="margin-top: 10px;" id="link-product-form">
                <div class="link-container">
                    <label for="edit-name">Página de pagamento predefinida</label>
                    <img style="width: 160px;" src="../assests/mpesa-emolabaner.png" alt="visa/master card paypal">
                    <input style="color: #3a3a3a; font-size: 17px;" type="text" class="link-value" value="https://dropaymentsmz.online/checkout?id=${product.productId}">
                    <button type="button" class="copy-btn" style="background-color: #fff; border: 1px solid rgb(111, 111, 226); color: rgb(111, 111, 226);">
                        <i class="fa fa-clone" aria-hidden="true"></i> Copiar
                    </button>
                    <button type="button" class="view-btn" style="background-color: #fff; border: 1px solid rgb(111, 111, 226); color: rgb(111, 111, 226);">
                        <i class="fa fa-external-link" aria-hidden="true"></i> Ver
                    </button>
                    <p class="copy-status" style="color: rgb(18, 168, 18); display: none;">copiado</p>
                </div>
                <!-- Repetir para os outros inputs -->
                <div class="link-container">
                    <label for="edit-price">Página de pagamento personalizada</label>
                    <img style="width: 160px;" src="../assests/mpesa-emolabaner.png" alt="visa/master card paypal">
                    <input style="color: #3a3a3a; font-size: 17px;" type="text" class="link-value" value="https://dropaymentsmz.online/checkout-typed?id=${product.productId}">
                    <button type="button" class="copy-btn" style="background-color: #fff; border: 1px solid rgb(111, 111, 226); color: rgb(111, 111, 226);">
                        <i class="fa fa-clone" aria-hidden="true"></i> Copiar
                    </button>
                    <button type="button" class="view-btn" style="background-color: #fff; border: 1px solid rgb(111, 111, 226); color: rgb(111, 111, 226);">
                        <i class="fa fa-external-link" aria-hidden="true"></i> Ver
                    </button>
                    <p class="copy-status" style="color: rgb(18, 168, 18); display: none;">copiado</p>
                </div>
                <div class="link-container">
                    <label for="edit-price">Checkout Internacional (Visa/ Master card/Paypal)</label>
                    <img style="width: 160px;" src="../assests/visamastercard.png" alt="visa/master card paypal">
                    <input style="color: #3a3a3a; font-size: 17px; " type="text" class="link-value" value="https://dropaymentsmz.online/checkout_pl_typed?id=${product.productId}">
                    <button type="button" class="copy-btn" style="background-color: #fff; border: 1px solid rgb(111, 111, 226); color: rgb(111, 111, 226);"">
                        <i class="fa fa-clone" aria-hidden="true"></i> Copiar
                    </button>
                    <button type="button" class="view-btn" style="background-color: #fff; border: 1px solid rgb(111, 111, 226); color: rgb(111, 111, 226); "">
                        <i class="fa fa-external-link" aria-hidden="true"></i> Ver
                    </button>
                    <p  class="copy-status" style="color: rgb(18, 168, 18); display: none;">copiado</p>
                </div>
            </form>
            <h5 style="font-weight: 500;">São links gerados para você vender este produto. Toda venda feita a partir de um link de divulgação será creditada na conta criadora do produto automaticamente.</h5>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });


    // Adicionando eventos para copiar e ver links
    modal.querySelectorAll('.copy-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const linkInput = btn.previousElementSibling;


            navigator.clipboard.writeText(linkInput.value).then(() => {
                alert("copiado");
            }).catch(err => {
                console.error('Erro ao copiar o link: ', err);
                alert("Erro ao copiar o link: '", err);
            });
        });
    });

    modal.querySelectorAll('.view-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const linkInput = btn.previousElementSibling.previousElementSibling; // pega o input correspondente
            window.open(linkInput.value, '_blank'); // abre o link em nova aba
        });
    });
}


















// Função para mostrar o modal de confirmação de exclusão
function showDeleteConfirmationModal(product) {
    console.log(product.imageUrl);
    console.log(product.bannerUrl);
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Tem certeza que deseja excluir este produto?</h3>
            <button style="background: red;" id="confirm-delete">Confirmar</button>
            <button id="cancel-delete">Cancelar</button>
        </div>
    `;
    document.body.appendChild(modal);

    function getPathFromUrl(url) {
        const decodedUrl = decodeURIComponent(url);
        const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
        return pathMatch ? pathMatch[1] : null;
    }


    document.getElementById('confirm-delete').addEventListener('click', async () => {
        const user_id = product.userId;
        const docUrl = product.docUrl;
        const imageUrl = product.imageUrl;
        const bannerUrl = product.bannerUrl;

        // Extrai os caminhos relativos
        const docPath = getPathFromUrl(docUrl);
        const imagePath = getPathFromUrl(imageUrl);
        const bannerPath = getPathFromUrl(bannerUrl);

        if (!docPath || !imagePath || !bannerPath) {
            console.error("Erro ao extrair caminhos das URLs.");
        }

        // Cria referências usando os caminhos relativos
        const fileRef = ref(storage, docPath);
        const imageRef = ref(storage, imagePath);
        const bannerRef = ref(storage, bannerPath);

        try {
            // Excluindo documentos
            await deleteObject(imageRef);
            console.log('Imagem excluída com sucesso');
            await deleteObject(bannerRef);
            console.log('Banner excluído...');
            await deleteObject(fileRef);
            console.log("Arquivo excluído com sucesso.");

        } catch (error) {
            console.error("Erro ao excluir os arquivos ou o produto:", error.message);
        }
        
        await deleteDoc(doc(db, 'products', product.productId));
        console.log("Produto excluído com sucesso.");

        const quantityRef = refDb(database, `users/${user_id}/quantity`);
        const snapshot = await get(quantityRef);
        if (snapshot.exists()) {
            let currentQuantity = snapshot.val();
            const newQuantity = currentQuantity - 1;
            await set(quantityRef, newQuantity);
            console.log(`Quantidade atualizada com sucesso: ${newQuantity}`);
        } else {
            console.error("A chave 'quantity' não existe.");
        }
        modal.remove();
        window.location.reload();
    });

    document.getElementById('cancel-delete').addEventListener('click', () => {
        modal.remove();
    });
}

// Função para buscar produtos
async function fetchProducts(userId) {
    
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const product = { ...doc.data(), productId: doc.id };
    
        setTimeout(() => {
            if (!product.imageUrl) {
                console.log('erro');
                document.getElementById('info').innerText = 'Nenhum produto enctrado.';
            }
        }, 3000 );
       

        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
          
            <img id="image" src="${product.imageUrl}" alt="Product Image" class="product-logo">
            <p class="satus-sales" >Vendas ativas</p>
            <p id="idProduto">ID: <strong> ${product.productId}</strong></p>
            <h2 id="name">${product.name}</h2>
            <h3 style="margin-bottom: 10px;" id="price">${product.price} MT</h3>
            <button href="#" class="edit-button">Editar</button>
            <button class="delete-button" style="background: red;" >Excluir</button>
        
             <button style=' width: 100%;' class="links-button">Links de divulgação</button> 

            <div class="checkout">
                <span  style="font-weight: bold;  font-size: 14px; " > CHECKOUT PREDEFINIDO  </span>
                <br>
                 <a href="https://dropaymentsmz.online/checkout?id=${product.productId}"> <img  style="width:20px; margin-right: 2px" src="assests/open.png" alt=""></a>
                <img  class="copy-link"  style="width: 22px;" src="assests/copy.png" alt="">
                 <p style="color: rgb(7, 145, 7); font-size: 16px; margin-top: 6px;" class="copyInfo" > </p>
                 <div class="img-methods" >
                     <img src="checkou-assets/mpesa-red.png" alt="">
                      <img src="assests/emola.png" alt="">
                 </div>
                <br>
                <textarea class="mpesaLink" name=""  id="mpesaLink">https://dropaymentsmz.online/checkout?id=${product.productId}</textarea>
            </div>
            
             <br>
      
           <div class="checkout">
                <span  style="font-weight: bold;  font-size: 14px; " > CHECKOUT PERSONALIZADO </span>
                <br>
                 <a href="https://dropaymentsmz.online/checkout-typed?id=${product.productId}"> <img  style="width:20px; margin-right: 2px" src="assests/open.png" alt=""></a>
                <img  class="copy-link3"  style="width: 22px;" src="assests/copy.png" alt="">
                 <p style="color: rgb(7, 145, 7); font-size: 16px; margin-top: 6px;" class="copyInfo3" > </p>
                 <div class="img-methods" >
                     <img src="checkou-assets/mpesa-red.png" alt="">
                      <img src="assests/emola.png" alt="">
                 </div>
                <br>
                <textarea class="typed" name=""  id="mpesaLink">https://dropaymentsmz.online/checkout-typed?id=${product.productId}</textarea>

            </div>




    
             <div class="checkout">
                 <span  style="font-weight: bold;  font-size: 14px; text-aligm: center;  " > CHECKOUT COM PAYPAL  </span> 
                 <br>
                 <a href="https://dropaymentsmz.online/checkout_pl_typed.html?id=${product.productId}"> <img  style="width:20px; margin-right: 2px" src="assests/open.png" alt=""></a>
                <img  class="copy-link-paypal" style="width: 22px;" src="assests/copy.png" alt="">
                  <p style="color: rgb(7, 145, 7); font-size: 16px; margin-top: 6px;" class="copyInfo2" > </p>
                  <div class="img-methods" >
                     <img style="border: 0.5px solid #246ac5; padding: 3px;" src="assests/paypal.png" alt="">
                  </div>
                      <textarea  class="paypalLink" name="" id="">https://dropaymentsmz.online/checkout_pl_typed.html?id=${product.productId}</textarea>
                
            </div>
                </div>
        `;


        if (product.imageUrl) {
            document.querySelector(".infoProducts").style.display = "none";
        }
        
        

        // Event listener para editar o produto
        productCard.querySelector('.edit-button').addEventListener('click', () => {
            createEditModal(product);
        });

        // Event listener para excluir o produto
        productCard.querySelector('.delete-button').addEventListener('click', () => {
            showDeleteConfirmationModal(product);
        });

        // Event listener para ver links de divulgacao
        productCard.querySelector('.links-button').addEventListener('click', () => {
            createModalLinks(product);
        });

        // Event listener para copiar link
        const copyLinkSpan = productCard.querySelector('.copy-link');
        const copyLinkSpan3 = productCard.querySelector('.copy-link3');
        const copyLinkSpanPaypal = productCard.querySelector('.copy-link-paypal');
        const checkoutLink = productCard.querySelector('.mpesaLink').value;
        const checkoutLinkPaypal = productCard.querySelector('.paypalLink').value;
        const checkoutLinkTyped = productCard.querySelector('.typed').value;
        const copyInfo = productCard.querySelector('.copyInfo');
        const copyInfo2 = productCard.querySelector('.copyInfo2');
        const copyInfo3 = productCard.querySelector('.copyInfo3');
        console.log(checkoutLink);

        copyLinkSpan.addEventListener('click', () => {
            navigator.clipboard.writeText(checkoutLink).then(() => {
                copyInfo.textContent = "Link de checkout com M-pesa e e-Mola copiado para a área de transferência!";
                console.log(copyInfo);
            }).catch(err => {
                console.error('Erro ao copiar o link: ', err);
            });
        });


        copyLinkSpan3.addEventListener('click', () => {
            navigator.clipboard.writeText(checkoutLinkTyped).then(() => {
                copyInfo3.textContent = "Link de checkout personalizado copiado para a área de transferência!";
                console.log(copyInfo3);
            }).catch(err => {
                copyInfo3.textContent = "Erro ao copiar o link";
                console.error('Erro ao copiar o link: ', err);
            });
        });



        copyLinkSpanPaypal.addEventListener('click', () => {
            navigator.clipboard.writeText(checkoutLinkPaypal).then(() => {
                copyInfo2.textContent = 'Link do checkout com PayPal copiado para a área de transferência!';
            }).catch(err => {
                console.error('Erro ao copiar o link: ', err);
            });
        });


        document.querySelector('.product-grid').appendChild(productCard);
    });
}
// Verificar se o usuário está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        fetchProducts(userId);
    } else {
        console.log('Usuário não autenticado. Redirecionando para login...');
        window.location.href = 'https://dropaymentsmz.online/entrar';
    }
});


// Esconder tela de carregamento quando a página estiver completamente carregada
window.addEventListener('load', function () {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('content').classList.remove('hidden');
});
