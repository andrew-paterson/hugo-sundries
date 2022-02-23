var flickrSizes = [{
  label: "Square",
  suffix: "_s",
  max: 75
},
{
  label: "Large Square",
  suffix: "_q",
  max: 150
},
{
  label: "Thumbnail",
  suffix: "_t",
  max: 100
},
{
  label: "Small",
  suffix: "_m",
  max: 240
},
{
  label: "Small 320",
  suffix: "_n",
  max: 320
},
{
  label: "Small 400",
  suffix: "_w",
  max: 400
},
{
  label: "Medium",
  suffix: "",
  max: 500
},
{
  label: "Medium 640",
  suffix: "_z",
  max: 640
},
{
  label: "Medium 800",
  suffix: "_c",
  max: 800
},
{
  label: "Large",
  suffix: "_b",
  max: 1024
}
];

function fetchJSONPromise(url, opts = {}) {
  return new Promise((resolve, reject) => {
    fetch(url, opts)
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(err => reject(err));
  })
}
// var albumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key={{ $flickr_api_key }}&photoset_id={{ $photoset_id }}&user_id={{ $flickr_user_id }}&format=json&nojsoncallback=1";


// var initialLoader = document.querySelector('.initial-loader');
function fetchFlickrGallery(galleryElem) {
  return new Promise((resolve, reject) => {
    // const galleryElem = document.querySelector('[data-flickr-gallery]');
    const albumUrl = galleryElem.getAttribute('data-album-url');
    fetchJSONPromise(albumUrl).then(data => {
      // initialLoader.remove();
      // console.log('-------------------------')
      // console.log(data);
      // console.log(albumUrl);
      if (data.stat === 'fail') {
        return;
      }
      data.photoset.photo.forEach(photo => {
        const imageUrlBase = "https://live.staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret;
        const src = imageUrlBase + ".jpg";
        const item = document.createElement('a');
        let srcset = '';
        flickrSizes.forEach(item => {
          srcset += imageUrlBase + item.suffix + ".jpg " + parseInt(0.75*item.max) + "w, ";
        })
        item.classList.add('gallery-thumbnail');
        item.setAttribute('href', src.replace('.jpg', '_b.jpg'));
        item.setAttribute('data-lazy-image-src', src);
        item.setAttribute('data-srcset', srcset);
        item.setAttribute('data-lazy-image-srcset', srcset);
        item.setAttribute('data-lazy-image-srcset-sizes', '(max-width: 400px) 130px, 300px');
        item.setAttribute('data-fancybox', 'gallery');
        item.setAttribute('data-flickr-id', photo.id);
        if (galleryElem.getAttribute('data-flickr-captions')) {
          item.setAttribute('data-caption', photo.title);
        }
        const innerDiv = document.createElement('div');
        innerDiv.setAttribute('data-lazy-image-parent', true);
        innerDiv.setAttribute('data-width-height-ratio', "4:3");
        item.append(innerDiv);
        galleryElem.append(item);
      });
      // flickrGalleryLoaded();
      resolve();
    });
  }).catch(err => {
    console.log(err)
    resolve();
  });
}

Fancybox.bind('[data-fancybox="gallery"]', {
  Thumbs: false,
  closeButton: "top"
});
function flickrGalleriesLoaded() {
  let done;
  if (done)  { return;}
  console.log('init')
  initLazyLoad({
    scrollElementSelector: '#wrapper',
    batchSize: 12,
  });
  done = true;
}

const fetchFlickrGalleries = Array.from(document.querySelectorAll('[data-flickr-gallery]')).map(galleryElem => {
  return fetchFlickrGallery(galleryElem);
});

Promise.all(fetchFlickrGalleries).then(res => {
  flickrGalleriesLoaded()
});