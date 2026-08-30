(function () {
  'use strict';

  function showSection(targetId) {
    if (!targetId || targetId === 'home' || targetId === 'view-home') {
      targetId = 'view-home';
    }

    // Nascondi tutte le sezioni
    const allSections = document.querySelectorAll('.site-section');
    allSections.forEach(function (sec) {
      sec.classList.remove('is-visible');
      sec.style.display = 'none';
    });

    // Mostra la sezione richiesta
    const activeSection = document.getElementById(targetId);
    if (activeSection) {
      activeSection.classList.add('is-visible');
      activeSection.style.display = 'block';

      // Se passiamo a prenotazioni, avvia/aggiorna il modulo
      if (targetId === 'view-prenotazioni' && typeof window.initBookingModule === 'function') {
        window.initBookingModule();
      }
    } else {
      const homeSec = document.getElementById('view-home');
      if (homeSec) {
        homeSec.classList.add('is-visible');
        homeSec.style.display = 'block';
      }
    }

    // Aggiorna visibilità dell'icona carrello in base alla scheda
    if (typeof window.updateHeaderCartVisibility === 'function') {
      window.updateHeaderCartVisibility();
    }

    // Scroll in cima istantaneo al cambio sezione
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Gestione click delegata per tutti i link di navigazione
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('a[href^="#view-"], a[href^="#home"], [data-target], .btn-back-home, .logo');
    if (!trigger) return;

    // Se è un link esterno o tel/mailto, lascia proseguire il browser
    if (trigger.tagName === 'A' && (trigger.href.startsWith('http') || trigger.href.startsWith('tel:') || trigger.href.startsWith('mailto:'))) {
      return;
    }

    e.preventDefault();

    let targetId = trigger.getAttribute('data-target');
    if (!targetId && trigger.getAttribute('href')) {
      targetId = trigger.getAttribute('href').replace('#', '');
    }

    if (trigger.classList.contains('logo') || trigger.closest('.logo') || targetId === 'home') {
      targetId = 'view-home';
    }

    if (targetId) {
      window.location.hash = targetId;
      showSection(targetId);
    }

    // Chiudi il menu mobile se aperto
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
      mainNav.classList.remove('nav-open');
    }
  });

  // Toggle Menu Hamburger Mobile
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      mainNav.classList.toggle('nav-open');
    });
  }

  // Gestione cambio hash (tasto Indietro/Avanti del browser)
  window.addEventListener('hashchange', function () {
    const currentHash = window.location.hash.replace('#', '');
    showSection(currentHash || 'view-home');
  });

  // Invio Candidatura Franchising
  function setupLeadForm() {
    const form = document.getElementById('lead-form');
    const submitBtn = document.getElementById('submit-btn');
    const formFeedback = document.getElementById('form-feedback');

    if (form) {
      form.addEventListener('submit', async function (e) {
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
        const formAction = form.getAttribute('action') || 'https://formsubmit.co/INSERISCI_IL_TOKEN_QUI';
        const ajaxUrl = formAction.replace('formsubmit.co/', 'formsubmit.co/ajax/');

        try {
          const response = await fetch(ajaxUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/json'
            },
            body: formData
          });

          if (response.ok) {
            if (formFeedback) {
              formFeedback.textContent = 'Grazie! La tua candidatura è stata inviata con successo. Ti ricontatteremo a breve.';
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
            formFeedback.textContent = 'Si è verificato un problema con l\'invio. Puoi contattarci direttamente tramite i nostri recapiti ufficiali.';
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
  }

  // Gestione Pulsante Torna Su Flottante
  function setupScrollTop() {
    const btnScrollTop = document.getElementById('btn-scroll-top');
    if (!btnScrollTop) return;

    function handleScrollToggle() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollY > 250) {
        btnScrollTop.classList.add('is-visible');
      } else {
        btnScrollTop.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', handleScrollToggle, { passive: true });
    document.addEventListener('scroll', handleScrollToggle, { passive: true });

    btnScrollTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Caricamento iniziale
  document.addEventListener('DOMContentLoaded', function () {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(initialHash)) {
      showSection(initialHash);
    } else {
      showSection('view-home');
    }
    setupLeadForm();
    setupScrollTop();
  });
})();
