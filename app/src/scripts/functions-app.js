const sidebar = document.getElementById('sidebar');
sidebar.classList.add('open-sidebar');
const open_menu = document.getElementById('open_menu');
const mediaQuery = window.matchMedia('(max-width: 600px)');
const main = document.querySelector("main");

document.getElementById('close_side_menu').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open-sidebar');
   // document.getElementById('close_side_menu_mobile').style.display = 'none';
    
});


function handleScreenChange(e) {
    if (e.matches) {
      sidebar.classList.add('hide_menu');
    } else {
     
    }
  }

  // Adiciona um listener para mudanças na largura da tela
mediaQuery.addEventListener('change', handleScreenChange);

// Executa a função imediatamente ao carregar a página
handleScreenChange(mediaQuery);





open_menu.addEventListener('click', () => {
    sidebar.style.display = 'flex';
    document.getElementById('close_side_menu').style.display = 'none';
    document.getElementById('blur').classList.add('blur-container');
});

document.getElementById('close_side_menu_mobile').addEventListener('click', () => {
  sidebar.style.display = 'none';
  document.getElementById('blur').classList.remove('blur-container');
})

