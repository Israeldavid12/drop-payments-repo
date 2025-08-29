export class Pages {
    static async getStaticPage(page) {
        const container = document.createElement('div');
        try {
            const res = await axios.get(page);
        
            container.innerHTML = res.data;
            return container;
        } catch (error) {
            console.log(error);
            return '<h1>404 - Página não encontrada</h1>';
        }
    }

  //Pages
    static async editPayoutsMethds() {
        const page = await Pages.getStaticPage('src/static-pages/edit/payout_methods.html');
        
        return page;
    }

    static async productHub() {
        const page = await Pages.getStaticPage('src/static-pages/product-hub.html');
        
        return page;
    }

    static async createProduct() {
        const page = await Pages.getStaticPage('src/static-pages/create-product.html');
        return page;
    }

    static async profilePage() {
        const page = await Pages.getStaticPage('src/static-pages/profile-hub.html');
        
        return page;
    }

    static async settingsPage() {
        const page = await Pages.getStaticPage('src/static-pages/checkout-settings-hub.html');
        return page;
    }

}

