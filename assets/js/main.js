document.addEventListener('DOMContentLoaded', () => {
  // Toggle Mobile Menu
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
      });
    });
  }

  // Invio Candidatura
  const form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      console.log('Dati candidatura:', data);
      
      alert('Grazie! Abbiamo ricevuto la tua candidatura per AMASCALZON Mini Pub. Ti ricontatteremo a breve.');
      form.reset();
    });
  }
});
