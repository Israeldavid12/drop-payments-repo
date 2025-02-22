document.querySelector('.help-btn').addEventListener('click', () => {
    window.open('https://api.whatsapp.com/send?phone=258863814050&text=Preciso%20de%20ajuda...', '_blank');

});


function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleButton = document.querySelector(".toggle-btn");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleButton.classList.remove("bi-eye");
        toggleButton.classList.add("bi-eye-slash");
    } else {
        passwordInput.type = "password";
        toggleButton.classList.remove("bi-eye-slash");
        toggleButton.classList.add("bi-eye");
    }
}



