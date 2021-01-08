function beginsWith(needle, haystack){
  return (haystack.toLowerCase().substr(0, needle.length) === needle.toLowerCase());
}

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

function processResults(results) {
  var queryString = results.meta.query_string;
  var uniquePageMatches = [];
  results.data.forEach(item => {
    var object = item.attributes;
    var containsMatchesFromStart = false;
    object.matches.forEach(match => {
      if (beginsWith(queryString, match) || match.indexOf(` ${queryString}`) > -1) {
        containsMatchesFromStart = true;
      }
    });
    var existing = uniquePageMatches.find(uniquePageMatch => {
      return uniquePageMatch.href === object.href;
    });
    if (containsMatchesFromStart) {
      object.matchesCount = (object.matchesCount || 0)*1000;
    }
    if (object.content_type === 'header') {
      object.matchesCount = (object.matchesCount || 0)*100;
    } else {
      object.snippets = object.matches;
    }
    
    if (!existing) {
      uniquePageMatches.push(object);
    } else {
      existing.matchesCount = existing.matchesCount + object.matchesCount;
      existing.snippets = (existing.snippets || []).concat(object.snippets);
    }
  });
  var sortedMatches = uniquePageMatches.sort(function(a, b) {
    return b.matchesCount - a.matchesCount;
  });
  var resultsHTML = `<div><div>${sortedMatches.length} ${customInflector(sortedMatches.length, {singular:'page'})} found with matches for "${highlightMatches(queryString, queryString)}".</div>`;
  sortedMatches.forEach(matchData => {
    var thisMatchHTML = '<a class="search-result" href="' + matchData.href + '">';
    thisMatchHTML += '<h3 class="search-result-title">' + highlightMatches(queryString, matchData.title) + '</h3>';
    thisMatchHTML += '<div class="search-result-body"><div class="search-result-href">' + matchData.href + '</div>';
    (matchData.snippets || []).forEach(item => {
      thisMatchHTML += '<div class="search-result-snippet">' + highlightMatches(queryString, item).trim() + '...</div>';
    });
    thisMatchHTML += '</div></a>';
    resultsHTML += thisMatchHTML;
  });
  resultsHTML += '</div>';
  document.querySelector('.search-results').innerHTML = resultsHTML;
  document.querySelector('.search-results').classList.remove('loading');
}

function loadResults(queryString) {
  document.querySelector('.search-results').classList.add('loading');
  $.ajax({
    url: '/search/search.php',
    dataType: 'json',
    type: 'post',
    data: `query=${queryString}`,
    success: response => {
      processResults(response);
    },
    error: error => {
      console.log(error);
    }
  });
}

function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars[hash[0]] = hash[1];
  }
  return vars;
}

var urlVars = getUrlVars();
for (var key in urlVars) {
  if (key === 'query') {
    loadResults(urlVars[key]);
  }
}