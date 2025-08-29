

export const userMenu =  async () => {
   try {
    const container = document.createElement('div');

    const pic_letter =sessionStorage.getItem('name');
    const email = sessionStorage.getItem('email');
    const name = sessionStorage.getItem('name');
    console.log(pic_letter);
    const first_letter = pic_letter.charAt(0).toUpperCase();

    const template = `<div  class="user_info_menu" >
            <div class='user_name_h2'>  <h2>${first_letter}</h2></div>
            <p>${name}</p>
            <p>${email}</p>
            <p class='change-theme' ><i class="bi bi-sun"></i> Modo claro</p>
           <hr>
           <div class="user_menu_items" >
          <a href="#profile/user/data"><i class="bi bi-person-bounding-box"></i> Dados do vendedor</a>
          <a href="#help"><i class="bi bi-question-circle"></i> Auda</a>
          <a href="#/feedback"><i class="bi bi-send"></i> Dar feedback ou sugestao</a>
          <a href="#logout"><i class="bi bi-box-arrow-right"></i> Sair</a>
           </div>

           </div>`;
    container.innerHTML = template;
    return template;
    
   } catch (error) {
    console.error(error);
   }

}
