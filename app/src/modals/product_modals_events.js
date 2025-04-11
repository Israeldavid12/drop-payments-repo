import { addLoadAnim, setAnOutPut, showAnPopup } from "../animations/index.js";
import { getUserId } from "../user/user_data.mjs";







 async function generatePresignedUrl(file_id, dir_file) {
    const file = document.getElementById(file_id);
    const file_name = file.files[0].name;
    const file_type = file.files[0].type;


    const response = await axios.post('https://www.dropaymentsmz.online/api/create-product', {
        reqType: 'presigned_url',
        userId: await getUserId(),
        dir_file: dir_file,
        fileName: file_name,
        contentType: file_type
    })

    console.log(response)

    return {
        presignedUrl: response.data.presignedUrl,
        filePath: response.data.filePath
    };
}



async function uploadFile(file_id, presignedUrl, file_path) {
    const file = document.getElementById(file_id).files[0];

    if (!file) {
        console.error("Nenhum arquivo selecionado!");
        return;
    }

    console.log("Presigned URL:", presignedUrl);

    const response = await axios.put(presignedUrl, file, {
        headers: {
            "Content-Type": file.type, // Importante para arquivos com tipo correto
        }
    });

    console.log(response)

    if (response.status === 200) {
        console.log("Upload concluído com sucesso!");
        const fileUrl = `https://megaofertasco.store/${file_path}`;
        console.log("Acesse o arquivo em:", fileUrl);
        return fileUrl;
    } else {
        console.error("Erro ao enviar arquivo:", response.statusText);
        return response.statusText;
    }
}



//PRODUCT EDIT AND DELETE - FUNCTIONS
document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.cancel-delete')) {
        showAnPopup('', false)
    }

});


document.body.addEventListener('click', async function (event) {
    if (event.target && event.target.matches('.confirm-delete')) {
        try {
            addLoadAnim('confirm-delete', 'Sim', true)
            const productId = document.querySelector('.product-id').textContent
            const response = await axios.post('https://www.dropaymentsmz.online/api/v2/live/server', {
                productId: productId,
                reqType: 'delete_product',
                userId: await getUserId(),
            });

            console.log(response)
            addLoadAnim('confirm-delete', 'Sim', true)
            showAnPopup('', false)
            if (response.data.message) {
                setAnOutPut(response.data.message, 'S-M')
                setTimeout(() => {
                    location.reload()
                }, 2500)
            } else {
                setAnOutPut(response, "S-M");
            }

        } catch (error) {
            showAnPopup('', false);
            console.log(error);
            console.log(error);
            if (error.data) {
                setAnOutPut(error.data.message, 'E-M');
            } else if (error.response) {
                setAnOutPut(error.response.data.message, 'E-M')
            } else {
                setAnOutPut(error, 'E-M');
            }
        }
    }

});

document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.cancel-edit')) {
        showAnPopup('', false)
    }
});


document.body.addEventListener('click', async function (event) {
    if (event.target && event.target.matches('.save-edit')) {
        try {

            addLoadAnim('save-edit', "Salvar", true);
            const name = document.querySelector('.p-name').value;
            const price = document.querySelector('.price').value;
            const new_productImage = document.querySelector('.new-image').files[0];
            const productId = document.querySelector('.product-id').textContent;
            const old_image_url = document.querySelector('.image-url').src;
            
            const image_data = await generatePresignedUrl("new-image", 'images');
            const signed_url =image_data.presignedUrl;
            const upload_path = image_data.filePath;
            const new_image_url = await uploadFile("new-image", signed_url, upload_path);


            const response = await axios.post('https://www.dropaymentsmz.online/api/edit-product', {
                product_name: name, 
                product_price: price, 
                old_image_url: old_image_url , 
                new_image_url: new_image_url, 
                product_id: productId
            });
            
            console.log(response);
            addLoadAnim('save-edit', "Salvar", false);

            showAnPopup('', false)
            if (response.data.message) {
                setAnOutPut(response.data.message, 'S-M')
            } else {
                setAnOutPut(response, "S-M");
            }



        } catch (error) {
            showAnPopup('', false);
            console.log(error.message);
            
            if (error.data) {
                setAnOutPut(error.data.message, 'E-M');
            } else if (error.response) {
                setAnOutPut(error.response.data.message, 'E-M')
            } else if (error.message === `Cannot read properties of undefined (reading 'name')`)  {
                setAnOutPut('Por favor selecione uma imagem para fazer a alteracao!', 'E-M');
            }
            else {
                setAnOutPut(error, 'E-M');
            }

        }
    }
});




document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.bi-x-lg')) {
        showAnPopup('', false)
    }

});


document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.bi-copy')) {
        try {
            const text = document.querySelector('.product-link-page')
            navigator.clipboard.writeText(text.value);
            setAnOutPut('Link copiado para a área de transferência.', "S-M")
            showAnPopup(false, false)

        } catch (error) {
            console.log(error)
            setAnOutPut(error, "E-M")
        }
        
    }

});


document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.bi-box-arrow-up-right')) {
        const link = document.querySelector('.product-link-page').value
        window.open(link, "_blank")
    }

});
