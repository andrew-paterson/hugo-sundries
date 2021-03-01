# Partials

## Section menu

Generates an unordered list of linked page titles from a specified content section.

The `context` and `section_name` params are required as shown below.

    {{ partial "hugo-sundries/section-menu.html" (dict "context" . "section_name" "blog")}} }}

The `max` param is optional- limits the number of items to show.
    
    {{ partial "hugo-sundries/section-menu.html" (dict "context" . "section_name" "blog" "max" "5")}} }}

## Responsive image

### Requirements

There must be a directory in `/static`specifically for responsive versions of all site images.  This directory should mirror the directory structure of the main site images folder, but contain several sizes of each images, with the width appended.

**Main image folder**

    /images/image-01.jpg
    /images/image-02.jpg

**Responsive image folder**

    /responsive-images/image-01-400w.jpg
    /responsive-images/image-01-1269w.jpg
    /responsive-images/image-01-1350w.jpg
    /responsive-images/image-01-1600w.jpg
    /responsive-images/image-02-200w.jpg
    /responsive-images/image-02-600w.jpg
    /responsive-images/image-03-400w.jpg

See [https://github.com/andrew-paterson/responsive-images](https://github.com/andrew-paterson/responsive-images) for an NPM module with generates the responsive versions of images based on settings provided.

Note that you should never directly refer to the responsive images in your Hugo templates or content files. Treat the main image folder as the dingle source of truth for images, and the responsive image partial will find the corresponding responsive image sizes for you.
### Config

The partial needs to know the base directory of your main images folder, as well as the base directory that will contain your responsive images. See the example config below wit the defaults.

`config.yml`

    params: 
      image_dir: #default = /images
      responsive_image_dir: #default = /responsive-images

## Basic Use

    {{ partial "hugo-sundries/responsive-image.html" (dict "context" .context "image_path" **PATH TO IMAGE IN THE MAIN IMAGE DIRECTORY**) }}
### Example

With the images listed above, the following partial will create the HTML below.

    {{ partial "hugo-sundries/responsive-image.html" (dict "context" . "image_path" "/images/image-01.jpg") }}

    <img srcset="/responsive-images/image-01-400w.jpg 400w, /responsive-images/image-01-1269w.jpg 1269w, /responsive-images/image-01-1350w.jpg 1350w, /responsive-images/image-01-1600w.jpg 1600w" src="/images/image-01.jpg" >

### Additional params

`caption` - displays in a `figcaption` element underneath the image, and wraps in in a `figure` element.
`image_link` - wraps the images in a link with the `href` set to the value of `image_link`.
`image_link_class` - class of the link that wraps the image.
`class` - class of the `img`, or the `figure` element is there is a caption.
`sizes` - the sizes attribute of the `img`.
`alt`- the alt attribute of the `img`.
`title`- the tile attribute of the `img`.
`img_attrs` - additional attributes for the image element.

**Example declaration**

    {{ partial "hugo-sundries/responsive-image.html" (dict "context" . "image_path" "/images/image-01.jpg" "sizes" "900px" "image_link" "https://example.com" "image_link_class" "external-link" "img_attrs" "data-dimensions=4:1 data-object-fit=cover) }}

**Example output**

    <figure class="cover-image">
      <a href="https://example.com" class="external-link">
        <img srcset="/images/image-01.jpg" src="/images/image-01.jpg" sizes="900px">
      </a>
      <figcaption>This is the image caption</figcaption>
    </figure>

## Youtube embed

Embeds a YouTube video. Simply pass the YouTube url as shown below.

    {{ partial "hugo-sundries/youtube.html" (dict "youtube_url" "https://www.youtube.com/watch?v=X21mJh6j9i4") }}
## Google map

    {{ partial "hugo-sundries/google-map.html" **Maps URL** }}
## Image gallery

Creates an grid layout of thumbnails from the images in a folder, and lazy loads them using the [below](#infinity-image-loader). Designed for se in conjunction with Fancybox 3. The thumbnails are generated using the [responsive image partial](#responsive-image).

### Requirements

The following scripts must be loaded on the page

* Jquery 3 or higher. This module has it at `hugo-sundries/js/jquery-3.2.1.min.js`.
* Fancybox 3. This module has it at `hugo-sundries/js/jquery.fancybox.min.js`.
* Image infinity loader. This module has it at `hugo-sundries/js/image-infinity-loader.js`
* The Javascript code that sets image dimensions based on aspect ratio. This module has it at `hugo-sundries/js/image-dimensions.js`.

Import the styles in `hugo-sundries/scss/_image-gallery.scss` and `hugo-sundries/scss/addons/fancybox.scss`
### Basic Usage

    {{ partial "hugo-sundries/image-gallery" (dict "context" . "gallery_path" **PATH_TO_DIRECTORY_OF_IMAGES**) }}
### Additional params

* `thumbnail_sizes_attr` - sizes attribute for the thumbnails where `srcset` is used.
* `thumbnail_aspect_ratio` - the aspect ratio for the thumbnails, expressed as width:height.
```
{{ partial "hugo-sundries/image-gallery" (dict "context" . "gallery_path" .Params.gallery_path "thumbnail_sizes_attr" "(max-width: 400px) 130px, 300px" "data_thumbnail_dimensions" "4:3")}}
```

# JavaScript components

## Infinity image loader

Loads images in batches as the user scrolls. Note that the images can be wrapped inside any HTML markup. As long as the required data attributes are present where they need to be, the loading will work.

### Adding it

Simply ensure that the script in `hugo-sundries/js/image-infinity-loader.js` is loaded on the page.
### The container

The set of elements with images to infinitely load must be contained in an element with the data attribute `data-infinity-image-loader`.

### The set of elements

Each element with an infinite loading image must have:

* A `data-lazy-image-src` attribute with the src of the element.
* It must contain an element with the data attribute `data-lazy-image-parent`. When the image is lazy loaded, it will be placed inside this element. This element should be empty.
  - The `data-lazy-image-parent` element may optionally have a `data-width-height-ratio`, set to a width/height ratio, expressed as "w:h". When present, the height of the `data-lazy-image-parent` element will be set based on the display width of the element and the ratio provided.
    - Note that for this to be effective, the loaded image should have the following styles:

          [data-lazy-image-parent] > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

      The object-fit property above can be any of the available values.

Each element with an infinite loading image may optionally have:

* A `data-lazy-image-srcset` attribute for responsive images. Will be added to the loaded image as the `srcset` attribute.
* A `data-lazy-image-srcset-sizes` attribute for responsive images. Will be added to the loaded image as the `sizes` attribute.
* An inline style attribute of `display:none`. This is removed when the lazy loaded image is inserted into the DOM. Note that this happens before the image has finished loading. 

### JS defaults

    <script>
      var infinityImageLoaderDefaults = {
        scrollElementSelector: '#wrapper',
        loadingElement: `<div class="test" data-infinity-image-loader-load-more>Test</div>`,
        batchSize: 3
      }
    </script>
### Examples

#### A very simple example

    <div data-infinity-image-loader>
      <div data-lazy-image-src="/images/image-01.jpg">
        <div data-lazy-image-parent></div>
      </div>
      <div data-lazy-image-src="/images/image-02.jpg">
        <div data-lazy-image-parent></div>
      </div>
      <div data-lazy-image-src="/images/image-02.jpg">
        <div data-lazy-image-parent></div>
      </div>
    </div>

#### Responsive images, constrained image aspect ratio, and initially hidden elements.

    <div data-infinity-image-loader>
      <div data-lazy-image-src="/images/image-01.jpg"
        data-lazy-image-srcset="/images/response/image-01-1440w.jpg 1440w, /images/response/image-01-1600w.jpg 1600w, /images/response/image-01-200w.jpg 200w, /images/response/image-01-480w.jpg 480w, /images/response/image-01-600w.jpg 600w, /images/response/image-01-768w.jpg 768w"
        data-lazy-image-srcset-sizes="(max-width: 400px) 130px, 300px" style="display: none;">
        <div data-lazy-image-parent data-width-height-ratio="4:3"></div>
      </div>
      <div data-lazy-image-src="/images/image-02.jpg"
        data-lazy-image-srcset="/images/response/image-02-1440w.jpg 1440w, /images/response/image-02-1600w.jpg 1600w, /images/response/image-02-200w.jpg 200w, /images/response/image-02-480w.jpg 480w, /images/response/image-02-600w.jpg 600w, /images/response/image-02-768w.jpg 768w"
        data-lazy-image-srcset-sizes="(max-width: 400px) 130px, 300px" style="display: none;">
        <div data-lazy-image-parent data-width-height-ratio="4:3"></div>
      </div>
      <div data-lazy-image-src="/images/image-03.jpg"
        data-lazy-image-srcset="/images/response/image-03-1440w.jpg 1440w, /images/response/image-03-1600w.jpg 1600w, /images/response/image-03-200w.jpg 200w, /images/response/image-03-480w.jpg 480w, /images/response/image-03-600w.jpg 600w, /images/response/image-03-768w.jpg 768w"
        data-lazy-image-srcset-sizes="(max-width: 400px) 130px, 300px" style="display: none;">
        <div data-lazy-image-parent data-width-height-ratio="4:3"></div>
      </div>
    </div>

#### With other markup

Each post is hidden until its image is added to the DOM and begins loading.

    <div data-infinity-image-loader>
      <div data-lazy-image-src="/images/image-01.jpg" style="display:none">
        <h2 class="post-title">Post 1</h2>
        <div data-lazy-image-parent></div>
        <div class="summary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
      </div>
      <div data-lazy-image-src="/images/image-02.jpg" style="display:none">
        <h2 class="post-title">Post 2</h2>
        <div data-lazy-image-parent></div>
        <div class="summary">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</div>
      </div>
      <div data-lazy-image-src="/images/image-03.jpg" style="display:none">
        <h2 class="post-title">Post 3</h2>
        <div data-lazy-image-parent></div>
        <div class="summary">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.</div>
      </div>
    </div>