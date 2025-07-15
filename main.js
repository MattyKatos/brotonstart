// Dynamically render links from BROTON_LINKS
window.addEventListener('DOMContentLoaded', function() {
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
    if (window.BROTON_SFW) {
      h1.textContent = "search.broton";
    } else {
      let headers = window.BROTON_HEADERS || ["BROTON Start"];
      const randomHeader = headers[Math.floor(Math.random() * headers.length)];
      h1.textContent = randomHeader;
    }
  }

  renderHeader();
  updateSearchForm();

  // Render links
  const links = window.BROTON_LINKS || [];
  const linksDiv = document.querySelector('.links');
  if (linksDiv) {
    linksDiv.innerHTML = links.map(link => {
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
});
