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
      renderAllLinks();
      maybeFadeIn();
    });

  function renderAllLinks() {
    const favsDiv = document.querySelector('.links-favorites');
    const catsDiv = document.querySelector('.links-categories');
    if (!favsDiv || !catsDiv) return;
    const favs = JSON.parse(localStorage.getItem('BROTON_FAVS') || '[]');
    // Build favorites - always visible
    const favLinks = window.BROTON_LINKS.filter(l => favs.includes(l.url));
    favsDiv.innerHTML = favLinks.length ? `<div class="favorites-section">` + favLinks.map(link => renderLink(link, true)).join('') + '</div>' : '';
    // Build categories
    const linksByCat = {};
    window.BROTON_LINKS.forEach(link => {
      if (favs.includes(link.url)) return; // skip if favorited
      if (!linksByCat[link.category]) linksByCat[link.category] = [];
      linksByCat[link.category].push(link);
    });
    // Get active category from localStorage, default to none selected
    const activeCategory = localStorage.getItem('BROTON_ACTIVE_CATEGORY') || 'none';
    
    // Create tabs navigation without "All" tab
    const tabsHtml = `<div class="category-tabs">
      ${Object.keys(linksByCat).sort().map(cat => 
        `<div class="category-tab${cat === activeCategory ? ' active' : ''}" data-category="${cat}">${cat}</div>`
      ).join('')}
    </div>`;
    
    // Create a single area for all links with data-category attributes
    const allLinksHtml = `<div class="all-links-area">
      ${Object.keys(linksByCat).sort().flatMap(cat => 
        linksByCat[cat].map(link => {
          const linkHtml = renderLink(link, false);
          // Add data-category attribute to the link-row div and hide by default if no category is selected
          const isHidden = activeCategory === 'none' || (activeCategory !== 'all' && activeCategory !== cat);
          return linkHtml.replace('<div class="link-row">', `<div class="link-row${isHidden ? ' hidden' : ''}" data-category="${cat}">`);
        })
      ).join('')}
    </div>`;
    
    // Combine tabs and all links area
    catsDiv.innerHTML = tabsHtml + allLinksHtml;
    // Add click handlers for stars
    document.querySelectorAll('.fav-star').forEach(star => {
      star.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.dataset.url;
        let favs = JSON.parse(localStorage.getItem('BROTON_FAVS') || '[]');
        if (favs.includes(url)) {
          favs = favs.filter(u => u !== url);
        } else {
          favs.push(url);
        }
        localStorage.setItem('BROTON_FAVS', JSON.stringify(favs));
        renderAllLinks();
      });
    });
    
    // Add click handlers for category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const category = this.dataset.category;
        const isAlreadyActive = this.classList.contains('active');
        
        // Remove active class from all tabs
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        
        // If clicking an already active tab, deselect it
        if (isAlreadyActive) {
          // Hide all non-favorite links when deselecting
          document.querySelectorAll('.all-links-area .link-row:not(.favorite-link)').forEach(link => {
            link.classList.add('hidden');
          });
          
          // Save 'none' as active category to localStorage
          localStorage.setItem('BROTON_ACTIVE_CATEGORY', 'none');
        } else {
          // Add active class to clicked tab
          this.classList.add('active');
          
          // Show/hide category links based on category (not affecting favorites)
          document.querySelectorAll('.all-links-area .link-row:not(.favorite-link)').forEach(link => {
            if (link.dataset.category === category) {
              link.classList.remove('hidden');
            } else {
              link.classList.add('hidden');
            }
          });
          
          // Save active category to localStorage
          localStorage.setItem('BROTON_ACTIVE_CATEGORY', category);
        }
        
        // Ensure all favorite links are always visible
        document.querySelectorAll('.favorite-link').forEach(link => {
          link.classList.remove('hidden');
        });
      });
    });
  }

  function renderLink(link, isFav) {
    let domain;
    try { domain = new URL(link.url).hostname; } catch (e) { domain = ''; }
    let faviconUrl = link.favicon ? link.favicon : (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '');
    // Don't add data-category to favorites links so they won't be filtered
    return `<div class="link-row${isFav ? ' favorite-link' : ''}"><a href="${link.url}" target="_blank" class="link-btn">`
      + `${faviconUrl ? `<img src='${faviconUrl}' class='favicon' alt='' onerror="this.style.display='none';this.parentNode.querySelector('.fallback-icon').style.display='inline-block';" />` : ''}`
      + `<span class="fallback-icon" style="display:${faviconUrl ? 'none' : 'inline-block'};font-size:1.2em;vertical-align:middle;margin-right:0.6em;">🌐</span>`
      + `<span class="btn-text">${link.name}</span>`
      + `<span class="fav-star${isFav ? ' fav-starred' : ''}" style="color: ${isFav ? '#ffb300' : '#ffffff'} !important;" title="${isFav ? 'Unfavorite' : 'Favorite'}" data-url="${link.url}">&#9733;</span>`
      + `</a></div>`;
  }
});
