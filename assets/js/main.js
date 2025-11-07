document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('reveal-active'));
  }

  function applyReveal(){
    const els = document.querySelectorAll('.reveal:not(.reveal-active)');
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            io2.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach((el) => io2.observe(el));
    } else {
      els.forEach((el) => el.classList.add('reveal-active'));
    }
  }

  window.applyReveal = applyReveal;

  try {
    const fullParams = window.location.search || window.location.hash || '';
    const query = fullParams.includes('?') ? fullParams.split('?')[1] : '';
    const params = new URLSearchParams(query);
    if (params.get('sent') === '1') {
      alert('Message sent successfully!');
      const url = new URL(window.location.href);
      if (!url.hash) url.hash = '#contact';
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
    }
  } catch (e) {
    
  }
});
