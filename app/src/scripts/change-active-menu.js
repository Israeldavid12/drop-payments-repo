
function setActive(element) {
    const theme = localStorage.getItem('theme');

    if (theme === 'dark') {
        console.log('dark', theme)
        document.querySelectorAll('.side-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    } else {
        console.log('light', theme)
        document.querySelectorAll('.side-item').forEach(item => item.classList.remove('active'));
        element.classList.add('light-item-seleted');
    }


    // Salva no localStorage
    localStorage.setItem('activeMenu', element.innerText);
}

// Quando a página carregar, define o item ativo salvo
document.addEventListener('DOMContentLoaded', () => {
    const savedMenu = localStorage.getItem('activeMenu');
    if (savedMenu) {
        document.querySelectorAll('.side-item').forEach(item => {
            if (item.innerText === savedMenu) {
                item.classList.add('active');
            }
        });
    }
});