function constrainImageHeight(element) {
  var dimensions = element.getAttribute('data-dimensions').split(':');
  var widthRatio = parseInt(dimensions[0]);
  var heightRatio = parseInt(dimensions[1]);
  var adjustedHeight = Math.ceil(element.offsetWidth/widthRatio*heightRatio);
  element.style.height = `${adjustedHeight}px`;
}

function constrainImageHeights() {
  var dimensionedElements = document.querySelectorAll('[data-dimensions]');
  dimensionedElements.forEach(element => {
    constrainImageHeight(element);
  });
}

constrainImageHeights();
window.addEventListener("resize", constrainImageHeights);

