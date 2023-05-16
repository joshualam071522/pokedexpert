pokemonTriviaEl = document.getElementById('pokemonTrivia');
// Get the user input from the search field
var searchInput = document.getElementById("searchField");
var searchButton = document.getElementById("search");
var pokeimglistEl = document.getElementById('pokeimglist')
var storedPokemon = JSON.parse(localStorage.getItem('pokemon')) || [];
let recentSearchesListDiv = document.getElementById('recentSearchesList');



//* code to display recent search
function displayRecentSearch () {
  recentSearchesListDiv.innerHTML = '';
  //* check local storage of array
  console.log(storedPokemon);
  //* for loop that creates a button element with name of pokemon in the array and appends to recent searches div
  for (let i = 0; i < storedPokemon.length; i++) {
    const nameOfPokemon = storedPokemon[i];
    let recentSearchesBtn = document.createElement('BUTTON');
    recentSearchesBtn.classList.add('button', 'is-rounded', 'is-small','is-danger','is-light');
    recentSearchesBtn.append(nameOfPokemon);
    recentSearchesListDiv.append(recentSearchesBtn);
  }
}
//* function to retrieve pokemon sprite img
function getPokemonSprite (searchInput) {
  fetch ('https://pokeapi.co/api/v2/pokemon/'+searchInput+'')
  .then (function (response) {
    return response.json();
  })
  .then (function (data) {
  //* clears HTML of element so that sprites from previous searches do not stay
  pokeimglistEl.innerHTML = '';


  //*creates h2 element for name of pokemon and appends
  var pokeimgname = document.createElement('h2');
  pokeimgname.textContent = data.species.name;
  pokeimgname.classList.add('title', 'has-text-centered', 'is-4');
  pokeimglistEl.appendChild(pokeimgname);
  
  //*creates img element for pokemon and appends
  var retrievedImg = data.sprites.front_default;
  var pokemonImg = document.createElement('img');
  pokemonImg.setAttribute('src', retrievedImg);
  pokemonImg.setAttribute('alt', data.species.name);
  pokemonImg.setAttribute('id', 'pokeimg');
  pokeimglistEl.appendChild(pokemonImg);
  })
}

//* calls display recent searches so it loads up with the page
displayRecentSearch();

//* example link for action=parse: https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=parse&format=json&page=Bulbasaur_(Pok%C3%A9mon)
//* example link for query: https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=query&format=json&prop=extracts&pageids=1161

//* function to fetch pageid for specific pokemon
function getPokemonWikiDetails (searchInput) {

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
    console.log(data.parse.pageid);
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

//* fetching text from pokemon text using pageid
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

//* Add event listener to the search button
searchButton.addEventListener("click", function(event) {
  //* prevents form submission
  event.preventDefault();
  //* calls function to start searching API
  getPokemonWikiDetails(searchInput.value.toLowerCase());
  getPokemonSprite(searchInput.value.toLowerCase());
  fetchPokemonstat(searchInput.value.toLowerCase());
  //* resets the search bar
  searchField.value = "";
});

//*event listener for recent searches
recentSearchesListDiv.addEventListener('click', function(event) {
console.log(event.target.textContent);
getPokemonWikiDetails (event.target.textContent);
getPokemonSprite(event.target.textContent);
fetchPokemonstat(event.target.textContent);
})


var pokedex = document.getElementById('pokemonStats');
var fetchPokemonstat = function (searchInput) {
  fetch('https://pokeapi.co/api/v2/pokemon/' + searchInput, {})
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      pokedex.innerHTML = '';

      var pokemon = {
        type: data.types.map(function (type) { return capitalizeFirstLetter(type.type.name); }).join(', '),
        height: convertToInches(data.height), // Convert height to inches
        weight: convertToPounds(data.weight), // Convert weight to pounds
        abilities: data.abilities.map(function (ability) { return ability.ability.name; }).join(', '), // Get abilities
        stats: data.stats.map(function (stat) { 
          return {
            name: acronymizeStatLabel(stat.stat.name),
            value: stat.base_stat
          };
        }), // Get stats
        baseExperience: data.base_experience // Get base experience
      };

      displayPokemon(pokemon);
    })
    .catch(function (error) {
      console.log('Error:', error);
      displayPokemon(null);
    });
};

var convertToPounds = function (weightInHectograms) {
  // 1 hectogram is equal to 0.220462262 pounds
  var weightInPounds = weightInHectograms * 0.220462262;
  return weightInPounds.toFixed(2); // Round to 2 decimal places
};

var convertToInches = function (heightInDecimeters) {
  // 1 decimeter is equal to 3.93701 inches
  var heightInInches = heightInDecimeters * 3.93701;
  return heightInInches.toFixed(2); // Round to 2 decimal places
};

var capitalizeFirstLetter = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

var acronymizeStatLabel = function (label) {
  var acronym = label.split('.').map(function (word) {
    return word.charAt(0).toUpperCase();
  }).join('.');

  return acronym;
};

var displayPokemon = function (pokemon) {
  if (pokemon === null) {
    pokedex.innerHTML = 'Pokemon not found.';
    return;
  }

  var pokemonHTMLString = '<p>Type: ' + pokemon.type + '</p>\n'
    + '<p>Height: ' + pokemon.height + ' in</p>\n'
    + '<p>Weight: ' + pokemon.weight + ' lbs</p>\n'
    + '<p>Abilities: ' + pokemon.abilities + '</p>\n'
    + '<h3>Stats</h3>';

  for (var i = 0; i < pokemon.stats.length; i++) {
    pokemonHTMLString += '<p><strong>' + pokemon.stats[i].name + ':</strong> ' + pokemon.stats[i].value + '</p>';
  }

  if (pokemon.baseExperience !== null) {
    pokemonHTMLString += '<p>Base Experience: ' + pokemon.baseExperience + '</p>';
  }

  pokedex.innerHTML = pokemonHTMLString;
};