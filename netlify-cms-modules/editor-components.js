
function createShortcodePattern(component) {
  const fields = component.fields.map(field => `(?=(?:.*${field.name}="([^"]+)")?)`).join('');
  return new RegExp(`^(?=.*\\bshortcodes\/${component.shortCodeName}\\b)${fields}.*$`)
}

const components = [{
  id: "content-snippet",
  label: "Content snippet",
  fields: [{
    name: 'snippet_name', 
    label: 'Snippet name', 
    widget: 'string',
  }],
  shortCodeName: 'content-snippet',
  patternOpts: {
    prefix: 'shortcodes\/content-snippet',
  },
  
  fromBlock: function(match) {
    return {
      snippet_name: match[1],
    };
  },
  toBlock: function(obj) {
    const snippet_name = obj.snippet_name ? `snippet_name="${obj.snippet_name}"` : '';
    return `{{< shortcodes\/content-snippet ${snippet_name} >}}`
  },
}, {
  id: "youtube",
  label: "Youtube video",
  fields: [{
    name: 'youtube_url', 
    label: 'Enter Youtube URL', 
    widget: 'string',
  }, {
    name: 'caption', 
    label: 'Video caption', 
    widget: 'string'
  }],

  pattern: /^(?=.*\bshortcodes\/youtube\b)(?=(?:.*youtube_url="([^"]+)")?)(?=(?:.*caption="([^"]+)")?).*$/,
  fromBlock: function(match) {
    return {
      youtube_url: match[1],
      caption: match[2]
    };
  },
  toBlock: function(obj) {
    const youtube_url = obj.youtube_url ? `youtube_url="${obj.youtube_url}"` : '';
    const caption = obj.caption ? `caption="${obj.caption}"` : '';
    return `{{< shortcodes\/youtube ${youtube_url} ${caption} >}}`
  },
  toPreview: function(obj) {
    const qps = (obj.youtube_url || '').split('?')[1] || '';
    const id = Object.fromEntries(new URLSearchParams(qps)).v;
    const caption = obj.caption ? `<figcaption>${obj.caption}</figcaption>` : '';
    const markup = `<figure><div class="embedded-video"><iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${caption}</figure>`;
    return (markup);
  }
}, {
  id: "divider",
  label: "Divider",
  pattern: '{{< shortcodes/clearing-div >}}',

  toBlock: function(obj) {
    return `{{< shortcodes\/clearing-div >}}`
  },
  toPreview: function(obj) {
    const markup = `<div style="clear:both"></div>`;
    return (markup);
  }
}, {
  id: "image",
  label: "Image",
  fields: [{
    name: 'image_path', 
    label: 'Select image', 
    widget: 'image',
  }, { 
    label: 'Image width',
    name: 'max_width',
    widget: 'select',
    default: ['100%'],
    options: ['25%', '33%', '50%', '100%']
  }, { 
    label: 'Align image',
    name: 'align',
    widget: 'select',
    options: ['left', 'center', 'right']
  }, {
    name: 'caption', 
    label: 'Image caption', 
    widget: 'string'
  }, {
    name: 'alt', 
    label: 'Description of the image for visually impaired users', 
    widget: 'string',
  }],
  shortCodeName: 'responsive-image',
  // patternOpts: {
    // prefix: 'shortcodes\/responsive-image',
  // }, 
  // pattern: /^(?=.*\bshortcodes\/responsive-image\b)(?=(?:.*image_path="([^"]+)")?)(?=(?:.*caption="([^"]+)")?)(?=(?:.*alt="([^"]+)")?)(?=(?:.*max_width="([^"]+)")?)(?=(?:.*align="([^"]+)")?).*$/,
  fromBlock: function(match) {
    return {
      image_path: match[1],
      caption: match[2],
      alt: match[3],
      max_width: match[4],
      align: match[5]
    };
  },
  toBlock: function(obj) {
    const classes = [];
    const caption = obj.caption ? `caption="${obj.caption}"` : '';
    const alt = obj.alt ? `alt="${obj.alt}"` : '';
    const image_path = obj.image_path ? `image_path="${obj.image_path}"` : '';
    const max_width = obj.max_width ? `max_width="${obj.max_width}"` : '';
    const align = obj.align && obj.align !== 'left' ? `align="${obj.align}"` : '';
    return `{{< shortcodes\/responsive-image ${image_path} ${alt} ${caption} ${max_width} ${align}>}}`
  },
  toPreview: function(obj) {
    let markup;
    if (obj.caption) {
      markup = `<figure><img src="${obj.image_path}" alt="${obj.alt}"><figcaption>${obj.caption}</figcaption></figure>`;
    } else {
      markup =  `<img src="${obj.image_path}" alt="${obj.src}" />`;
    }
    return (markup);
  }
}];
function registerComponents(CMS, breakdowns) {
  const filteredComponents = components.filter(component => {
    if (!breakdowns) {
      return true;
    } else {
      return breakdowns.find(breakdown => breakdown.componentId === component.id);
    }
  })
  .map(component => {
    const breakdown = breakdowns.find(breakdown => breakdown.componentId === component.id);
    if (component.shortCodeName) {
      component.pattern = createShortcodePattern(component);
    }
    if (breakdown.includeFields) {
      component.fields = component.fields.filter(field => breakdown.includeFields.indexOf(field.name) > -1);
    }

    if (breakdown.excludeFields) {
      component.fields = component.fields.filter(field => breakdown.excludeFields.indexOf(field.name) < 0);
    }
    return component;
  });
  filteredComponents.forEach(component => {
    CMS.registerEditorComponent(component);
  });
}
export { components };
export default registerComponents;