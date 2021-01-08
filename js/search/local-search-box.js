function highlightMatches(needle, haystack) {
  var queryMatch = new RegExp(needle, 'gi');
  return haystack.replace(queryMatch, function(iMatch) {
    return '<span class="highlighted">' + iMatch + '</span>';
  });
}

function customInflector(value, options) {
	var pluralised = options.plural ? options.plural : `${options.singular}s`;
  var word = value !== 1 ? pluralised : options.singular;
  return word;
}

function getExcerpt(text, charIndex, precision) {
  // index is the index of the word which the charIndex falls in.
  var index = text.substring(0, charIndex).split(' ').length - 1;
  var words = text.split(' ');
  var result = [];
  var startIndex, stopIndex;

  startIndex = index - precision;
  if (startIndex < 0) {
    startIndex = 0;
  }

  stopIndex = index + precision + 1;
  if (stopIndex > words.length) {
    stopIndex = words.length;
  }

  result = result.concat( words.slice(startIndex, index) );
  result = result.concat( words.slice(index, stopIndex) );
  return result.join(' '); // join back
}

var scoringWeights = {
  contentType:{
    header: 100,
    body: 1,
  },  
  wordPosition: {
    wholeWord: 5,
    startWord: 3,
    midWord: 0
  }
};

function generateResults(searchIndex, phrase) {
  var wholeWordRegex = new RegExp(`\\b${phrase}\\b`, 'gi');
  var startWordRegex = new RegExp(`(?!\\b${phrase}\\b)\\b${phrase}`, 'gi');
  var midWordRegex = new RegExp(`(?!\\b${phrase}\\b)(?!\\b${phrase})${phrase}`, 'gi');

  if (phrase.length < 3) {
    return;
  }
  var searchResults = [];
  searchIndex.forEach(item => {
    if (!item) {return; }
    var matchTypes = [{
      regex: wholeWordRegex,
      type: 'wholeWord'
    }, {
      regex: startWordRegex,
      type: 'startWord'
    }, {
      regex: midWordRegex,
      type: 'midWord'
    }];
    matchTypes.forEach(matchType => {
      var match;
      while ((match = matchType.regex.exec(item.content)) != null) {
        var existing = searchResults.find(searchResult => {
          return searchResult.href === item.href;
        });
        if (existing) {
          existing.matchIndexes.push({index: match.index, contentType: item.contentType, wordPosition: matchType.type});
          existing.exerpts.push(getExcerpt(match.input, match.index, 3));
          existing.content.push(item.content);
        } else {
          var newItem = {
            href: item.href,
            title: item.title,
            matchIndexes: [{index: match.index, contentType: item.contentType, wordPosition: matchType.type}],
            exerpts: [getExcerpt(match.input, match.index, 3)],
            content: [item.content]
          };
          searchResults.push(newItem);
        }
      }
    });
  });
  searchResults = searchResults.map(item => {
    item.score = 0;
    item.matchIndexes.forEach(matchIndex => {

      item.score += scoringWeights.contentType[matchIndex.contentType]*scoringWeights.wordPosition[matchIndex.wordPosition];
    });
    return item;
  }).sort((a, b) => {
    return b.score - a.score;
  });
  return searchResults;
}

var searchIndex;
$('.search-input').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
  }
});

$('#site-search button').on('click', function(e, v) {
  var query = $('.search-input').val();
  e.preventDefault();
  window.location.href = `/search-results?query=${query}`;
});

$('.search-input').on('keyup', function(e, v) {
  var phrase = this.value;
  if (e.keyCode === 13) {
    window.location.href = `/search-results?query=${phrase}`;
  }
  if (!searchIndex) {
    fetch('/search-index.json').then(result => {
      return result.json();
    }).then(json => {
      searchIndex = json.searchIndex;
      createResultsView(generateResults(searchIndex, phrase), phrase);
    });
  } else {
    createResultsView(generateResults(searchIndex, phrase), phrase);
  }
  return false;
});

function createResultsView(sortedMatches, queryString) {
  sortedMatches =sortedMatches || [];
  queryString = queryString || '';
  var resultsHTML = `<div><div>${sortedMatches.length} ${customInflector(sortedMatches.length, {singular:'page'})} found with matches for "${highlightMatches(queryString, queryString)}".</div>`;
  sortedMatches.forEach(matchData => {
    var thisMatchHTML = '<a class="search-result" href="' + matchData.href + '">';
    thisMatchHTML += '<h3 class="search-result-title">' + highlightMatches(queryString, matchData.title) + '</h3>';
    thisMatchHTML += '<div class="search-result-body"><div class="search-result-href">' + matchData.href + '</div>';
    (matchData.exerpts || []).forEach(exerpt => {
      thisMatchHTML += '<div class="search-result-snippet">' + highlightMatches(queryString, exerpt).trim() + '...</div>';
    });
    thisMatchHTML += '</div></a>';
    resultsHTML += thisMatchHTML;
  });
  resultsHTML += '</div>';
  document.querySelector('.search-results').innerHTML = resultsHTML;
  document.querySelector('.search-results').classList.remove('loading');
}