(() => {
  const containers = [...document.querySelectorAll('[data-project-collection]')];
  if (!containers.length) return;
  const localRegister = '/assets/data/project-register.json';
  const eligible = (record, reviewMode) => record.approvalAuthority === 'COS' && (reviewMode ? ['Approved', 'Review'].includes(record.status) : record.status === 'Approved' && record.approvedBy === 'COS');
  const normalizePath = (path) => {
    if (!path || /^https?:\/\//.test(path)) return path || '';
    return (location.hostname.endsWith('github.io') ? '/meadnyte-02b-preview' : '') + path;
  };
  const makeCard = (record) => {
    const interactive = Boolean(record.destination);
    const card = document.createElement(interactive ? 'a' : 'article');
    card.className = 'house-project';
    card.setAttribute('role', 'listitem');
    card.dataset.recordId = record.id;
    if (interactive) card.href = normalizePath(record.destination);
    else { card.classList.add('house-project--forming'); card.setAttribute('aria-label', record.title + ' project room is in formation'); }
    if (record.imageFit === 'contain') card.classList.add('house-project--full-poster');
    const visual = document.createElement('figure');
    visual.className = 'house-project__visual';
    visual.dataset.protectedArt = '';
    const image = document.createElement('img');
    image.src = normalizePath(record.cover);
    image.alt = record.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    visual.append(image);
    const body = document.createElement('div');
    body.className = 'house-project__body';
    const code = document.createElement('p');
    code.className = 'house-project__code';
    code.textContent = record.id;
    const title = document.createElement('h3');
    title.textContent = record.title;
    body.append(code, title);
    if (record.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'house-project__subtitle';
      subtitle.textContent = record.subtitle;
      body.append(subtitle);
    }
    const medium = document.createElement('p');
    medium.className = 'house-project__medium';
    medium.textContent = record.medium;
    const tagline = document.createElement('p');
    tagline.className = 'house-project__tagline';
    tagline.textContent = record.tagline;
    const summary = document.createElement('p');
    summary.className = 'house-project__text';
    summary.textContent = record.summary;
    const threshold = document.createElement('span');
    threshold.className = 'house-project__threshold';
    threshold.textContent = record.doorwayState || (interactive ? 'Enter project' : 'Room in formation');
    body.append(medium, tagline, summary, threshold);
    card.append(visual, body);
    return card;
  };
  const fetchJson = async (url) => {
    const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error('Project Register request failed: ' + response.status);
    return response.json();
  };
  const loadRegister = async () => {
    const snapshot = await fetchJson(normalizePath(localRegister));
    if (!snapshot.remoteFeedUrl) return snapshot;
    try {
      const live = await fetchJson(snapshot.remoteFeedUrl);
      return live && Array.isArray(live.records) ? live : snapshot;
    } catch (error) {
      console.warn('Using the last approved Project Register snapshot.', error);
      return snapshot;
    }
  };
  const protectedArtwork = (target) => target.closest('[data-protected-art], .house-project__visual');
  document.addEventListener('contextmenu', (event) => { if (protectedArtwork(event.target)) event.preventDefault(); });
  document.addEventListener('dragstart', (event) => { if (protectedArtwork(event.target)) event.preventDefault(); });
  loadRegister().then((register) => {
    containers.forEach((container) => {
      const reviewMode = container.dataset.reviewMode === 'true'
        || window.location.hostname.endsWith('github.io')
        || new URLSearchParams(window.location.search).has('review');
      const records = register.records
        .filter((record) => record.collection === container.dataset.projectCollection)
        .filter((record) => eligible(record, reviewMode))
        .sort((a, b) => Number(a.order) - Number(b.order));
      if (!records.length) return;
      container.replaceChildren(...records.map(makeCard));
      container.dataset.registerState = 'ready';
    });
  }).catch((error) => {
    console.warn('Static Project Doorway fallback retained.', error);
    containers.forEach((container) => { container.dataset.registerState = 'fallback'; });
  });
})();
