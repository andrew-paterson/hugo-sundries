function highlightMatches(needle, haystack) {
  var queryMatch = new RegExp(needle, 'gi');
  const span = document.createElement('span');
  span.classList.add('highlighted');
  return haystack.replace(queryMatch, function(iMatch) {
    span.textContent = iMatch;
    return '<span class="highlighted">' + iMatch + '</span>';
    // return span;
  });
}

function highlightMatchesEl(needle, haystack) {
  var queryMatch = new RegExp(needle, 'gi');
  const span = document.createElement('span');
  span.classList.add('highlighted');
  return haystack.replace(queryMatch, function(iMatch) {
    span.textContent = iMatch;
    // return '<span class="highlighted">' + iMatch + '</span>';
    return span;
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
  const searchResultsEl = document.createElement('div');

  sortedMatches.forEach(matchData => {
    const linkEl = document.createElement('a');
    linkEl.setAttribute('href', matchData.href);
    linkEl.innerHTML = highlightMatches(queryString, matchData.title);
    const searchResultEl = document.createElement('div');
    searchResultEl.classList.add('search-result');
    
    if (matchData.title) {
      const titleEl = document.createElement('h3');
      titleEl.classList.add('search-result-title');
      titleEl.appendChild(linkEl);
      searchResultEl.appendChild(titleEl);
    }
    const searchResultBodyEl = document.createElement('div');
    searchResultBodyEl.classList.add('search-result-body');
    const searchResultHrefEl = document.createElement('div');
    searchResultHrefEl.classList.add('search-result-href');
    const hrefAnchorEl = document.createElement('a');
    hrefAnchorEl.setAttribute('href', matchData.href);
    hrefAnchorEl.textContent = matchData.href;
    searchResultHrefEl.appendChild(hrefAnchorEl);
    searchResultBodyEl.appendChild(searchResultHrefEl);
    const searchSnippetsIntroEl = document.createElement('div');
    searchSnippetsIntroEl.classList.add('search-snippets-intro');
    const searchSnippetsFullEl = document.createElement('div');
    searchSnippetsFullEl.classList.add('search-snippets-full');
    searchSnippetsFullEl.style.display = 'none';
    const searchSnippetsHeader = document.createElement('h3');
    searchSnippetsHeader.textContent = 'Excerpts';
    // searchSnippetsIntroEl.appendChild(searchSnippetsHeader);

    (matchData.exerpts || []).forEach((exerpt, index) => {
      const snippetEl = document.createElement('div');
      snippetEl.classList.add('search-result-snippet');
      snippetEl.innerHTML = `...${highlightMatches(queryString, exerpt).trim()}...`;
      if (index < 3) {
        searchSnippetsIntroEl.appendChild(snippetEl);
      } else {
        searchSnippetsFullEl.appendChild(snippetEl);
      }
    });
    searchResultBodyEl.appendChild(searchSnippetsIntroEl);
    if (matchData.exerpts.length > 3) {
      const switcherEl = document.createElement('a');
      switcherEl.setAttribute('role', 'button');
      switcherEl.textContent = `+ Show ${matchData.exerpts.length - 3} more matches`;
      searchResultBodyEl.appendChild(switcherEl);
      searchResultBodyEl.appendChild(searchSnippetsFullEl);
      switcherEl.addEventListener('click', (e) => {
        console.log(e.target);
        const fullSnippets = e.target.nextSibling;
        fullSnippets.style.display === 'none' ? fullSnippets.style.display = null : fullSnippets.style.display = 'none';
      })
    }
    searchResultEl.appendChild(searchResultBodyEl);
    searchResultsEl.appendChild(searchResultEl);
  });
  document.querySelector('[data-search-results]').appendChild(searchResultsEl);
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
