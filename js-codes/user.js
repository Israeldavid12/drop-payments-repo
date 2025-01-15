// Importando funções do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { getDatabase, ref as dbRef, set, update, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDfNNPtqhpG7ShUJo8n89ONoKOq45Xy91w",
    authDomain: "drop-payments-mz.firebaseapp.com",
    projectId: "drop-payments-mz",
    storageBucket: "drop-payments-mz.appspot.com",
    messagingSenderId: "983262508468",
    appId: "1:983262508468:web:c0a6e26cf8789807b26ee1", 
    databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app", 
    measurementId: "G-JBP3RN50WS"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);

// Verificar se o usuário está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
     
       

        // Exibir conteúdo
        //document.getElementById('content').style.display = 'block';

        // Função para buscar produtos e preencher os selects
       /* const populateProductSelect = async () => {
            try {
                const productSelect1 = document.getElementById('product-select');
                const productSelect2 = document.getElementById('product-select-2');
                productSelect1.innerHTML = ''; // Limpar antes de adicionar os novos itens
                productSelect2.innerHTML = ''; // Limpar antes de adicionar os novos itens

                // Verificar se o UID do usuário está correto
                console.log('ID do usuário logado:', user.uid);

                const productsRef = collection(db, 'products');
                const q = query(productsRef, where('userId', '==', user.uid)); // Filtrar produtos pelo userId do usuário logado

                // Buscar os produtos no Firestore
                const querySnapshot = await getDocs(q);

                // Se não encontrar produtos, exibir uma mensagem
                if (querySnapshot.empty) {
                    const option = document.createElement('option');
                    option.textContent = 'Nenhum produto encontrado';
                    productSelect1.appendChild(option);
                    productSelect2.appendChild(option.cloneNode(true)); // Clonar a opção para o segundo select
                } else {
                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        const option1 = document.createElement('option');
                        option1.value = product.productId;  // O valor pode ser o ID do produto
                        option1.textContent = product.name;  // O texto da opção será o nome do produto
                        productSelect1.appendChild(option1);

                        // Adicionar ao segundo select
                        const option2 = document.createElement('option');
                        option2.value = product.productId;  // O valor pode ser o ID do produto
                        option2.textContent = product.name;  // O texto da opção será o nome do produto
                        productSelect2.appendChild(option2);
                    });
                }

            } catch (error) {
                console.error("Erro ao buscar os produtos:", error);
            }
        };

        // Chamar a função para preencher os selects após o usuário estar autenticado
        populateProductSelect(); */

       





// Função para pré-visualizar a imagem
const productImageInput = document.getElementById('productImage');
const previewProductImage = document.getElementById('previewProductImage');
const productBannerInput = document.getElementById('productBanner');
const previewProductBanner = document.getElementById('previewProductBanner');
const productDocInput = document.getElementById('productDoc');


productDocInput.addEventListener('change', function(event) {
    const productDoc = productDocInput.files[0];
    if (productDoc && productDoc.size > 45 * 1024 * 1024) {
        document.getElementById('output0').style.display = 'block';
        document.getElementById('output0').innerText = 'O arquivo selecionado excede o limite de 45 MB.';
        setTimeout(() => {
            productDocInput.value = ""; 
          }, 1500); 
    }


});

productImageInput.addEventListener('change', function(event) {
    const productImage = productImageInput.files[0];
    if (productImage && productImage.size > 5 * 1024 * 1024) { // Limite de 5 MB
        document.getElementById('output2').style.display = 'block';
        document.getElementById('output2').innerText = 'O arquivo selecionado excede o limite de 5 MB.'
        setTimeout(() => {
            productImageInput.value = ""; 
          }, 2000); 
      }
    
      

    if (productImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewProductImage.src = e.target.result;
            previewProductImage.style.display = 'block';
        }
        reader.readAsDataURL(productImage); 
    } else {
        previewProductImage.src = "#";
        previewProductImage.style.display = 'none';
    }
    
});

// Função para pré-visualizar o banner
productBannerInput.addEventListener('change', function(event) {
    const productBanner = productBannerInput.files[0];

    if (productBanner && productBanner.size > 5 * 1024 * 1024) { // Limite de 5 MB
        document.getElementById('output1').style.display = 'block';
        document.getElementById('output1').innerText = 'O arquivo selecionado excede o limite de 5 MB.';
        setTimeout(() => {
            productBannerInput.value = ""; 
          }, 2000); 
      }

    if (productBanner) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewProductBanner.src = e.target.result;
            previewProductBanner.style.display = 'block';
        }
        reader.readAsDataURL(productBanner); // Lê o conteúdo do banner para pré-visualização
    } else {
        previewProductBanner.src = "#";
        previewProductBanner.style.display = 'none';
    }

});

// Configurar o formulário de cadastro
const form = document.getElementById('productForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar o reload da página
    document.getElementById("productForm").style.opacity = '25%';
    
    const addProduct = document.getElementById('addProduct');
    addProduct.innerHTML = `<i style="display: flex; align-self: center; justify-self: center; z-index: 10000;" class="fas fa-circle-notch fa-spin fa-2x"></i>`;

    //const popupBackground = document.getElementById('product-pop-container-2');
    //popupBackground.style.display = 'block';

    // Pegar os valores dos campos
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productDescription = document.getElementById('productDescription').value;
    const productImage = document.getElementById('productImage').files[0]; // Imagem do produto
    const productDoc = document.getElementById('productDoc').files[0]; // Arquivo PDF do produto
    const productLink = document.getElementById('productLink').value; // Link externo do produto
    const isExternalLink = document.getElementById('productType').checked; // Verifica se o usuário escolheu link externo
    const productBanner = document.getElementById('productBanner').files[0]; // Banner do produto (opcional)

    const messageElement = document.getElementById('output');
    const output_position = document.getElementById('infoBasic');
    messageElement.style.display = 'block';

    // Validar imagem
    if (!productImage) {
        messageElement.textContent = 'Por favor, selecione uma imagem.';
        document.getElementById("productForm").style.opacity = '100%';
        return;
    }

    if (!isExternalLink && !productDoc) { // Caso não tenha link externo, PDF é obrigatório
        messageElement.textContent = 'Por favor, selecione um arquivo PDF.';
        document.getElementById("productForm").style.opacity = '100%';
        return;
    }

    try {
        // 7. Atualizar a quantidade no Realtime Database
        const userRef = dbRef(realtimeDb, `users/${user.uid}`);
        const snapshot = await get(userRef);

        let newQuantity = 0; // Inicializa a variável fora do bloco

        if (snapshot.exists()) {
            const userData = snapshot.val();
            const currentQuantity = userData.quantity || 0;
            newQuantity = currentQuantity + 1;

            // Verificar se a quantidade é maior ou igual a 15
            if (newQuantity > 15) {
                messageElement.textContent = "Você atingiu o limite de 15 produtos!";
                //document.getElementById("addingProduct").style.display = "none";
                messageElement.textContent = 'Você atingiu o limite de 15 produtos!';
                const position = output_position.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: position, behavior: 'smooth' }); // Rolagem suave até a posição do elemento
                addProduct.textContent = "Adicionar Produto";
                document.getElementById("productForm").style.opacity = '100%';
                return; // Impedir que o produto seja adicionado
            }

            await update(userRef, { quantity: newQuantity });
        } else {
            newQuantity = 1;
            await set(userRef, { quantity: newQuantity });
        }

        // 1. Fazer o upload da imagem no Firebase Storage
        const imageStorageReference = storageRef(storage, `products/images/${productImage.name}`);
        await uploadBytes(imageStorageReference, productImage);

        // 2. Obter a URL da imagem
        const imageUrl = await getDownloadURL(imageStorageReference);

        let docUrl = '';
        let bannerUrl = '';

        // Se o usuário escolheu o link externo, usar o link inserido
        if (isExternalLink) {
            docUrl = productLink;
        } else {
            // 3. Fazer o upload do PDF no Firebase Storage
            const docStorageReference = storageRef(storage, `products/docs/${productDoc.name}`);
            await uploadBytes(docStorageReference, productDoc);

            // 4. Obter a URL do PDF
            docUrl = await getDownloadURL(docStorageReference);
        }

        // 5. Fazer o upload do banner (se fornecido)
        if (productBanner) {
            const bannerStorageReference = storageRef(storage, `products/banners/${productBanner.name}`);
            await uploadBytes(bannerStorageReference, productBanner);
            bannerUrl = await getDownloadURL(bannerStorageReference);
        }

        // 6. Criar o documento no Firestore
        const productId = Date.now().toString(); // ID do produto
        await setDoc(doc(db, "products", productId), {
            productId: productId, // Adicionar ID do produto
            userId: user.uid,
            name: productName,
            price: productPrice,
            description: productDescription,
            imageUrl: imageUrl,
            docUrl: docUrl,
            bannerUrl: bannerUrl || null, // Armazenar bannerUrl se disponível
            createdAt: new Date().toISOString()
        });
      
        
        const position = output_position.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: position, behavior: 'smooth' }); // Rolagem suave até a posição do elemento
        messageElement.innerHTML = 'Produto adicionado com sucesso!  <strong style="cursor: pointer;" onclick="backPage()" >Voltar <i class="fa fa-arrow-left" aria-hidden="true"></i></strong> ';
        addProduct.textContent = "Adicionar Produto"; 
        document.getElementById("productForm").style.opacity = '100%';
        // Limpar formulário
        form.reset();
        previewProductImage.style.display = 'none'; // Esconder a pré-visualização da imagem após limpar o formulário
        previewProductBanner.style.display = 'none'; // Esconder a pré-visualização do banner
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        messageElement.textContent = 'Erro ao adicionar produto.';
        addProduct.textContent = "Adicionar Produto";
        document.getElementById("productForm").style.opacity = '100%';
    }
});







       









         
         // Função para obter os dados do usuário logado
         onAuthStateChanged(auth, (user) => {
            if (user) {
                
            } else {
                // Se não estiver logado, redirecionar para a página de login
                window.location.href = 'https://www.dropaymentsmz.online/entrar';
            }
        });

  


       











    // Função para pré-visualizar a imagem
/*const upsellImageInput = document.getElementById('upsellImage');
const previewUpsellImage = document.getElementById('previewUpsellImage');

upsellImageInput.addEventListener('change', function(event) {
    const upsellImage = upsellImageInput.files[0];
    if (upsellImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewUpsellImage.src = e.target.result;
            previewUpsellImage.style.display = 'block';
        }
        reader.readAsDataURL(upsellImage); // Lê o conteúdo da imagem para pré-visualização
    } else {
        previewUpsellImage.src = "#";
        previewUpsellImage.style.display = 'none';
    }
});

// Controle da visibilidade dos campos de link e arquivo PDF
document.getElementById('upsellType').addEventListener('change', function() {
    const linkDiv = document.getElementById('upsellLinkDiv');
    const fileDiv = document.getElementById('upsellDocDiv');
    const fileInput = document.getElementById('upsellDoc');

    if (this.checked) {
        linkDiv.style.display = 'block'; // Mostrar campo de link externo
        fileDiv.style.display = 'none';  // Ocultar campo de arquivo PDF
        fileInput.required = false;      // Tornar o arquivo PDF não obrigatório
    } else {
        linkDiv.style.display = 'none';  // Ocultar campo de link externo
        fileDiv.style.display = 'block'; // Mostrar campo de arquivo PDF
        fileInput.required = true;       // Tornar o arquivo PDF obrigatório novamente
    }
});

// Configurar o formulário de upsell
const formUpsell = document.getElementById('productFormUpsell');
formUpsell.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar o reload da página

    const addProductUpsell = document.getElementById('addProductUpsell');
    addProductUpsell.textContent = "Adicionando upsell...";

    // Pegar os valores dos campos
    const upsellName = document.getElementById('upsellName').value;
    const upsellPrice = document.getElementById('upsellPrice').value;
    const upsellDescription = document.getElementById('upsellDescription').value;
    const upsellImage = document.getElementById('upsellImage').files[0]; // Imagem do upsell
    const upsellDoc = document.getElementById('upsellDoc').files[0]; // Arquivo PDF do upsell
    const upsellLink = document.getElementById('upsellLink').value; // Link externo do upsell
    const isExternalLink = document.getElementById('upsellType').checked; // Verifica se o usuário escolheu link externo

    const messageUpsellElement = document.getElementById('messageUpsell');

    // Validar imagem
    if (!upsellImage) {
        messageUpsellElement.textContent = 'Por favor, selecione uma imagem.';
        return;
    }

    if (!isExternalLink && !upsellDoc) { // Caso não tenha link externo, PDF é obrigatório
        messageUpsellElement.textContent = 'Por favor, selecione um arquivo PDF.';
        return;
    }

    try {
        // 6. Atualizar a quantidade no Realtime Database
        const userRef = dbRef(realtimeDb, `users/${user.uid}`);
        const snapshot = await get(userRef);

        let newQuantity = 0; // Inicializa a variável fora do bloco

        if (snapshot.exists()) {
            const userData = snapshot.val();
            const currentQuantity = userData.quantity || 0;
            newQuantity = currentQuantity + 1;

            // Verificar se a quantidade é maior ou igual a 15
            if (newQuantity >= 15) {
                messageUpsellElement.textContent = 'Você atingiu o limite de 15 produtos!';
                messageUpsellElement.style.color = 'red'; // Mudar a cor do texto para vermelho
                return; // Impedir que o produto seja adicionado
            }

            await update(userRef, { quantity: newQuantity });
        } else {
            newQuantity = 1;
            await set(userRef, { quantity: newQuantity });
        }

        // 1. Fazer o upload da imagem no Firebase Storage
        const imageStorageReference = storageRef(storage, `upsells/images/${upsellImage.name}`);
        await uploadBytes(imageStorageReference, upsellImage);

        // 2. Obter a URL da imagem
        const imageUrl = await getDownloadURL(imageStorageReference);

        let docUrl = '';

        // Se o usuário escolheu o link externo, usar o link inserido
        if (isExternalLink) {
            docUrl = upsellLink;
        } else {
            // 3. Fazer o upload do PDF no Firebase Storage
            const docStorageReference = storageRef(storage, `upsells/docs/${upsellDoc.name}`);
            await uploadBytes(docStorageReference, upsellDoc);

            // 4. Obter a URL do PDF
            docUrl = await getDownloadURL(docStorageReference);
        }

        // 5. Criar o documento no Firestore
        const upsellId = Date.now().toString(); // ID do upsell
        await setDoc(doc(db, "upsells", upsellId), {
            upsellId: upsellId, // Adicionar ID do upsell
            userId: user.uid,
            name: upsellName,
            price: upsellPrice,
            description: upsellDescription,
            imageUrl: imageUrl,
            docUrl: docUrl,
            createdAt: new Date().toISOString()
        });

        // Exibir mensagem de sucesso
        messageUpsellElement.textContent = 'Upsell adicionado com sucesso!';
        messageUpsellElement.style.color = ''; // Resetar a cor do texto

        addProductUpsell.textContent = "Adicionar Upsell";

        // Limpar formulário
        formUpsell.reset();
        previewUpsellImage.style.display = 'none'; // Esconder a pré-visualização da imagem após limpar o formulário
    } catch (error) {
        console.error('Erro ao adicionar upsell:', error);
        messageUpsellElement.textContent = 'Erro ao adicionar upsell.';
        addProductUpsell.textContent = "Adicionar Upsell";
    }
}); */


         






        
// Função para pré-visualizar a imagem
/* const downsellImageInput = document.getElementById('downsellImage');
const previewDownsellImage = document.getElementById('previewDownsellImage');

downsellImageInput.addEventListener('change', function(event) {
    const downsellImage = downsellImageInput.files[0];
    if (downsellImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewDownsellImage.src = e.target.result;
            previewDownsellImage.style.display = 'block';
        }
        reader.readAsDataURL(downsellImage); // Lê o conteúdo da imagem para pré-visualização
    } else {
        previewDownsellImage.src = "#";
        previewDownsellImage.style.display = 'none';
    }
});

// Controle da visibilidade dos campos de link e arquivo PDF
document.getElementById('downsellType').addEventListener('change', function() {
    const linkDiv = document.getElementById('downsellLinkDiv');
    const fileDiv = document.getElementById('downsellDocDiv');
    const fileInput = document.getElementById('downsellDoc');

    if (this.checked) {
        linkDiv.style.display = 'block'; // Mostrar campo de link externo
        fileDiv.style.display = 'none';  // Ocultar campo de arquivo PDF
        fileInput.required = false;      // Tornar o arquivo PDF não obrigatório
    } else {
        linkDiv.style.display = 'none';  // Ocultar campo de link externo
        fileDiv.style.display = 'block'; // Mostrar campo de arquivo PDF
        fileInput.required = true;       // Tornar o arquivo PDF obrigatório novamente
    }
});



// Configurar o formulário de downsell
const formDownsell = document.getElementById('productFormDownsell');
formDownsell.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar o reload da página

    const addProductDownsell = document.getElementById('addProductDownsell');
    addProductDownsell.textContent = "Adicionando downsell...";

    // Pegar os valores dos campos
    const downsellName = document.getElementById('downsellName').value;
    const downsellPrice = document.getElementById('downsellPrice').value;
    const downsellDescription = document.getElementById('downsellDescription').value;
    const downsellImage = document.getElementById('downsellImage').files[0]; // Imagem do downsell
    const downsellDoc = document.getElementById('downsellDoc').files[0]; // Arquivo PDF do downsell
    const downsellLink = document.getElementById('downsellLink').value; // Link externo do downsell
    const isExternalLink = document.getElementById('downsellType').checked; // Verifica se o usuário escolheu link externo

    const messageDownsellElement = document.getElementById('messageDownsell');

    // Validar imagem
    if (!downsellImage) {
        messageDownsellElement.textContent = 'Por favor, selecione uma imagem.';
        return; // Retorna para impedir continuar se a imagem não for selecionada
    }

    if (!isExternalLink && !downsellDoc) { // Caso não tenha link externo, PDF é obrigatório
        messageDownsellElement.textContent = 'Por favor, selecione um arquivo PDF.';
        return; // Retorna para impedir continuar se o PDF não for selecionado
    }

    try {
        // Verificar a quantidade atual de produtos no Realtime Database
        const userRef = dbRef(realtimeDb, `users/${user.uid}`);
        const snapshot = await get(userRef);
        let currentQuantity = 0; // Inicializa a variável

        if (snapshot.exists()) {
            const userData = snapshot.val();
            currentQuantity = userData.quantity || 0; // Obtém a quantidade atual
        }

        // Verificar se a quantidade atual é maior ou igual a 15
        if (currentQuantity >= 15) {
            messageDownsellElement.textContent = 'Você atingiu o limite de 15 produtos!';
            messageDownsellElement.style.color = 'red'; // Resetar a cor do texto
            return; // Retorna para impedir a criação de um novo downsell
        }

        // 1. Fazer o upload da imagem no Firebase Storage
        const imageStorageReference = storageRef(storage, `downsell/images/${downsellImage.name}`);
        await uploadBytes(imageStorageReference, downsellImage);

        // 2. Obter a URL da imagem
        const imageUrl = await getDownloadURL(imageStorageReference);

        let docUrl = '';

        // Se o usuário escolheu o link externo, usar o link inserido
        if (isExternalLink) {
            docUrl = downsellLink;
        } else {
            // 3. Fazer o upload do PDF no Firebase Storage
            const docStorageReference = storageRef(storage, `downsell/docs/${downsellDoc.name}`);
            await uploadBytes(docStorageReference, downsellDoc);

            // 4. Obter a URL do PDF
            docUrl = await getDownloadURL(docStorageReference);
        }

        // 5. Criar o documento no Firestore
        const downsellId = Date.now().toString(); // ID do downsell
        await setDoc(doc(db, "downsell", downsellId), {
            downsellId: downsellId, // Adicionar ID do downsell
            userId: user.uid,
            name: downsellName,
            price: downsellPrice,
            description: downsellDescription,
            imageUrl: imageUrl,
            docUrl: docUrl,
            createdAt: new Date().toISOString()
        });

        // Atualizar a quantidade no Realtime Database
        const newQuantity = currentQuantity + 1; // Incrementar a quantidade

        await update(userRef, { quantity: newQuantity }); // Atualizar a quantidade no banco de dados

        // Exibir mensagem de sucesso
        messageDownsellElement.textContent = 'Downsell adicionado com sucesso!';
        addProductDownsell.textContent = "Adicionar Downsell";

        // Limpar formulário
        formDownsell.reset();
        previewDownsellImage.style.display = 'none'; // Esconder a pré-visualização da imagem após limpar o formulário
    } catch (error) {
        console.error('Erro ao adicionar downsell:', error);
        messageDownsellElement.textContent = 'Erro ao adicionar downsell.';
        addProductDownsell.textContent = "Adicionar Downsell";
    }
}); */

    } else {
        // Redirecionar para a página de login se o usuário não estiver autenticado
        window.location.href = 'entrar.html';
    }
});
