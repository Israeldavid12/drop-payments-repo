import userData from "../user/user_data.mjs";


export const userMenu = () => {
    const data = userData();
    const container = document.createElement('div');

    const pic_letter = data.name;
    const first_letter = pic_letter.charAt(0).toUpperCase();

    const template = `<div  class="user_info_menu" >
            <h2>${first_letter}</h2>
            <p>${data.name}</p>
            <p>${data.email}</p>
           <hr>
           <div class="user_menu_items" >
          <a href="#profile"><i class="bi bi-person-bounding-box"></i> Meus dados</a>
          <a href="#help"><i class="bi bi-question-circle"></i> Auda</a>
          <a href="#logout"><i class="bi bi-box-arrow-right"></i> Sair</a>
           </div>

           </div>`;
    container.innerHTML = template;
    return template;

}
