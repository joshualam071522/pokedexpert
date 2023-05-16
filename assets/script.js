const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const fetchPokemon = (searchTerm) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            const pokemon = {
                name: data.name,
                image: data.sprites['front_default'],
                type: data.types.map((type) => type.type.name).join(', '),
                id: data.id
            };
            displayPokemon(pokemon);
        })
        .catch((error) => {
            console.log('Error:', error);
            displayPokemon(null);
        });
};

const displayPokemon = (pokemon) => {
    if (pokemon === null) {
        pokedex.innerHTML = 'Pokemon not found.';
        return;
    }

    const pokemonHTMLString = `
        ${pokemon.id}. ${pokemon.name}
        <p>Type: ${pokemon.type}</p>
    `;
    pokedex.innerHTML = pokemonHTMLString;
};

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    searchInput.value = ''; // Clear the search input field
    fetchPokemon(searchTerm);
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.toLowerCase();
        searchInput.value = ''; // Clear the search input field
        fetchPokemon(searchTerm);
    }
});

const fetchRandomPokemon = () => {
    const randomPokemonId = Math.floor(Math.random() * 150) + 1;
    searchInput.value = ''; // Clear the search input field
    fetchPokemon(randomPokemonId);
};

// Clear the pokedex initially
pokedex.innerHTML = '';

fetchRandomPokemon();