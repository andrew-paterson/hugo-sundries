# Partials

## Section menu

Generates an unordered list of linked page titles from a specified content section.

The `context` and `section_name` params are required as shown below.

    {{ partial "hugo-sundries/section-menu.html" (dict "context" . "section_name" "blog")}} }}

The `max` param is optional- limits the number of items to show.
    
    {{ partial "hugo-sundries/section-menu.html" (dict "context" . "section_name" "blog" "max" "5")}} }}


# JS

## Infinity lmage loader

Loads images in batches as the user scrolls. Note that the images can be wrapped inside any HTML markup. As long as the required data attributes are present where they need to be, the loading will work.

### The container

The set of elements with images to infinitely load must be contained in an element with the data attribute `data-infinity-image-loader`.

### The set of elements

Each element with an infinite loading image must have:

* A `data-lazy-image-src` attribute with the src of the element.
* It must contain an element with the data attribute `data-lazy-image-parent`. When the image is lazy loaded, it will be placed inside this element. This element should be empty.
  - The `data-lazy-image-parent` element may optionally have a `data-width-height-ratio`, set to a width/height ratio, expressed as "w:h". When present, the height of the `data-lazy-image-parent` element will be set based on the display width of the element and the ratio provided.
    - Note that for this to be effective, the loaded image should have the follwing styles:

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

## Examples

### A very simple example

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

### Responsive images, constrained image aspect ratio, and initially hidden elements.

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

### With other markup

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