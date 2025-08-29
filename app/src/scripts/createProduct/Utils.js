import { setAnOutPut, addLoadAnim } from "../../animations/index.js";
import { UserData } from "../../user/v2/userData.js";




export class Utils {
    static async generatePresignedUrl(file_id, dir_file) {
        const file = document.getElementById(file_id);
        if (!file || file.files.length === 0) {
            console.error("Nenhum arquivo selecionado!");
            return;
        }

        const file_name = file.files[0].name;
        const file_type = file.files[0].type;


        const response = await axios.post('https://www.dropaymentsmz.online/api/create-product', {
            reqType: 'presigned_url',
            userId: await UserData.getUserId(),
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

    static verificarPreco(id) {
        const input = document.getElementById(id);
        const maximo = 40000;

        if (parseInt(input.value) > maximo) {
            input.value = 0;
        }
    }

    static async uploadFile(file_id, presignedUrl, file_path) {
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

    static async productAcess(method) {
        if (method === 'link') {
            const product_acess = document.getElementById('productLink').value
            console.log("Acesso do produto: ", product_acess)
            return product_acess

        } else if (method === 'doc') {
            // PRESIGNED DOCUMENT URL
            const doc_data = await Utils.generatePresignedUrl('productDoc', 'docs');

            const doc_url_signed = doc_data.presignedUrl;
            const doc_path = doc_data.filePath;
            const product_acess = await Utils.uploadFile('productDoc', doc_url_signed, doc_path);
            console.log("Acesso do produto: ", product_acess)
            return product_acess

        } else if (method === 'PAYMENT-ONLY') {
            console.log("Acesso do produto: ", 'PAYMENT-ONLY')
            return 'PAYMENT-ONLY'

        } else {
            const product_acess = document.getElementById('productLink').value
            console.log("Acesso do produto: ", product_acess)
            return product_acess
        }

    }



}