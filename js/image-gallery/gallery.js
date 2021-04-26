var currentlyLoadingImages = false;
var batchSize = 9;

var galleries = document.querySelectorAll('.image-gallery');
galleries.forEach(gallery => {
  doGallery(gallery);
});

$(window).resize(function() {
  galleries.forEach(gallery => {
    var thumbnailElements = gallery.querySelectorAll('a.gallery-thumbnail');
    thumbnailElements.forEach(thumbnailElement => {
      setGalleryImageHeight(thumbnailElement, gallery);
    });
  });
});

$('#wrapper').scroll(function() {
  galleries.forEach(gallery => {
    checkLoad(gallery);
  });
});

$("[data-fancybox='gallery']").fancybox({
  
  idleTime: 9999999,
  preventCaptionOverlap: false,
  baseTpl:
    '<div class="fancybox-container" role="dialog" tabindex="-1">' +
    '<div class="fancybox-bg"></div>' +
    '<div class="fancybox-inner">' +
    '<div class="fancybox-infobar"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div>' +
    '<div class="fancybox-toolbar">{{buttons}}</div>' +
    '<div class="fancybox-navigation">{{arrows}}</div>' +
    '<div class="fancybox-stage"><div class="fancybox-caption"><div class=""fancybox-caption__body"></div></div></div>' +
    '' +
    '</div>' +
    '</div>',
});

function doGallery(galleryElement) {
  $('.image-gallery').after(' <div class="load-more-images">Loading more Images</div>');
  loadImageBatch(galleryElement);
}

function generateGalleryElement(galleryItem) {
  var src = galleryItem.getAttribute('data-lazy-image-src');
  var srcset = galleryItem.getAttribute('data-lazy-image-set');
  var srcsetSizes = galleryItem.getAttribute('data-lazy-image-srcset-sizes');
  return `<img srcset="${srcset}" sizes="${srcsetSizes}" src="${src}">`;
}

function thumbnailRequestComplete(galleryItem, currentBatch, galleryElement) {
  galleryItem.classList.add('loaded');
  galleryItem.classList.remove('loading');
  var loadingImages = Array.from(currentBatch).filter(item => {
    return !item.classList.contains('loaded')
  });
  if (loadingImages.length === 0) {
    currentlyLoadingImages = false;
    checkLoad(galleryElement); //Check for a new batch whenever the current batch finishes.
  }
}

function loadImageBatch(galleryElement) {
  currentlyLoadingImages = true;
  var currentBatch = Array.from(galleryElement.querySelectorAll('a.gallery-thumbnail:not(.loading):not(.loaded)')).slice(0, batchSize);

  currentBatch.forEach((galleryItem) => {
    galleryItem.insertAdjacentHTML('beforeend', generateGalleryElement(galleryItem));
    galleryItem.classList.add('loading');
    // Make vanilla javascript
    var thumbnailImage = $(galleryItem).find('img');
    thumbnailImage.on('load', function(responseTxt) {
      thumbnailRequestComplete(galleryItem, currentBatch, galleryElement);
    }).on('error', function(responseTxt) {
      thumbnailRequestComplete(galleryItem, currentBatch, galleryElement);
      $(thumbnailElement).addClass('failed');
    });
    setTimeout(function() { // Allow user to move on if one thumbnail is taking very long.
      if (!galleryItem.classList.add('loading')) {
        thumbnailRequestComplete(galleryItem, currentBatch, galleryElement);
      }  
    }, 5000);
    setGalleryImageHeight(galleryItem, galleryElement);
  });
}

function checkLoad(galleryElement) {
  // When all images have loaded.
  if (Array.from(galleryElement.querySelectorAll('a.gallery-thumbnail:not(.loaded)')).length === 0) {
    $(".load-more-images").remove();
    return;
  }
  var trigger = $(".load-more-images");
  if (!trigger.offset()) {
    return;
  }
  var trigger_position =  trigger.offset().top - $(window).outerHeight();
  if (trigger_position > $(window).scrollTop() || currentlyLoadingImages) {
    return;
  }
  loadImageBatch(galleryElement);
}

function setGalleryImageHeight(thumbnailElement, galleryElement) {
  if (thumbnailElement) {
    var thumbnailHeightWidthRatio;
    if (galleryElement.getAttribute('data-thumbnail-dimensions')) {
      var dimensions = galleryElement.getAttribute('data-thumbnail-dimensions').split(":");
      thumbnailHeightWidthRatio = dimensions[1]/dimensions[0];
    } else {
      thumbnailHeightWidthRatio = 1;
    }
    // change to Vanilla JS.
    var width = $(thumbnailElement).css('width').replace('px', '');
    var height = width*thumbnailHeightWidthRatio;
    $(thumbnailElement).css('height', height);
  }
}