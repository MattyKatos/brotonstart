// Dynamically render links from BROTON_LINKS
window.addEventListener('DOMContentLoaded', function() {
  let linksLoaded = false, headersLoaded = false;
  function maybeFadeIn() {
    // Only fade in after both links and headers are loaded
    if (document.body.classList.contains('fade-in')) return;
    if (window.BROTON_LINKS && window.BROTON_HEADERS) {
      document.body.classList.add('fade-in');
    }
  }

  // Dropdown logic for header toggles
  const dropdownBtn = document.getElementById('dropdown-toggle');
  const dropdownContent = document.getElementById('dropdown-content');
  const dropdownWrap = dropdownBtn ? dropdownBtn.closest('.header-dropdown') : null;
  if (dropdownBtn && dropdownContent && dropdownWrap) {
    dropdownBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownWrap.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!dropdownWrap.contains(e.target)) {
        dropdownWrap.classList.remove('open');
      }
    });
  }

  // SFW toggle logic
  const sfwToggle = document.getElementById('sfw-toggle');
  let sfw = localStorage.getItem('BROTON_SFW');
  window.BROTON_SFW = sfw === 'true';
  if (sfwToggle) {
    sfwToggle.checked = window.BROTON_SFW;
    sfwToggle.addEventListener('change', function() {
      window.BROTON_SFW = sfwToggle.checked;
      localStorage.setItem('BROTON_SFW', window.BROTON_SFW);
      renderHeader();
    });
  }

  // Normy Mode toggle logic
  const normyToggle = document.getElementById('normy-toggle');
  let normy = localStorage.getItem('BROTON_NORMY');
  window.BROTON_NORMY = normy === 'true';
  if (normyToggle) {
    normyToggle.checked = window.BROTON_NORMY;
    normyToggle.addEventListener('change', function() {
      window.BROTON_NORMY = normyToggle.checked;
      localStorage.setItem('BROTON_NORMY', window.BROTON_NORMY);
      updateSearchForm();
    });
  }

  function updateSearchForm() {
    const form = document.querySelector('form');
    const input = form ? form.querySelector('input[type="text"]') : null;
    if (form) {
      if (window.BROTON_NORMY) {
        form.action = "https://www.google.com/search";
        if (input) input.placeholder = "The abyss stares back...";
      } else {
        form.action = "https://duckduckgo.com/";
        if (input) input.placeholder = "Gaze into the abyss...";
      }
    }
  }

  function renderHeader() {
    const h1 = document.querySelector('h1');
    if (!h1) return;
    let headers = window.BROTON_HEADERS || [{title: "search.broton", sfw: true}];
    if (window.BROTON_SFW) {
      headers = headers.filter(h => h.sfw);
    }
    if (headers.length === 0) {
      h1.textContent = "search.broton";
      return;
    }
    const randomHeader = headers[Math.floor(Math.random() * headers.length)];
    h1.textContent = randomHeader.title || randomHeader;
  }

  // Always use client-side header: fetch titles and render immediately
  fetch('titles.json')
    .then(response => response.json())
    .then(data => {
      window.BROTON_HEADERS = data;
      renderHeader();
      maybeFadeIn();
    });


  updateSearchForm();

  // Change submit button text on submit
  const form = document.querySelector('form');
  if (form) {
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
    form.addEventListener('submit', function(e) {
      if (submitBtn) {
        submitBtn.dataset.prevText = submitBtn.value || submitBtn.textContent;
        if (submitBtn.tagName === 'INPUT') {
          submitBtn.value = 'Nice.';
        } else {
          submitBtn.textContent = 'Nice.';
        }
      }
      // Optionally restore after a delay for SPA
      setTimeout(() => {
        if (submitBtn && submitBtn.dataset.prevText) {
          if (submitBtn.tagName === 'INPUT') {
            submitBtn.value = submitBtn.dataset.prevText;
          } else {
            submitBtn.textContent = submitBtn.dataset.prevText;
          }
        }
      }, 500);
    });
  }

  // Fetch links.json and set links, then render
  fetch('links.json')
    .then(response => response.json())
    .then(data => {
      window.BROTON_LINKS = data;
      const linksDiv = document.querySelector('.links');
      if (linksDiv) {
        linksDiv.innerHTML = window.BROTON_LINKS.map(link => {
          // Extract domain for favicon
          let domain;
          try {
            domain = new URL(link.url).hostname;
          } catch (e) {
            domain = '';
          }
          let faviconUrl = '';
          if (link.favicon) {
            faviconUrl = link.favicon;
          } else if (domain) {
            faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
          }
          return `<a href="${link.url}" target="_blank" class="link-btn">
            ${faviconUrl ? `<img src='${faviconUrl}' class='favicon' alt='' onerror="this.style.display='none';this.parentNode.querySelector('.fallback-icon').style.display='inline-block';" />` : ''}
            <span class="fallback-icon" style="display:${faviconUrl ? 'none' : 'inline-block'};font-size:1.2em;vertical-align:middle;margin-right:0.6em;">🌐</span>
            <span class="btn-text">${link.name}</span>
          </a>`;
        }).join(' ');
      }
      maybeFadeIn();
    });

});
