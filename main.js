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

  // Sidebar toggle functionality
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarClose = document.getElementById('sidebar-close');
  
  if (sidebarToggle && sidebar && sidebarOverlay && sidebarClose) {
    // Open sidebar
    sidebarToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.add('active');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    });
    
    // Close sidebar when clicking the close button
    sidebarClose.addEventListener('click', function() {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    // Close sidebar when clicking the overlay
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
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

  // Search engine selection logic
  const searchEngineSelect = document.getElementById('search-engine-select');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  
  // Initialize search engine dropdown and apply selected engine
  if (window.BROTON_SEARCH_ENGINES) {
    populateSearchEngineDropdown();
    applySelectedSearchEngine();
  }
  
  function populateSearchEngineDropdown() {
    if (!searchEngineSelect) return;
    
    // Clear existing options
    searchEngineSelect.innerHTML = '';
    
    // Get saved search engine or use default
    const savedEngine = localStorage.getItem('BROTON_SEARCH_ENGINE');
    let defaultEngine = window.BROTON_SEARCH_ENGINES.find(engine => engine.isDefault);
    if (!defaultEngine && window.BROTON_SEARCH_ENGINES.length > 0) {
      defaultEngine = window.BROTON_SEARCH_ENGINES[0];
    }
    
    // Add options to dropdown
    window.BROTON_SEARCH_ENGINES.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.name;
      option.textContent = engine.name;
      option.selected = savedEngine ? (engine.name === savedEngine) : (engine.isDefault);
      searchEngineSelect.appendChild(option);
    });
    
    // Add change event listener
    searchEngineSelect.addEventListener('change', function() {
      localStorage.setItem('BROTON_SEARCH_ENGINE', searchEngineSelect.value);
      applySelectedSearchEngine();
    });
  }
  
  function applySelectedSearchEngine() {
    if (!searchForm || !searchInput) return;
    
    const selectedEngineName = localStorage.getItem('BROTON_SEARCH_ENGINE') || 
      (window.BROTON_SEARCH_ENGINES.find(engine => engine.isDefault) || {}).name || 
      (window.BROTON_SEARCH_ENGINES[0] || {}).name;
    
    const selectedEngine = window.BROTON_SEARCH_ENGINES.find(engine => engine.name === selectedEngineName);
    
    if (selectedEngine) {
      searchForm.action = selectedEngine.action;
      searchInput.name = selectedEngine.queryParam;
      searchInput.placeholder = selectedEngine.placeholder;
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

  // Use client-side header from the pre-loaded config
  if (window.BROTON_HEADERS) {
    renderHeader();
    maybeFadeIn();
  }


  // Apply search engine settings
  applySelectedSearchEngine();

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

  // Render links from the pre-loaded config
  if (window.BROTON_LINKS) {
    renderAllLinks();
    maybeFadeIn();
  }

  function renderAllLinks() {
    const favsDiv = document.querySelector('.links-favorites');
    const sidebarCategoriesDiv = document.getElementById('sidebar-categories');
    const sidebarLinksDiv = document.getElementById('sidebar-links');
    
    if (!favsDiv) return;
    
    const favs = JSON.parse(localStorage.getItem('BROTON_FAVS') || '[]');
    
    // Build favorites - always visible in main content and sorted alphabetically
    const favLinks = window.BROTON_LINKS.filter(l => favs.includes(l.url))
      .sort((a, b) => a.name.localeCompare(b.name));
    favsDiv.innerHTML = favLinks.length ? `<div class="favorites-section">` + favLinks.map(link => renderLink(link, true)).join('') + '</div>' : '';
    
    // Only proceed with sidebar rendering if sidebar elements exist
    if (!sidebarCategoriesDiv || !sidebarLinksDiv) return;
    
    // Build categories and links by category (excluding favorites)
    const linksByCat = {};
    window.BROTON_LINKS.filter(l => !favs.includes(l.url)).forEach(link => {
      if (!linksByCat[link.category]) {
        linksByCat[link.category] = [];
      }
      linksByCat[link.category].push(link);
    });
    
    // Sort links alphabetically in each category
    Object.keys(linksByCat).forEach(category => {
      linksByCat[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    // Get active category from localStorage, default to 'all'
    const activeCategory = localStorage.getItem('BROTON_ACTIVE_CATEGORY') || 'all';
    
    // Create category buttons in sidebar with 'All' button first
    let categoryHTML = `<div class="sidebar-category${activeCategory === 'all' ? ' active' : ''}" data-category="all">All</div>`;
    
    // Add the rest of the categories
    categoryHTML += Object.keys(linksByCat).sort().map(cat => 
      `<div class="sidebar-category${cat === activeCategory ? ' active' : ''}" data-category="${cat}">${cat}</div>`
    ).join('');
    
    sidebarCategoriesDiv.innerHTML = categoryHTML;
    
    // Render links for the active category in sidebar
    if (activeCategory === 'all') {
      // Show all non-favorite links for 'All' category
      const allLinks = [];
      Object.values(linksByCat).forEach(links => allLinks.push(...links));
      // Sort all links alphabetically
      allLinks.sort((a, b) => a.name.localeCompare(b.name));
      sidebarLinksDiv.innerHTML = allLinks.map(link => renderSidebarLink(link)).join('');
    } else if (activeCategory !== 'none' && linksByCat[activeCategory]) {
      // Show links for the selected category
      sidebarLinksDiv.innerHTML = linksByCat[activeCategory].map(link => renderSidebarLink(link)).join('');
    } else {
      // No category selected
      sidebarLinksDiv.innerHTML = '<div class="sidebar-empty-message">Select a category to view links</div>';
    }
    
    // Add click handlers for stars (in both main content and sidebar)
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
    
    // Add click handlers for sidebar categories
    document.querySelectorAll('.sidebar-category').forEach(cat => {
      cat.addEventListener('click', function() {
        const category = this.dataset.category;
        const isAlreadyActive = this.classList.contains('active');
        
        // Remove active class from all category buttons
        document.querySelectorAll('.sidebar-category').forEach(t => t.classList.remove('active'));
        
        // If clicking an already active category, deselect it
        if (isAlreadyActive) {
          // Clear the links area
          sidebarLinksDiv.innerHTML = '<div class="sidebar-empty-message">Select a category to view links</div>';
          
          // Save 'none' as active category to localStorage
          localStorage.setItem('BROTON_ACTIVE_CATEGORY', 'none');
        } else {
          // Add active class to clicked category
          this.classList.add('active');
          
          // Show links for the selected category
          if (category === 'all') {
            // Show all non-favorite links for 'All' category
            const allLinks = [];
            Object.values(linksByCat).forEach(links => allLinks.push(...links));
            // Sort all links alphabetically
            allLinks.sort((a, b) => a.name.localeCompare(b.name));
            sidebarLinksDiv.innerHTML = allLinks.map(link => renderSidebarLink(link)).join('');
          } else {
            // Show links for the specific category
            sidebarLinksDiv.innerHTML = linksByCat[category].map(link => renderSidebarLink(link)).join('');
          }
          
          // Save active category to localStorage
          localStorage.setItem('BROTON_ACTIVE_CATEGORY', category);
        }
        
        // Re-attach star click handlers for newly rendered links
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
  
  function renderSidebarLink(link) {
    let domain;
    try { domain = new URL(link.url).hostname; } catch (e) { domain = ''; }
    let faviconUrl = link.favicon ? link.favicon : (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '');
    
    return `<div class="sidebar-link-row">`
      + `<a href="${link.url}" target="_blank" class="sidebar-link-btn">`
      + `${faviconUrl ? `<img src='${faviconUrl}' class='favicon' alt='' onerror="this.style.display='none';this.parentNode.querySelector('.fallback-icon').style.display='inline-block';" />` : ''}`
      + `<span class="fallback-icon" style="display:${faviconUrl ? 'none' : 'inline-block'};font-size:1.2em;vertical-align:middle;margin-right:0.6em;">🌐</span>`
      + `<span class="btn-text">${link.name}</span>`
      + `<span class="fav-star" style="color: #ffffff !important;" title="Favorite" data-url="${link.url}">&#9733;</span>`
      + `</a></div>`;
  }
});
