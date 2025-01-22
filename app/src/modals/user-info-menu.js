import {userData} from "../user/user_data.mjs";


export const userMenu =  async () => {
   try {
   // const data = await userData();
    const container = document.createElement('div');

    const pic_letter = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    console.log(pic_letter);
    const first_letter = pic_letter.charAt(0).toUpperCase();

    const template = `<div  class="user_info_menu" >
            <div class='user_name_h2'>  <h2>${first_letter}</h2></div>
            <p>${name}</p>
            <p>${email}</p>
           <hr>
           <div class="user_menu_items" >
          <a href="#profile/user/data"><i class="bi bi-person-bounding-box"></i> Meus dados</a>
          <a href="#help"><i class="bi bi-question-circle"></i> Auda</a>
          <a href="#logout"><i class="bi bi-box-arrow-right"></i> Sair</a>
           </div>

           </div>`;
    container.innerHTML = template;
    return template;
    
   } catch (error) {
    console.error(error);
   }

}
