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
  const submitBtn = document.getElementById('submit-btn');
  const formFeedback = document.getElementById('form-feedback');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const originalBtnText = submitBtn ? submitBtn.innerText : 'Invia Candidatura Franchising';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Invio in corso...';
      }

      if (formFeedback) {
        formFeedback.style.display = 'none';
        formFeedback.className = 'form-feedback';
      }

      const formData = new FormData(form);

      try {
        const response = await fetch('https://formsubmit.co/ajax/mascoloalfy@libero.it', {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (response.ok) {
          if (formFeedback) {
            formFeedback.textContent = 'Grazie! La tua candidatura è stata inviata con successo a mascoloalfy@libero.it. Ti ricontatteremo a breve.';
            formFeedback.classList.add('success');
            formFeedback.style.display = 'block';
          }
          form.reset();
        } else {
          throw new Error('Errore durante l\'invio');
        }
      } catch (error) {
        console.error('Errore invio form:', error);
        if (formFeedback) {
          formFeedback.textContent = 'Si è verificato un problema con l\'invio automatico. Puoi scriverci direttamente a: mascoloalfy@libero.it';
          formFeedback.classList.add('error');
          formFeedback.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  }
});
