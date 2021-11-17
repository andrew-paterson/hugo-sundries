// TODO data attribute for element unhide after image completes. 
// Pass boolean to determine whether to unhide element as soon as image starts loading, or after loading is complete.
// Dynamic pagination with url query params added- may require the ability to load images for the first time when scrolling up.
// Different batch sizes for different media queries

var currentlyLoadingImages = false;
var infinityLoaderElements = document.querySelectorAll('[data-infinity-image-loader]');
let scrollSelectorObjects;
let scrollSelectorMediaQueryLists = [];
let customScrollSelector;
let infinityImageLoaderDefaults;
var loadingMoreImagesElement;

function initLazyLoad(opts = {}) {
  infinityImageLoaderDefaults = opts;
  loadingMoreImagesElement = infinityImageLoaderDefaults.customLoadingElement || `<div class="load-more-images ${infinityImageLoaderDefaults.loadingElementClass || ''}" data-infinity-image-loader-load-more><div class="loader"></div></div>`;
  
  infinityLoaderElements.forEach(infinityLoaderElement => {
    doLazyLoad(infinityLoaderElement);
  });

  window.onresize = () => {
    infinityLoaderElements.forEach(infinityLoaderElement => {
      var infinityLoaderItems = infinityLoaderElement.querySelectorAll('[data-lazy-image-src]');
      infinityLoaderItems.forEach(infinityLoaderItem => {
        setImageParentHeight(infinityLoaderItem);
      });
    });
  };

  if (infinityImageLoaderDefaults.scrollElementSelector) {
    scrollSelectorObjects = infinityImageLoaderDefaults.scrollElementSelector.split(',').map(item => {
      const mediaQueryMatch = item.match(/(\(.*?\))\s(.*)/);
      if (mediaQueryMatch) {
        return {
          mediaQuery: mediaQueryMatch[1],
          selector: mediaQueryMatch[2],
        }
      } else {
        return {
          selector: item
        }
      }
    });
    scrollSelectorObjects.forEach(item => {
      if (item.mediaQuery) {
        const MediaQueryList = window.matchMedia(item.mediaQuery);
        scrollSelectorMediaQueryLists.push(MediaQueryList);
        MediaQueryList.onchange = () => { handleDeviceChangeScrollElement()};
      }
    });
    handleDeviceChangeScrollElement();
  } else {
    window.onscroll = () => {
      onScroll()
    }
  }
}

function handleDeviceChangeScrollElement() {
  const previousScrollSelector = customScrollSelector;
  const matchedMediaQueryList = scrollSelectorMediaQueryLists.find(scrollSelectorMediaQueryList => scrollSelectorMediaQueryList.matches);
  if (matchedMediaQueryList) {
    customScrollSelector = (scrollSelectorObjects.find(item => item.mediaQuery === matchedMediaQueryList.media) || {}).selector;
  } else {
    customScrollSelector = (scrollSelectorObjects.find(item => !item.mediaQuery) || {}).selector;
  }
  if (customScrollSelector) {
    if (previousScrollSelector) {
      document.querySelector(previousScrollSelector).onscroll = null;
    }
    document.querySelector(customScrollSelector).onscroll = () => {
      onScroll()
    }
  } else {
    window.onscroll = () => {
      onScroll()
    }
  }
}

function onScroll() {
  infinityLoaderElements.forEach(infinityLoaderElement => {
    checkLoad(infinityLoaderElement);
  });
}

function doLazyLoad(infinityLoaderElement) {
  infinityLoaderElement.insertAdjacentHTML('beforeend', loadingMoreImagesElement);
  Array.from(infinityLoaderElement.querySelectorAll('[data-lazy-image-src]')).forEach(infinityLoaderItem => {
    infinityLoaderItem.style.display = 'none';
  });

  loadImageBatch(infinityLoaderElement);
}

function generateImageMarkup(infinityLoaderItem) {
  if (infinityImageLoaderDefaults.customImageMarkup) {
    return infinityImageLoaderDefaults.customImageMarkup(infinityLoaderItem);
  }
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
  var imageClass = infinityImageLoaderDefaults.imageClass ? `class="${infinityImageLoaderDefaults.imageClass}"` : '';
  return `<img src="${src}" ${srcset} ${srcsetSizes} ${imageClass}>`;
}

function thumbnailRequestComplete(infinityLoaderItem, currentBatch, infinityLoaderElement, status) {
  infinityLoaderItem.classList.remove('loading');
  infinityLoaderItem.classList.add('complete');
  if (status) {
    infinityLoaderItem.classList.add(status);
  }
  setImageParentHeight(infinityLoaderItem);

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
  const loaderVisible = visibleY(loadMoreEl) && visibleX(loadMoreEl);
  if (!loaderVisible || currentlyLoadingImages) {
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

var visibleX = function(el){
  var rect = el.getBoundingClientRect(), left = rect.left, width = rect.width, 
    el = el.parentNode
  // Check if right of the element is off the page
  if (rect.right < 0) return false
  // Check its within the document viewport
  if (left > document.documentElement.clientWidth) return false
  do {
    rect = el.getBoundingClientRect()
    if (left <= rect.right === false) return false
    // Check if the element is out of view due to a container scrolling
    if ((left + width) <= rect.left) return false
    el = el.parentNode
  } while (el != document.body)
  return true
};

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