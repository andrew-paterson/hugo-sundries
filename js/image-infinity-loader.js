// TODO data attribute for element unhide after image completes. 
// Pass custom generateImageMarkup function.
// Pass boolean to determine whether to unhide element as soon as image starts loading, or after loading is complete.
// Dynamic pagination with url query params added- may require the ability to load images for the first time when scrolling up.
var currentlyLoadingImages = false;
var infinityLoaderElements = document.querySelectorAll('[data-infinity-image-loader]');
if (!infinityImageLoaderDefaults) {
  var infinityImageLoaderDefaults = {};
}
var loadingMoreImagesElement = infinityImageLoaderDefaults.loadingElement || '<div class="load-more-images" data-infinity-image-loader-load-more>Loading more Images</div>';

infinityLoaderElements.forEach(infinityLoaderElement => {
  doLazyLoad(infinityLoaderElement);
});

window.onresize = () => {
  infinityLoaderElements.forEach(infinityLoaderElement => {
    var infinityLoaderItems = infinityLoaderElement.querySelectorAll('[data-lazy-image-src]'); // TODO select by data attr
    infinityLoaderItems.forEach(infinityLoaderItem => {
      setImageParentHeight(infinityLoaderItem);
    });
  });
};

if (infinityImageLoaderDefaults.scrollElementSelector) {
  document.querySelector(infinityImageLoaderDefaults.scrollElementSelector).onscroll = () => {
    onScroll()
  }
} else {
  window.onscroll = () => {
    onScroll()
  }
}

function onScroll() {
  infinityLoaderElements.forEach(infinityLoaderElement => {
    checkLoad(infinityLoaderElement);
  });
}

function doLazyLoad(infinityLoaderElement) {
  infinityLoaderElement.insertAdjacentHTML('beforeend', loadingMoreImagesElement);
  loadImageBatch(infinityLoaderElement);
}

function generateImageMarkup(infinityLoaderItem) {
  var src = infinityLoaderItem.getAttribute('data-lazy-image-src');
  var dataSrcset = infinityLoaderItem.getAttribute('data-lazy-image-srcset');
  var srcset = '';
  var srcsetSizes = '';
  if (dataSrcset && dataSrcset.trim !== '') {
    srcset = `srcset="${dataSrcset}"`;
    var dataSrcsetSizes = infinityLoaderItem.getAttribute('data-lazy-image-srcset-sizes');
    if (dataSrcsetSizes) {
      srcsetSizes = `sizes="${dataSrcsetSizes}"`;
    }
  }
  return `<img src="${src}" ${srcset} ${srcsetSizes}>`;
}

function thumbnailRequestComplete(infinityLoaderItem, currentBatch, infinityLoaderElement, status) {
  infinityLoaderItem.classList.remove('loading');
  infinityLoaderItem.classList.add('complete');
  if (status) {
    infinityLoaderItem.classList.add(status);
  }
  var loadingImages = Array.from(currentBatch).filter(item => {
    return !item.classList.contains('complete')
  });
  if (loadingImages.length === 0) {
    currentlyLoadingImages = false;
    checkLoad(infinityLoaderElement);
  }
}

function loadImageBatch(infinityLoaderElement) {
  currentlyLoadingImages = true;
  var batchSize;
  if (infinityLoaderElement.getAttribute('data-infinity-image-loader-batch-size')) {
    batchSize =  parseInt(infinityLoaderElement.getAttribute('data-infinity-image-loader-batch-size'));
  } else if (infinityImageLoaderDefaults.batchSize) {
    batchSize = infinityImageLoaderDefaults.batchSize;
  } else {
    batchSize = 12;
  }
  var currentBatch = Array.from(infinityLoaderElement.querySelectorAll('[data-lazy-image-src]:not(.loading):not(.complete)')).slice(0, batchSize); 
  currentBatch.forEach((infinityLoaderItem) => {
    infinityLoaderItem.classList.add('loading');
    infinityLoaderItem.style.display = null;
    setImageParentHeight(infinityLoaderItem);

    infinityLoaderItem.querySelector('[data-lazy-image-parent]').insertAdjacentHTML('beforeend', generateImageMarkup(infinityLoaderItem));
    var thumbnailImage = infinityLoaderItem.querySelector('img');
    thumbnailImage.onload = () => {
      thumbnailRequestComplete(infinityLoaderItem, currentBatch, infinityLoaderElement, 'success');
    }
    thumbnailImage.onerror = () => {
      thumbnailRequestComplete(infinityLoaderItem, currentBatch, infinityLoaderElement, 'error');
    }
    setTimeout(() => { // Allow user to move on if one thumbnail is taking very long.
      if (!infinityLoaderItem.classList.contains('complete')) {
        thumbnailRequestComplete(infinityLoaderItem, currentBatch, infinityLoaderElement);
      }  
    }, 5000);
  });
}

function checkLoad(infinityLoaderElement) {
  var loadMoreEl = infinityLoaderElement.querySelector("[data-infinity-image-loader-load-more]");
  if (Array.from(infinityLoaderElement.querySelectorAll('[data-lazy-image-src]:not(.complete)')).length === 0) {
    if (loadMoreEl) {
      loadMoreEl.remove();
    }
    return;
  }

  if (!visibleY(loadMoreEl) || currentlyLoadingImages) {
    return;
  }
  loadImageBatch(infinityLoaderElement);
}

var visibleY = function(el){
  var rect = el.getBoundingClientRect(), top = rect.top, height = rect.height, 
    el = el.parentNode
  // Check if bottom of the element is off the page
  if (rect.bottom < 0) return false
  // Check its within the document viewport
  if (top > document.documentElement.clientHeight) return false
  do {
    rect = el.getBoundingClientRect()
    if (top <= rect.bottom === false) return false
    // Check if the element is out of view due to a container scrolling
    if ((top + height) <= rect.top) return false
    el = el.parentNode
  } while (el != document.body)
  return true
};

// TODO create visibleX version of the above.

function setImageParentHeight(infinityLoaderItem) {
  if (infinityLoaderItem) {
    var thumbnailHeightWidthRatio;
    var imageParent = infinityLoaderItem.querySelector('[data-lazy-image-parent]');
    if (imageParent.getAttribute('data-width-height-ratio')) {
      var dimensions = imageParent.getAttribute('data-width-height-ratio').split(":");
      thumbnailHeightWidthRatio = dimensions[1]/dimensions[0];
      var height = infinityLoaderItem.clientWidth*thumbnailHeightWidthRatio;
      imageParent.style.height = `${height}px`;
    }
  }
}