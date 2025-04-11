export async function NotificationsModal() {
    const modal = document.createElement('div');
    
    const template = ` <div class="notifications-modal" >
              <p class="text-[18px] self-start ml-5" >Notificações</p>
              <div class="hr" ></div>
              <p>Sem notificações.</p>


            </div>`;

   
    modal.innerHTML = template;
    return template;
   
}