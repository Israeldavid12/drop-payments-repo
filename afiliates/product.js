// URL da API REST Countries
const apiUrl = "https://restcountries.com/v3.1/all";

// Elemento do dropdown
const countryDropdown = document.getElementById("countryDropdown");

// Função para carregar países
async function loadCountries() {
  try {
    const response = await fetch(apiUrl); // Faz a requisição à API
    const countries = await response.json(); // Converte a resposta para JSON

    // Ordena os países pelo nome
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    // Popula o dropdown
    countryDropdown.innerHTML = ""; // Limpa o conteúdo inicial
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country.cca2; // Código do país (ISO 3166-1 alfa-2)
      option.textContent = country.name.common; // Nome do país
      countryDropdown.appendChild(option);
      console.log('sucess');
    });
  } catch (error) {
    console.error("Erro ao carregar os países:", error);
    countryDropdown.innerHTML = "<option value=''>Erro ao carregar</option>";
  }
}

// Chama a função ao carregar a página
setTimeout(() => {
    loadCountries();
}, 3000);
