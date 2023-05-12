pokemonTriviaEl = document.getElementById('pokemonTrivia');

//* link for action=parse: https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=parse&format=json&page=Bulbasaur_(Pok%C3%A9mon)
//* link for archives: https://archives.bulbagarden.net/w/api.php?origin=*&action=parse&format=json&page=Category%3ABulbasaur
//* link for query: https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=query&format=json&prop=extracts&pageids=1161

//TODO need to do a fetch for parse link to get pageid # for querysearch
//* bulbasaur page id = 1161
//* shaymin page id = 13541
//* mimikyu page id = 214462

fetch('https://bulbapedia.bulbagarden.net/w/api.php?origin=*&action=query&format=json&prop=extracts&pageids=214462', {
  method: 'GET', //GET is the default.
  credentials: 'same-origin', // include, *same-origin, omit
  redirect: 'follow', // manual, *follow, error
})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    //* getting to root of info i need to extract
    var page = data.query.pages
    
    //TODO NEED TO USE PAGEID FROM FETCH PARSE JSON DATA AS THE PAGE ID
    //*page Id for bulbasaur page, need to use object key later
    //* bulbasaur page id=1161
    //* shaymin page id=13541
    //* mimikyu page id = 214462
    var pageId = 214462;
   
    //* seeing what i get from extract object
    var dataExtract = (page[pageId].extract);
    console.log(dataExtract);
    
    //* says that the object is a string
    console.log(typeof(dataExtract));

    //* Find index number for the word trivia in this string to split
    var dataTrivia = dataExtract.indexOf("Trivia");

    //* find index number of origin section, which is after trivia section, to slice
    //TODO USE "\" TO TARGET QUOTATION MARKS WITHIN TEXT TO SLICE BETTER
    var dataOrigin = dataExtract.indexOf(">Origin<");

    //* comes out as -1, which means indexOf could not find the word trivia
    //* even though the word is in the string. Do i need to remove html tags first?
    console.log(dataTrivia);
    console.log(dataOrigin);

    //* slice to only get a portion of the extracted text
    var dataExtractSliced = dataExtract.slice(dataTrivia, dataOrigin);
    console.log(dataExtractSliced); 

    // TODO need to use .replace method to remove all html tags etc.
    //* remove all li tags from text
    //* USE "\" CHARACTER TO TARGET QUOTATION MARKS IN STRINGS
    var dataHtmlRemoved = dataExtractSliced
    .replaceAll('<h3><span id=\"Origin\"', '')
    .replaceAll('<li>','')
    .replaceAll('<ul>','')
    .replaceAll('</ul>','')
    .replaceAll('Trivia">Trivia</span></h2>','')
    console.log(dataHtmlRemoved);
    

    //* data to split strings into an array of substrings
    var dataSentenceSplit = dataHtmlRemoved.split("</li>");
    console.log(dataSentenceSplit);
    var pokemonTriviaEl = document.getElementById("pokemonTrivia");
    var pokemonTriviaList = [];

    for (var i=0; i < dataSentenceSplit.length; i++) {
      var sentence = dataSentenceSplit[i][0].trim();
      if (sentence !== "") {
        pokemonTriviaList.push(sentence);
      }
    }
    console.log(pokemonTriviaList);

    //* testing out what comes out
    // pokemonTriviaEl.textContent = dataSentenceSplit[1];
  });