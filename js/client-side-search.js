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
    h1: 100,
    h2: 10,
    h3: 5,
    h4: 4,
    h5: 3,
    h6: 2,
    body: 1,
  },  
  wordPosition: {
    wholeWord: 5,
    startWord: 3,
    midWord: 0
  }
};

function generateResults(searchIndex, queryString) {
  var wholeWordRegex = new RegExp(`\\b${queryString}\\b`, 'gi');
  var startWordRegex = new RegExp(`(?!\\b${queryString}\\b)\\b${queryString}`, 'gi');
  var midWordRegex = new RegExp(`(?!\\b${queryString}\\b)(?!\\b${queryString})${queryString}`, 'gi');

  if (queryString.length < 3 || !searchIndex) {
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
    const contentTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body'];
    contentTypes.forEach(contentType => {
      matchTypes.forEach(matchType => {
        var match;
        while ((match = matchType.regex.exec(item.content[contentType])) != null) {
          var existing = searchResults.find(searchResult => {
            return searchResult.href === item.href;
          });
          if (existing) {
            existing.matchIndexes.push({index: match.index, contentType: contentType, wordPosition: matchType.type});
            existing.exerpts.push(getExcerpt(match.input, match.index, 3));
            existing.content.push(item.body);
          } else {
            var newItem = {
              href: item.href,
              title: item.title,
              matchIndexes: [{index: match.index, contentType: contentType, wordPosition: matchType.type}],
              exerpts: [getExcerpt(match.input, match.index, 3)],
              content: [item.content[contentType]]
            };
            searchResults.push(newItem);
          }
        }
      });
    })
      
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

function createResultsView(sortedMatches, queryString) {
  sortedMatches =sortedMatches || [];
  queryString = queryString || '';
  let summary = '';
  if (queryString.length >= 3) {
    console.log(searchIndex)
    if (searchIndex) {
      summary = `${sortedMatches.length} ${customInflector(sortedMatches.length, {singular:'page'})} found with matches for "${highlightMatches(queryString, queryString)}".`;
    } else {
      summary = '<div class="loader"></div>'
    }
  } else {
    summary = 'Please enter at least 3 characters.';
  } 

  const searchResultSummaryEl = document.querySelector('.search-results-summary');
  searchResultSummaryEl.innerHTML = summary;
  var resultsHTML = `<div>`;
  sortedMatches.forEach(matchData => {
    const link = '<a href="' + matchData.href + '">'
    var thisMatchHTML = '<div class="search-result">';
    if (matchData.title) {
      thisMatchHTML += '<h3 class="search-result-title">' + link + highlightMatches(queryString, matchData.title) + '</a></h3>';
    }
    thisMatchHTML += '<div class="search-result-body"><div class="search-result-href">' + link + matchData.href + '</a></div>';
    (matchData.exerpts || []).forEach(exerpt => {
      thisMatchHTML += '<div class="search-result-snippet">' + highlightMatches(queryString, exerpt).trim() + '...</div>';
    });
    thisMatchHTML += '</div></div>';
    resultsHTML += thisMatchHTML;
  });
  resultsHTML += '</div>';
  document.querySelector('[data-search-results]').innerHTML = resultsHTML;
  document.querySelector('[data-search-results]').classList.remove('loading');
}

var searchIndex;

function initSearch(opts) {
  const searchInput = document.querySelector('[data-search-input]');
  if (!searchIndex) {
    fetch('/search-index.json').then(result => {
      return result.json();
    }).then(json => {
      searchIndex = json;
      if (searchInput.value) {
        var queryString = searchInput.value;
        createResultsView(generateResults(searchIndex, queryString), queryString);
      }
    });
  }
  searchInput.addEventListener('keyup', function(e, v) {
    var queryString = this.value;
    createResultsView(generateResults(searchIndex, queryString), queryString);
    return false;
  });
}
