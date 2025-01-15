// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

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

// Função para fazer o upload de uma nova imagem no Firebase Storage
async function uploadImage(file, productId) {
    if (!file) return null;

    const storageRef = ref(storage, `upsells/images/${productId}/${file.name}`);
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

        const productRef = doc(db, 'upsells', product.productId);
        await updateDoc(productRef, {
            imageUrl: newImageUrl,
            name: newName,
            price: newPrice
        });

        modal.remove();
        window.location.reload();
    });
}

// Função para mostrar o modal de confirmação de exclusão
function showDeleteConfirmationModal(product) {
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

    document.getElementById('confirm-delete').addEventListener('click', async () => {
        await deleteDoc(doc(db, 'upsells', product.productId));
        modal.remove();
        window.location.reload();
    });

    document.getElementById('cancel-delete').addEventListener('click', () => {
        modal.remove();
    });
}

// Função para buscar produtos
async function fetchProducts(userId) {
    const productsCollection = collection(db, "upsells");
    const q = query(productsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const product = { ...doc.data(), productId: doc.id };

        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

       
        productCard.innerHTML = `
            <img id="image" src="${product.imageUrl}" alt="Product Image" class="product-logo">
            <p id="idProduto">ID: ${product.productId}</p>
            <h2 id="name">${product.name}</h2>
            <h3 style="margin-bottom: 10px;" id="price">${product.price} MT</h3>
            <button href="#" class="edit-button">Editar</button>
            <button class="delete-button" style="background: red;" >Excluir</button>
            <hr>
            <br>
            <div class="checkout">
                <a href="https://dropaymentsmz.online/checkout-upsell?id=${product.productId}"> <img  style="width:20px; margin-right: 8px" src="assests/open.png" alt=""></a>
                <span class="copy-link"  style="font-weight: bold;" ><img style="width: 22px;" src="assests/copy.png" alt=""> LINK DO CHECKOUT COM M-PESA/EMOLA  </span>
                <p style="color: rgb(7, 145, 7); font-size: 16px; margin-top: 6px;" class="copyInfo" > </p>
                <br>
                <textarea class="mpesaLink" name=""  id="mpesaLink">https://dropaymentsmz.online/checkout-upsell?id=${product.productId}</textarea>

            </div>
            <br>
                
                 <a href="https://dropaymentsmz.online/checkout-paypal-upsell?id=${product.productId}"> <img  style="width:20px; margin-right: 8px" src="assests/open.png" alt=""></a>

                 <span class="copy-link-paypal"  style="font-weight: bold;" ><img style="width: 22px;" src="assests/copy.png" alt=""> LINK DO CHECKOUT COM PAYPAL  </span>
                 <p style="color: rgb(7, 145, 7); font-size: 16px; margin-top: 6px;" class="copyInfo2" > </p>
                 <br>
                <textarea  class="paypalLink" name="" id="">https://dropaymentsmz.online/checkout-paypal-upsell?id=${product.productId}</textarea>
                
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

         // Event listener para copiar link
         const copyLinkSpan = productCard.querySelector('.copy-link');
         const copyLinkSpanPaypal = productCard.querySelector('.copy-link-paypal');
         const checkoutLink = productCard.querySelector('.mpesaLink').value;
         const checkoutLinkPaypal = productCard.querySelector('.paypalLink').value;
         const copyInfo = productCard.querySelector('.copyInfo');
         const copyInfo2 = productCard.querySelector('.copyInfo2');
         console.log(checkoutLink);
 
         copyLinkSpan.addEventListener('click', () => {
             navigator.clipboard.writeText(checkoutLink).then(() => {
                 copyInfo.textContent = "Link de checkout com M-pesa e e-Mola copiado para a área de transferência!";

             }).catch(err => {
                 console.error('Erro ao copiar o link: ', err);
                 copyInfo.textContent = 'Erro ao copiar o link';

             });
         });
 
         copyLinkSpanPaypal.addEventListener('click', () => {
             navigator.clipboard.writeText(checkoutLinkPaypal).then(() => {
                copyInfo2.textContent = 'Link do checkout com PayPal copiado para a área de transferência!';
             }).catch(err => {
                 console.error('Erro ao copiar o link: ', err);
                 copyInfo2.textContent = 'Erro ao copiar o link';
             });
         });

        document.querySelector('.product-grid').appendChild(productCard);
    });
}

// Verificar se o usuário está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        console.log('Usuário autenticado:', user);
        fetchProducts(userId);
    } else {
        console.log('Usuário não autenticado. Redirecionando para login...');
        window.location.href = 'https://www.dropaymentsmz.online/entrar';
    }
});

// Esconder tela de carregamento quando a página estiver completamente carregada
window.addEventListener('load', function () {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('content').classList.remove('hidden');
});
