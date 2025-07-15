// Dynamically render links from BROTON_LINKS
window.addEventListener('DOMContentLoaded', function() {
  // Randomize header from config
  const headers = window.BROTON_HEADERS || ["BROTON Start"];
  const h1 = document.querySelector('h1');
  if (h1) {
    const randomHeader = headers[Math.floor(Math.random() * headers.length)];
    h1.textContent = randomHeader;
  }

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
