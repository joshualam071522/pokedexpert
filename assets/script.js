var pokemonTriviaEl = document.getElementById('pokemonTrivia');
var pokemonTriviaDiv = document.getElementById('triviaBox');
var statDiv = document.getElementById('statdiv');
// Get the user input from the search field
var searchInput = document.getElementById("searchField");
var searchButton = document.getElementById("search");
var pokeimglistEl = document.getElementById('pokeimglist')
var storedPokemon = JSON.parse(localStorage.getItem('pokemon')) || [];
let recentSearchesListDiv = document.getElementById('recentSearchesList');
var pokedex = document.getElementById('pokemonStats');

//* code to display recent search
function displayRecentSearch () {
  recentSearchesListDiv.innerHTML = '';
  //* for loop that creates a button element with name of pokemon in the array and appends to recent searches div
  for (let i = 0; i < storedPokemon.length; i++) {
    const nameOfPokemon = String(storedPokemon[i]);
    let recentSearchesBtn = document.createElement('button');
    recentSearchesBtn.classList.add('button', 'is-rounded', 'is-small', 'is-danger', 'is-light');
    recentSearchesBtn.textContent = nameOfPokemon.charAt(0).toUpperCase() + nameOfPokemon.slice(1);
    recentSearchesListDiv.append(recentSearchesBtn);
  }
}

//* calls display recent searches so it loads up with the page
displayRecentSearch();

//* example link for action=parse: https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=parse&format=json&page=Bulbasaur_(Pok%C3%A9mon)
//* example link for query: https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=query&format=json&prop=extracts&pageids=1161

//* function to fetch pageid for specific pokemon
function getPokemonPageId (searchInput) {
  //*Displays error message if cannot find searched pokemon (e.g. spelling error)
  function showErrorModal() {
    var modal = document.getElementById("errorModal");
    var modalContent = document.getElementById("errorModalContent");
    modalContent.textContent = "Invalid Pokemon name. Please try again.";
    modal.style.display = "block";
    setTimeout(function() {
      modal.style.display = "none";
    }, 2000);
  }

  fetch('https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=parse&format=json&page='+searchInput+'_(Pok%C3%A9mon)'
  )
  .then(function(response) {
    return response.json();
  })

  .then(function (data) {
    //* catch error to stop if can't find pageid using fetch
    try {
    var pageid = data.parse.pageid;
    searchPokemonArticle(pageid, searchInput);
    }
    catch(error) {
    //TODO add a modal for if we cannot search the pokemone name (ex: spelling error?)
    console.log('dangit!')
    showErrorModal();
    return;
    }
  })
}

//* fetching text from pokemon wiki using pageid
function searchPokemonArticle (pageid, searchInput) {

localStorage.setItem('currentpageid', JSON.stringify(pageid));

fetch('https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=query&format=json&prop=extracts&pageids='+pageid+'', {
  method: 'GET', //GET is the default.
  credentials: 'same-origin', // include, *same-origin, omit
  redirect: 'follow', // manual, *follow, error
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {

    //* getting to root of info needed to extract
    var page = data.query.pages;
  
    var dataExtract = (page[pageid].extract);

    //* Find index number for the word trivia in the text
    var dataTrivia = dataExtract.indexOf("Trivia");

    //* find index number of origin section, which is after trivia section, to slice
    //TODO USE "\" TO TARGET QUOTATION MARKS WITHIN TEXT TO SLICE BETTER
    var dataOrigin = dataExtract.indexOf(">Origin<");

    //* slice to only get the trivia section of the extracted text
    var dataExtractSliced = dataExtract.slice(dataTrivia, dataOrigin);

    //* USE "\" CHARACTER TO TARGET QUOTATION MARKS IN STRINGS
    //* Removes all HTML and formatting elements from text
    var dataHtmlRemoved = dataExtractSliced
    .replaceAll('<h3><span id=\"Origin\"', '')
    .replaceAll('<li>','')
    .replaceAll('<ul>','')
    .replaceAll('</ul>','')
    .replaceAll('<b>','')
    .replaceAll('</b>','')
    .replaceAll('<i>','')
    .replaceAll('</i>','')
    .replaceAll('Trivia">Trivia</span></h2>','')

    //* data to split sentences into an array of substrings
    var dataSentenceSplit = dataHtmlRemoved.split("</li>");

    var pokemonTriviaEl = document.getElementById("pokemonTrivia");
    
    //* removes placeholder snorlax img and text
    var placeholderimg = document.getElementById('triviaplaceholderimg');
    var placeholderh2 = document.getElementById('triviaplaceholderh2');

    if (placeholderimg) {
      pokemonTriviaDiv.removeChild(placeholderimg);
      pokemonTriviaDiv.removeChild(placeholderh2);
    }

    //* resets the text content of trivia box so it does not show trivia from previous search
    pokemonTriviaEl.textContent = "";
    var pokemonTriviaList = document.createElement("ul");
    pokemonTriviaList.style.listStyleType = "disc";
    pokemonTriviaList.style.paddingLeft = "20px";
    
    //TODO change datasentencesplit.length to 5 to show 3 items from trivia
    //* can use dataSentenceSplit.length if want to load up all the trivia facts
    for (var i=0; i < 5; i++) {
      //*removed .trim because it was showing up errors. might need to put back in?
      var sentence = dataSentenceSplit[i]; // Access the first element of the array
      if (sentence !== "") {
        var listItem = document.createElement("li");
        listItem.textContent = sentence;
        pokemonTriviaList.appendChild(listItem);
      }
    }
    pokemonTriviaEl.appendChild(pokemonTriviaList);

    addSearchInputToRecentSearch (searchInput);
  })
}

function addSearchInputToRecentSearch (searchInput) {
  //* prevents duplicate pokemon names in local storage
  var checkPokemonNameInRecentSearchIndex = storedPokemon.indexOf(searchInput);
  if (checkPokemonNameInRecentSearchIndex !== -1) {
    storedPokemon.splice(checkPokemonNameInRecentSearchIndex, 1);
  }

  //* pushes pokemone names to the back of the array
  storedPokemon.push(searchInput);
  
  //* if array length is greater than 5, remove the first pokemone name in the array
  if (storedPokemon.length > 5) {
    storedPokemon.shift();
  }
  //* updates new array to local storage
  localStorage.setItem('pokemon', JSON.stringify(storedPokemon))
  //* calls function to show updated array on webpage
  displayRecentSearch();
}

fetchPokemonStat = function (searchInput) {
  //* fetch the Pokeapi and grab what we need
  fetch('https://pokeapi.co/api/v2/pokemon/' + searchInput, { 
    method: 'GET', //* GET is the default.
    credentials: 'same-origin', //* include, *same-origin, omit
    redirect: 'follow', //* manual, *follow, error
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      //* calls function to display pokemon's sprite img
      getPokemonSprite(data);

      //* when its fetched displays
      pokedex.innerHTML = '';

      //* stuff to be extracted.
      var pokemon = {
        type: data.types.map(function (type) { return capitalizeFirstLetter(type.type.name); }).join(', '), //* Get types
        height: convertToInches(data.height), //* Get Height and convert it into inches
        weight: convertToPounds(data.weight), //* Get  weight and convert it into pounds
        abilities: data.abilities.map(function (ability) { return capitalizeFirstLetter(ability.ability.name); }).join(', '), //* Get abilities
        //* Get stats
        stats: data.stats.map(function (stat) { 
          return {
            name: stat.stat.name,
            value: stat.base_stat
          };
        }), 
        baseExperience: data.base_experience //* starting experience
      };

      //* Display info.
      displayPokemon(pokemon);
    })
    .catch(function (error) {
      //* catch any errors and display
      console.log('Error:', error);
      displayPokemon(null);
    });
};

//* function to retrieve and display pokemon sprite img
function getPokemonSprite (data) {

  //* clears HTML of element so that sprites from previous searches do not stay
  pokeimglistEl.innerHTML = '';

  //*creates h2 element for name of pokemon and appends
  var pokeNameh2 = document.createElement('h2');
  var retrievedName = data.species.name;
  //* capitalizes the first letter of the name of pokemon for aesthetic purposes
  pokeNameh2.textContent = retrievedName.charAt(0).toUpperCase() + retrievedName.slice(1);
  pokeNameh2.classList.add('title', 'has-text-centered', 'is-4');
  pokeimglistEl.appendChild(pokeNameh2);
  
  //*creates img element for pokemon and appends
  var retrievedImg = data.sprites.front_default;
  var pokemonImg = document.createElement('img');
  pokemonImg.setAttribute('src', retrievedImg);
  pokemonImg.setAttribute('alt', data.species.name);
  pokemonImg.setAttribute('id', 'pokeimg');
  pokeimglistEl.appendChild(pokemonImg);
}

//* functions to convert stats to readable units for the displayPokemon function
var convertToPounds = function (weightInHectograms) {
  //* Converts hectograms to pounds.
  var weightInPounds = weightInHectograms * 0.220462262;
  return weightInPounds.toFixed(2); //* Round
};

//* Converts decimeters to inches.
var convertToInches = function (heightInDecimeters) {
  
  var heightInInches = heightInDecimeters * 3.93701;
  return heightInInches.toFixed(2); //* Round
};

//* capitalize everything from the string. first letter.
var capitalizeFirstLetter = function (str) {
  
  return str.charAt(0).toUpperCase() + str.slice(1);
};

//* display pokemon.
var displayPokemon = function (pokemon) {
  
  if (pokemon === null) {
    pokedex.innerHTML = 'Pokemon not found.';
    return;
  }

  //* removes placeholder snorlax img and text
  var placeholderimg = document.getElementById('statplaceholderimg');
  var placeholderh2 = document.getElementById('statplaceholderh2');

  if (placeholderimg) {
    statDiv.removeChild(placeholderimg);
    statDiv.removeChild(placeholderh2);
  }
  //* display everything with the html string.
  var pokemonHTMLString = '<p><strong>Type:</strong> ' + pokemon.type + '</p>\n'
    + '<p><strong>Height:</strong> ' + pokemon.height + ' in</p>\n'
    + '<p><strong>Weight:</strong> ' + pokemon.weight + ' lbs</p>\n'
    + '<p><strong>Abilities:</strong> ' + pokemon.abilities + '</p>\n'
    + '<h3><u>Stats</u></h3>';

  //*for the stats.
  for (var i = 0; i < pokemon.stats.length; i++) {
    var capitalizedStatName = capitalizeFirstLetter(pokemon.stats[i].name);
   
    pokemonHTMLString += '<p><strong>' + capitalizedStatName + ':</strong> ' + pokemon.stats[i].value + '</p>';
  }

  //* put base experiece under stats. 
  if (pokemon.baseExperience !== null) {
    pokemonHTMLString += '<p><strong>Base Experience:</strong> ' + pokemon.baseExperience + '</p>';
    
  }
  
  //* display.
  pokedex.innerHTML = pokemonHTMLString;
  };

  //* Add event listener to the search button
searchButton.addEventListener("click", function(event) {
  //* prevents form submission
  event.preventDefault();
  //* calls function to start searching API for wiki
  getPokemonPageId (searchInput.value.toLowerCase());
  //* calls function to start searching API from pokeAPI
  fetchPokemonStat (searchInput.value.toLowerCase());
  //* resets the search bar
  searchField.value = "";
});

//*event listener for recent searches
recentSearchesListDiv.addEventListener('click', function(event) {
//*function to uncapitalize first letter because pokeAPI requires lowercase pokemon name in search
function recentSearchUncapitalized () {
  var recentSearchInput = event.target.textContent;
  //*replaces the first letter with a lowercase version of that letter
  var recentSearchInputLowerCase = recentSearchInput.toLowerCase();
  //* passes in the lowercase pokemon name into the API so the search will work.
  getPokemonPageId(recentSearchInputLowerCase);
  fetchPokemonStat(recentSearchInputLowerCase);
}
//* calls the function on event listener
recentSearchUncapitalized();
//* getPokemonSprite(event.target.textContent);
})