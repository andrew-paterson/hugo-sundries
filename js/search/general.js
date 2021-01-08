if (GetIEVersion() > 0) {
  // IE pollyfills (Will only load in IE).
  // add https://github.com/tonipinel/object-fit-polyfill/ for usage instructions
  document.write('<script src="https://cdn.jsdelivr.net/npm/object-fit-polyfill@0.1.0/dist/object-fit-polyfill.min.js"><\/script>');
  document.write(`<script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script> `);
  
  var svgs = document.querySelectorAll('svg');
  var j;
  for (j = 0; j < svgs.length; j++) {
    var svg = svgs[j];
    setSVGsize(svg);
  } 
}

//https://stackoverflow.com/questions/53331180/babel-polyfill-being-included-but-foreach-still-doesnt-work-in-ie11-on-nodelis
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}


var links = document.querySelectorAll('a');
var i;
for (i = 0; i < links.length; i++) {
  var link = links[i];
  if (link.hostname !== window.location.hostname) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
} 

function GetIEVersion() {
  var sAgent = window.navigator.userAgent;
  var Idx = sAgent.indexOf("MSIE");

  // If IE, return version number.
  if (Idx > 0) 
    return parseInt(sAgent.substring(Idx+ 5, sAgent.indexOf(".", Idx)));

  // If IE 11 then look for Updated user agent string.
  else if (navigator.userAgent.match(/Trident\/7\./)) 
    return 11;

  else
    return 0; //It is not IE
}

function setSVGsize(svg) {
  var rect = svg.getBoundingClientRect();
  var viewBox = svg.getAttribute('viewBox').split(/\s+|,/);
  if (!viewBox) { return; }
  var viewBoxWidth = parseFloat(viewBox[2]);
  var viewBoxHeight = parseFloat(viewBox[3]);
  var rectWidthHeight = rect.width/rect.height;
  var viewBoxDimensions = viewBoxWidth/viewBoxHeight;
  if (rectWidthHeight > viewBoxDimensions) {
    var newWidth = rect.height*viewBoxWidth/viewBoxHeight;
    svg.setAttribute("style", `width: ${newWidth}px`);
  } else if (rectWidthHeight < viewBoxDimensions) {
    var newHeight = rect.width*viewBoxHeight/viewBoxWidth;
    svg.setAttribute("style", `height: ${newHeight}px`);
  }
}

function adjustHeight() {
  var dimensionedElements = document.querySelectorAll('[data-dimensions]');
  dimensionedElements.forEach(element => {
    var dimensions = element.getAttribute('data-dimensions').split(':');
    var widthRatio = parseInt(dimensions[0]);
    var heightRatio = parseInt(dimensions[1]);
    var adjustedHeight = Math.ceil(element.offsetWidth/widthRatio*heightRatio);
    element.style.height = `${adjustedHeight}px`;
  });
}

adjustHeight();
window.addEventListener("resize", adjustHeight);

var menuItems = document.querySelectorAll('.menu li');
for (i = 0; i < menuItems.length; ++i) {
  var descendantLinks = menuItems[i].querySelectorAll('a');
  for (j = 0; j < descendantLinks.length; ++j) {
    var link = descendantLinks[j];
    if (link.attributes.href.nodeValue === '#' || !link.attributes.href.nodeValue) { continue; }
    if (`${link.origin}${link.pathname}`.replace(/\/$/, "") === `${window.location.origin}${window.location.pathname}`.replace(/\/$/, "")) {
      menuItems[i].classList.add('active');
    }
  }
}

document.querySelectorAll('ul.level-2').forEach(childMenu => {
  childMenu.onmouseenter = function() {
    childMenu.parentElement.classList.add('highlighted');
  };
  childMenu.onmouseleave = function() {
    childMenu.parentElement.classList.remove('highlighted');
  };
})