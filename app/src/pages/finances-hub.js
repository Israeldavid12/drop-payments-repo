import { getUserId } from "../user/user_data.mjs";


export const formatBalance = (balance) => {
    const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "MZN",
    });
    const f_balance = formatter.format(balance || 0);
    
    return f_balance;
}

async function userData() {
    try {
        const userId = await getUserId();
        const userDataResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            userId: userId,
            reqType: 'user_data',
        });

        const data = userDataResponse.data.data;
        console.log(userDataResponse.data.data.email);
        return {
            name: data.user_name,
            email: data.user_email,
            balance: data.balance,
            paypalBalance: data.paypalBalance
        };

    } catch (error) {
        console.log(error);
    }
}



export async function financeHub() {

    try {
        const userId = await getUserId();
        const userDataResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            userId: userId,
            reqType: 'user_data',
        });

        const data = userDataResponse.data;
        console.log(data.user_name);

        const container = document.createElement('div');
        // const userdata = await userData();
        // console.log(userdata.name);
        const balance = formatBalance(data.balance);
        const paypalBalance = formatBalance(data.paypalBalance);
        const username = 'Olá, ' + data.user_name;
        const vendasHoje = formatBalance(data.vendasHoje);

        fetch(`/app/src/static-pages/finance-hub.html`)
            .then((response) => {
                if (!response.ok) throw new Error('Página não encontrada');
                return response.text();
            })
            .then((html) => {

                // container.textContent = html;
            })
            .catch(() => {
                return '<h1>404 - Página não encontrada</h1>';
            });

        const template = `
         <div class="finances-hub">
    <p class="user_name">${username}</p>
    <div class="main-box">
        <div class="box">
            <div class="box-items" >
                <div>
                    <i class="bi bi-wallet2"></i>
                </div>
                 <div>
                     <p class="balance_label">Saldo disponivel </p>
                     <p class="balance">${balance}</p>
                     <a href='#withdraw' class="s_saque" ><i class="bi bi-credit-card-2-back"></i> Solicitar saque</a>
                    
                 </div>
                 <div>
                     <p class="balance_label">Saldo disponivel </p>
                     <p class="balance">${balance}</p>
                     <a href='#withdraw' class="s_saque" ><i class="bi bi-credit-card-2-back"></i> Solicitar saque</a>
                    
                 </div>
                 
                 
             </div>
        </div>
        <div class="box">
            <div class="box-items" >
               <div>
                <i class="bi bi-wallet2"></i>
               </div>
                <div>
                    <p class="balance_label">Saldo disponivel </p>
                    <p class="balance">${paypalBalance}</p>
                    <a href='#' class="s_saque" ><i class="bi bi-credit-card-2-back"></i> Solicitar saque</a>
                </div>
            </div>


        </div>
        <div class="box">
            <div class="box-items" >
                <div>
                 <i class="bi bi-coin"></i>
                </div>
                 <div>
                     <p class="balance_label">Vendas realizadas hoje </p>
                     <p class="balance">${vendasHoje}</p>
                 </div>
             </div>
        </div>
        <div class="box">
            <div class="box-items" >
                <div>
                 <i class="bi bi-coin"></i>
                </div>
                 <div>
                     <p class="balance_label">Vendas  </p>
                     <p class="balance">0</p>
                 </div>
             </div>
        </div>
        <p>&copy;DROP PAYMENTS TEAM 2.0</p>
    </div>
    <canvas id="salesChart"></canvas>
   
</div>`;
        container.innerHTML = template;
        return container;

    } catch (error) {
        console.log(error);
    }

}

