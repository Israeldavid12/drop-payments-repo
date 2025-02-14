import { productId } from "./get-product-data.js";

export async function getUserIdByProductID() {
    const product_id = productId();
    const productData = await axios.post('https://www.dropaymentsmz.online/api/balance', {
        productId: product_id,
        reqType: 'product_data',
    });
    console.log(productData)
    return productData.data.product;

}