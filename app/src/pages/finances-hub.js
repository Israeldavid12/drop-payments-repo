import {userData} from "../user/user_data.mjs";


export const formatBalance = (balance) => {
    const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "MZN",
      });
    const f_balance = formatter.format(balance || 0);
    console.log('work');
    return f_balance;
}


export default function financeHub() {
    const container = document.createElement('div');
    const user = userData();
    const balance = formatBalance(user.balance);
    const paypalBalance = formatBalance(user.paypalBalance);
    const username  = 'Olá, '+ user.name;
    const vendasHoje = formatBalance(user.vendasHoje);

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

   const template =  `<div class="finances-hub">
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

}

