(function(){
  async function loadEvents(){
    try {
      const res = await fetch('data/events.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.slice().sort((a,b) => (b.date || '').localeCompare(a.date || ''));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  function eventUrl(slug){
    const s = encodeURIComponent(slug);
    return `event.html?slug=${s}#slug=${s}`;
  }

  function imgTag(src, alt, classes=''){
    return `<img src="${src}" alt="${alt}" class="${classes}" loading="lazy">`;
  }

  async function renderHomeEvents(containerId){
    const container = document.getElementById(containerId);
    if (!container) return;
    const events = await loadEvents();
    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between';
    header.innerHTML = `
      <h2 class="text-2xl md:text-3xl font-bold">Latest Events</h2>
      <a href="events.html" class="text-blue-900 hover:underline text-sm md:text-base">View all events →</a>
    `;
    container.appendChild(header);

    const wrap = document.createElement('div');
    wrap.className = 'mt-6';

    if (events.length === 0) {
      wrap.innerHTML = '<p class="text-gray-600">No events yet. Check back soon.</p>';
      container.appendChild(wrap);
      return;
    }

    if (events.length === 1) {
      const ev = events[0];
      const collage = document.createElement('a');
      collage.href = eventUrl(ev.slug);
      collage.className = 'block relative bg-white rounded-xl shadow overflow-hidden card-hover max-w-4xl mx-auto';
      const img1 = (ev.images && ev.images[0] && ev.images[0].src) || '';
      const img2 = (ev.images && ev.images[1] && ev.images[1].src) || img1;
      collage.innerHTML = `
        <div class="events-collage">
          ${imgTag(img1, ev.title, 'w-full h-64 object-cover')}
          ${imgTag(img2, ev.title, 'w-full h-64 object-cover')}
        </div>
        <div class="overlay-gradient"></div>
        <div class="title-overlay">
          <h3 class="text-xl md:text-2xl font-semibold">${ev.title}</h3>
        </div>
      `;
      wrap.appendChild(collage);
      wrap.classList.add('reveal');
    } else {
      const grid = document.createElement('div');
      grid.className = 'grid gap-6 md:grid-cols-2';
      events.slice(0,2).forEach((ev) => {
        const covIdx = Number.isInteger(ev.coverImageIndex) ? ev.coverImageIndex : 0;
        const cover = (ev.images && ev.images[covIdx] && ev.images[covIdx].src) || '';
        const card = document.createElement('a');
        card.href = eventUrl(ev.slug);
        card.className = 'block relative bg-white rounded-xl shadow overflow-hidden card-hover reveal';
        card.innerHTML = `
          ${imgTag(cover, ev.title, 'w-full h-64 object-cover')}
          <div class="overlay-gradient"></div>
          <div class="title-overlay">
            <h3 class="text-xl md:text-2xl font-semibold">${ev.title}</h3>
          </div>
        `;
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
    }

    container.appendChild(wrap);
    if (window.applyReveal) window.applyReveal();
  }

  async function renderEventsList(containerId){
    const container = document.getElementById(containerId);
    if (!container) return;
    const events = await loadEvents();
    if (events.length === 0) {
      container.innerHTML = '<p class="text-gray-600">No events yet.</p>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid gap-6 md:grid-cols-2';
    events.forEach((ev) => {
      const covIdx = Number.isInteger(ev.coverImageIndex) ? ev.coverImageIndex : 0;
      const cover = (ev.images && ev.images[covIdx] && ev.images[covIdx].src) || '';
      const card = document.createElement('article');
      card.className = 'bg-white rounded-xl shadow overflow-hidden card-hover reveal';
      card.innerHTML = `
        <a href="${eventUrl(ev.slug)}" class="block relative">
          ${imgTag(cover, ev.title, 'w-full h-56 object-cover')}
          <div class="overlay-gradient"></div>
          <div class="title-overlay">
            <h3 class="text-lg md:text-xl font-semibold">${ev.title}</h3>
          </div>
        </a>
        <div class="p-4">
          <p class="text-sm text-gray-600">${ev.date || ''}${ev.location ? ' · ' + ev.location : ''}</p>
          <p class="mt-2 text-gray-700">${ev.summary || ''}</p>
          <a href="${eventUrl(ev.slug)}" class="inline-block mt-3 text-blue-900 hover:underline text-sm">View Event →</a>
        </div>
      `;
      grid.appendChild(card);
    });
    container.appendChild(grid);
    if (window.applyReveal) window.applyReveal();
  }

  async function renderEventDetail(containerId){
    const container = document.getElementById(containerId);
    if (!container) return;
    const fullParams = window.location.search || window.location.hash || '';
    const query = fullParams.includes('?') ? fullParams.split('?')[1] : fullParams.replace(/^#/, '');
    const params = new URLSearchParams(query);
    let slug = params.get('slug');
    if (!slug) {
      const parts = (window.location.pathname || '').split('/').filter(Boolean);
      const i = parts.indexOf('event');
      if (i !== -1 && parts[i+1]) slug = parts[i+1];
    }
    const events = await loadEvents();
    const ev = events.find(e => e.slug === slug);
    if (!ev) {
      container.innerHTML = '<p class="text-gray-700">Event not found.</p>';
      return;
    }
    const gallery = (ev.images || []).map((img) => `
      <figure class="bg-white rounded-lg overflow-hidden shadow-sm">
        ${imgTag(img.src, img.caption || ev.title, 'w-full h-64 object-cover')}
        ${img.caption ? `<figcaption class=\"p-3 text-sm text-gray-700\">${img.caption}</figcaption>` : ''}
      </figure>
    `).join('');

    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <a href="events.html" class="text-blue-900 hover:underline text-sm">← Back to Events</a>
        <h1 class="mt-3 text-2xl md:text-3xl font-bold">${ev.title}</h1>
        <p class="mt-1 text-gray-600">${ev.date || ''}${ev.location ? ' · ' + ev.location : ''}</p>
        <p class="mt-4 text-gray-700 whitespace-pre-line">${ev.description || ev.summary || ''}</p>
      </div>
      <div class="mt-8 grid gap-6 md:grid-cols-2">
        ${gallery}
      </div>
    `;
  }

  window.TMEvents = { renderHomeEvents, renderEventsList, renderEventDetail };
})();
