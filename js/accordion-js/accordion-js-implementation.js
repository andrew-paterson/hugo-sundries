function ancestorsWithClass(element, className) {
  let nodes = [];
  nodes.push(element);
  while (element.parentElement) {
    if (element.parentElement.classList.contains(className)) {
      nodes.unshift(element.parentElement);
    }
    element = element.parentElement;
  }
  return nodes;
}

const accordionEls = Array.from(document.querySelectorAll('.accordion-container'));
const hash = window.location.hash;
if (hash) {
  accordionEls.forEach(accordionEl => {
    const showMultiple = accordionEl.hasAttribute('data-ac-show-multiple');
    const urlHash = `[data-title-parsed=${hash.replace('#', '')}]`;
    const urlHashAccordionPanel = accordionEl.querySelector(urlHash);
    if (urlHashAccordionPanel) {
      const urlHashAccordionPanelAncestors = ancestorsWithClass(urlHashAccordionPanel, 'ac');
      urlHashAccordionPanelAncestors.forEach(ac => {
        ac.setAttribute('data-ac-panel-initially-open', '');  
      });
      if (!showMultiple) {
        const defaultOpen = accordionEl.querySelector('[data-ac-panel-default-open]');
        if (defaultOpen) {
          defaultOpen.removeAttribute('data-ac-panel-default-open')
        }
      }
    }
  });
}
const scrollElementSelector = '#wrapper';

const autoScrollEl = document.querySelector('[data-auto-scroll] [data-ac-panel-initially-open]');
if (autoScrollEl) {
  setTimeout(() => { // setTimeout causes the scroll to happen after the accordion hs finished opening.
    scrollElementToTop(autoScrollEl);
  });
}

function scrollElementToTop(currElement) {
  const parsedTitle = currElement.getAttribute('data-title-parsed');
      window.location.hash = parsedTitle;
      if (scrollElementSelector) {
        const scrollElement = document.querySelector(scrollElementSelector);
        const scrollElementRect = scrollElement.getBoundingClientRect();
        const scrollElementPaddingTop = parseFloat(window.getComputedStyle(scrollElement, null).getPropertyValue('padding-top'));
        scrollElement.scrollTop = currElement.offsetTop - scrollElementRect.top - scrollElementPaddingTop - 12;
      } else {
        currElement.scrollIntoView({behavior: 'smooth'});
      }
}

const accordionObjects = accordionEls.map(accordionEl => {
  const options = {
    onOpen: (currElement) => {
      console.log('test')
      scrollElementToTop(currElement);
    }
  }
  const accordionPanelElements = Array.from(accordionEl.querySelectorAll(':scope > .ac'));
  const accordionPanels = accordionPanelElements.map(item => {
    return {
      title: item.getAttribute('data-title-parsed'),
      initiallyOpen: item.hasAttribute('data-ac-panel-initially-open') || item.hasAttribute('data-ac-panel-default-open') 
    }
  });

  const openOnInit = accordionPanels.filter(item => item.initiallyOpen).map(item => accordionPanels.indexOf(item));
  if (openOnInit.length) {
    options.openOnInit = openOnInit;
  }
  return {
    accordionEl: accordionEl,
    level: ancestorsWithClass(accordionEl, 'accordion-container').length,
    itemsCount: accordionPanelElements.length,
    items: accordionPanels,
    options: options,
    openOnInit: openOnInit,
  }
});
accordionObjects.forEach(accordionObject => {
  new Accordion(accordionObject.accordionEl, accordionObject.options)
})