const autoAccordionEls = Array.from(document.querySelectorAll('.auto-accordion'));
autoAccordionEls.forEach(acc => {
  const newAccGroup = document.createElement('div');
  newAccGroup.classList.add('accordion-container');
  newAccGroup.setAttribute('data-auto-scroll', true);
  let currentAccItem;
  const children = Array.from(acc.querySelectorAll(':scope > *'));
  children.forEach((el, index) => {
    if (el.tagName === 'H2') {
      if (currentAccItem) {
        newAccGroup.appendChild(currentAccItem);
      }
      currentAccItem = document.createElement('div');
      currentAccItem.classList.add('ac');
      currentAccItem.classList.add('js-enabled');
      currentAccItem.setAttribute('data-title-parsed', el.textContent.replace(/\s/g, '-').replace(/-+/g, '-').replace(/[^0-9a-zA-Z_-]/g, '').toLowerCase());
      const headerEl = document.createElement('div');
      headerEl.classList.add('ac-header');
      const triggerEl = document.createElement('div');
      triggerEl.classList.add('ac-trigger');
      triggerEl.appendChild(el);
      headerEl.appendChild(triggerEl);
      currentAccItem.appendChild(headerEl);
      const panelEl = document.createElement('div');
      panelEl.classList.add('ac-panel');
      const panelInnerEl = document.createElement('div');
      panelInnerEl.classList.add('ac-panel-inner');
      panelEl.appendChild(panelInnerEl);
      currentAccItem.appendChild(panelEl);
    } else if (index === children.length - 1) {
      currentAccItem.querySelector('.ac-panel-inner').appendChild(el);
      newAccGroup.appendChild(currentAccItem);
    } else {
      if (currentAccItem) {
        currentAccItem.querySelector('.ac-panel-inner').appendChild(el);
      } else {
        newAccGroup.appendChild(el);
      }
    }
    acc.appendChild(newAccGroup)
  });
})
