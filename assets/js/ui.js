/**
 * AMASCALZON PUB - UI Module (ui.js)
 * Gestione del DOM: navigazione viste, tab, modali personalizzazione, drawer carrello, toast e rendering catalogo.
 */
(function () {
  'use strict';

  let currentModalProd = null;
  let currentModalQty = 1;
  let modalExcludedIngredients = [];
  let onAddToCartCallback = null;
  let onCartQtyChangeCallback = null;
  let onCartRemoveCallback = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- 1. GESTIONE SEZIONI & NAVIGAZIONE ---
  function showSection(targetId) {
    if (!targetId || targetId === 'home' || targetId === 'view-home') {
      targetId = 'view-home';
    }

    const allSections = document.querySelectorAll('.site-section');
    allSections.forEach(sec => {
      sec.classList.remove('is-visible');
      sec.style.display = 'none';
    });

    const activeSection = document.getElementById(targetId);
    if (activeSection) {
      activeSection.classList.add('is-visible');
      activeSection.style.display = 'block';
    } else {
      const homeSec = document.getElementById('view-home');
      if (homeSec) {
        homeSec.classList.add('is-visible');
        homeSec.style.display = 'block';
      }
    }

    updateHeaderCartVisibility();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function updateHeaderCartVisibility() {
    const isPrenotazioni = window.location.hash.includes('view-prenotazioni');
    const tabAsporto = document.getElementById('tab-booking-asporto');
    const isAsportoVisible = isPrenotazioni && tabAsporto && tabAsporto.style.display !== 'none';
    const btnHeaderCart = document.getElementById('btn-header-cart');
    if (btnHeaderCart) {
      if (isAsportoVisible) {
        btnHeaderCart.classList.add('is-visible');
      } else {
        btnHeaderCart.classList.remove('is-visible');
      }
    }
  }

  function setupNavigation() {
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('a[href^="#view-"], a[href^="#home"], [data-target], .btn-back-home, .logo');
      if (!trigger) return;

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

      const mainNav = document.getElementById('main-nav');
      if (mainNav) {
        mainNav.classList.remove('nav-open');
      }
    });

    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        mainNav.classList.toggle('nav-open');
      });
    }
  }

  // --- 2. GESTIONE TAB PRENOTAZIONI / ASPORTO ---
  function setupTabs(onTabChange) {
    const btnTavolo = document.getElementById('btn-choice-tavolo');
    const btnAsporto = document.getElementById('btn-choice-asporto');
    const tabTavolo = document.getElementById('tab-booking-tavolo');
    const tabAsporto = document.getElementById('tab-booking-asporto');
    const btnHeaderCart = document.getElementById('btn-header-cart');

    function selectAsporto() {
      if (btnAsporto) btnAsporto.classList.add('active');
      if (btnTavolo) btnTavolo.classList.remove('active');
      if (tabTavolo) tabTavolo.style.display = 'none';
      if (btnHeaderCart) btnHeaderCart.classList.add('is-visible');
      if (tabAsporto) {
        tabAsporto.style.display = 'block';
        const topOffset = tabAsporto.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
      if (typeof onTabChange === 'function') onTabChange('asporto');
    }

    function selectTavolo() {
      if (btnTavolo) btnTavolo.classList.add('active');
      if (btnAsporto) btnAsporto.classList.remove('active');
      if (tabAsporto) tabAsporto.style.display = 'none';
      if (btnHeaderCart) btnHeaderCart.classList.remove('is-visible');
      if (tabTavolo) {
        tabTavolo.style.display = 'block';
        const topOffset = tabTavolo.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
      if (typeof onTabChange === 'function') onTabChange('tavolo');
    }

    if (btnAsporto) btnAsporto.onclick = (e) => { e.preventDefault(); selectAsporto(); };
    if (btnTavolo) btnTavolo.onclick = (e) => { e.preventDefault(); selectTavolo(); };
  }

  // --- 3. TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    let container = document.getElementById('amascalzon-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'amascalzon-toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
        max-width: 90vw;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isError = type === 'error';
    toast.style.cssText = `
      background: ${isError ? '#2c1214' : '#141414'};
      color: #fff;
      border: 1px solid ${isError ? '#e57373' : '#D4AF37'};
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.25s ease;
      pointer-events: auto;
    `;

    toast.innerHTML = `
      <span>${isError ? '⚠️' : '🍔'}</span>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 2400);
  }

  // --- 4. MODALE PERSONALIZZAZIONE PIATTO ---
  function updateModalPrice() {
    if (!currentModalProd) return;
    const priceNum = typeof currentModalProd.price === 'number' ? currentModalProd.price : parseFloat(currentModalProd.price);
    const totalItemPrice = (priceNum * currentModalQty).toFixed(2).replace('.', ',') + ' €';

    const qtyDisplay = document.getElementById('custom-qty-display');
    const priceBadge = document.getElementById('custom-modal-price');
    const addBtn = document.getElementById('btn-add-to-cart');

    if (qtyDisplay) qtyDisplay.textContent = currentModalQty;
    if (priceBadge) priceBadge.textContent = totalItemPrice;
    if (addBtn) addBtn.textContent = `AGGIUNGI AL CARRELLO - ${totalItemPrice}`;
  }

  function openItemModal(prod, onAddToCart) {
    currentModalProd = prod;
    currentModalQty = 1;
    modalExcludedIngredients = [];
    onAddToCartCallback = onAddToCart;

    const modal = document.getElementById('modal-customization');
    if (!modal) return;

    const titleEl = document.getElementById('custom-modal-title');
    const descEl = document.getElementById('custom-modal-desc');
    const notesEl = document.getElementById('custom-item-notes');

    if (titleEl) titleEl.textContent = prod.name;
    if (descEl) descEl.textContent = prod.description || '';
    if (notesEl) notesEl.value = '';

    const ingSec = document.getElementById('custom-ingredients-section');
    const ingList = document.getElementById('custom-ingredients-list');

    if (prod.ingredients && Array.isArray(prod.ingredients) && prod.ingredients.length > 0) {
      if (ingSec) ingSec.style.display = 'block';
      ingList.innerHTML = prod.ingredients.map(ing => `
        <label class="ing-check-item" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; color: #ccc; font-size: 0.85rem; cursor: pointer;">
          <input type="checkbox" checked data-ing="${escapeHtml(ing)}" style="accent-color: #D4AF37; width: 16px; height: 16px;">
          <span>${escapeHtml(ing)}</span>
        </label>
      `).join('');

      ingList.querySelectorAll('input').forEach(chk => {
        chk.onchange = function () {
          const ing = this.getAttribute('data-ing');
          if (!this.checked) {
            if (!modalExcludedIngredients.includes(ing)) modalExcludedIngredients.push(ing);
          } else {
            modalExcludedIngredients = modalExcludedIngredients.filter(x => x !== ing);
          }
        };
      });
    } else {
      if (ingSec) ingSec.style.display = 'none';
      if (ingList) ingList.innerHTML = '';
    }

    updateModalPrice();
    modal.classList.add('is-open');
    modal.style.display = 'flex';
  }

  function closeItemModal() {
    const modal = document.getElementById('modal-customization');
    if (modal) {
      modal.classList.remove('is-open');
      modal.style.display = 'none';
    }
  }

  function setupModalEvents() {
    const modal = document.getElementById('modal-customization');
    const btnPlus = document.getElementById('btn-custom-qty-plus');
    const btnMinus = document.getElementById('btn-custom-qty-minus');
    const btnCloseModal = document.getElementById('btn-close-custom-modal');
    const btnAddToCart = document.getElementById('btn-add-to-cart');

    if (btnPlus) {
      btnPlus.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        currentModalQty += 1;
        updateModalPrice();
      };
    }

    if (btnMinus) {
      btnMinus.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (currentModalQty > 1) {
          currentModalQty -= 1;
          updateModalPrice();
        }
      };
    }

    if (btnCloseModal) {
      btnCloseModal.onclick = function (e) {
        e.preventDefault();
        closeItemModal();
      };
    }

    if (modal) {
      modal.onclick = function (e) {
        if (e.target === modal) {
          closeItemModal();
        }
      };
    }

    if (btnAddToCart) {
      btnAddToCart.onclick = function (e) {
        e.preventDefault();
        if (!currentModalProd) return;

        const priceNum = typeof currentModalProd.price === 'number' ? currentModalProd.price : parseFloat(currentModalProd.price);
        const notesVal = document.getElementById('custom-item-notes')?.value.trim() || '';

        const itemPayload = {
          id: currentModalProd.id,
          name: currentModalProd.name,
          price: priceNum,
          qty: currentModalQty,
          excluded: [...modalExcludedIngredients],
          notes: notesVal
        };

        if (typeof onAddToCartCallback === 'function') {
          onAddToCartCallback(itemPayload);
        }

        closeItemModal();
        showToast(`${currentModalProd.name} aggiunto al carrello!`);
      };
    }
  }

  // --- 5. DRAWER CARRELLO ---
  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer-modal');
    if (drawer) {
      drawer.classList.add('is-open');
      drawer.style.display = 'flex';
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer-modal');
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.style.display = 'none';
    }
  }

  function renderCartDrawer(cartItems, totalFormatted, onQtyChange, onRemove) {
    const list = document.getElementById('cart-items-list');
    const checkSec = document.getElementById('cart-checkout-section');
    const totalEl = document.getElementById('cart-drawer-total');

    onCartQtyChangeCallback = onQtyChange;
    onCartRemoveCallback = onRemove;

    if (!list) return;

    if (!cartItems || cartItems.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: #777;">
          <p style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 0.4rem;">Il tuo carrello è vuoto</p>
          <p style="font-size: 0.85rem; margin: 0;">Aggiungi i piatti dal menù per completare il tuo ordine da asporto.</p>
        </div>
      `;
      if (checkSec) checkSec.style.display = 'none';
      if (totalEl) totalEl.textContent = '0,00 €';
      return;
    }

    if (checkSec) checkSec.style.display = 'block';
    if (totalEl) totalEl.textContent = totalFormatted;

    list.innerHTML = cartItems.map((item, idx) => {
      const itemSubtotal = (Number(item.price) * Number(item.qty)).toFixed(2).replace('.', ',') + ' €';
      return `
        <div class="cart-item-card" style="background: #161616; border: 1px solid #282828; border-radius: 8px; padding: 0.9rem; margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
            <div>
              <h4 style="color: #FFFFFF; font-size: 0.95rem; font-weight: 800; margin: 0 0 0.2rem 0; text-transform: uppercase;">${escapeHtml(item.name)}</h4>
              <div style="color: #D4AF37; font-weight: 700; font-size: 0.85rem;">${itemSubtotal}</div>
            </div>
            <button type="button" class="btn-cart-delete" data-id="${item.cartItemId || idx}" style="background: transparent; border: none; color: #e57373; font-size: 0.75rem; cursor: pointer; padding: 0.2rem 0.4rem; font-weight: 700;">
              ✕ Rimuovi
            </button>
          </div>

          ${item.excluded && item.excluded.length > 0 ? `
            <div style="color: #e57373; font-size: 0.75rem; margin-top: 0.35rem; line-height: 1.3;">
              <strong>Senza:</strong> ${escapeHtml(item.excluded.join(', '))}
            </div>
          ` : ''}

          ${item.notes && item.notes.trim() !== '' ? `
            <div style="color: #888888; font-size: 0.75rem; margin-top: 0.25rem; font-style: italic;">
              <strong>Nota:</strong> ${escapeHtml(item.notes)}
            </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px solid #222222;">
            <span style="font-size: 0.75rem; color: #888;">Quantità:</span>
            <div style="display: flex; align-items: center; border: 1px solid #333; border-radius: 4px; overflow: hidden;">
              <button type="button" class="btn-cart-qty-minus" data-id="${item.cartItemId || idx}" style="background: #222; border: none; color: #fff; width: 28px; height: 28px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
              <span style="min-width: 32px; text-align: center; color: #D4AF37; font-weight: 800; font-size: 0.85rem;">${item.qty}</span>
              <button type="button" class="btn-cart-qty-plus" data-id="${item.cartItemId || idx}" style="background: #222; border: none; color: #fff; width: 28px; height: 28px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.btn-cart-qty-plus').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        const itemId = this.getAttribute('data-id');
        if (typeof onCartQtyChangeCallback === 'function') onCartQtyChangeCallback(itemId, 1);
      };
    });

    list.querySelectorAll('.btn-cart-qty-minus').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        const itemId = this.getAttribute('data-id');
        if (typeof onCartQtyChangeCallback === 'function') onCartQtyChangeCallback(itemId, -1);
      };
    });

    list.querySelectorAll('.btn-cart-delete').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        const itemId = this.getAttribute('data-id');
        if (typeof onCartRemoveCallback === 'function') onCartRemoveCallback(itemId);
      };
    });
  }

  function setupDrawerEvents() {
    const drawer = document.getElementById('cart-drawer-modal');
    const btnOpenCart = document.getElementById('btn-open-cart');
    const btnHeaderCart = document.getElementById('btn-header-cart');
    const btnCloseDrawer = document.getElementById('btn-close-cart-drawer');

    if (btnOpenCart) {
      btnOpenCart.onclick = function (e) {
        e.preventDefault();
        openCartDrawer();
      };
    }

    if (btnHeaderCart) {
      btnHeaderCart.onclick = function (e) {
        e.preventDefault();
        openCartDrawer();
      };
    }

    if (btnCloseDrawer) {
      btnCloseDrawer.onclick = function (e) {
        e.preventDefault();
        closeCartDrawer();
      };
    }

    if (drawer) {
      drawer.onclick = function (e) {
        if (e.target === drawer) {
          closeCartDrawer();
        }
      };
    }
  }

  // --- 6. AGGIORNAMENTO BARRA E BADGE CARRELLO ---
  function updateCartCounters(count, totalFormatted) {
    const floatBar = document.getElementById('asporto-floating-cart-bar');
    const countEl = document.getElementById('float-cart-count');
    const totEl = document.getElementById('float-cart-total');
    const headerBadge = document.getElementById('header-cart-badge');

    if (headerBadge) {
      headerBadge.textContent = count;
      headerBadge.classList.toggle('has-items', count > 0);
    }

    if (floatBar) {
      floatBar.classList.toggle('is-visible', count > 0);
      floatBar.style.display = count > 0 ? 'flex' : 'none';
    }

    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'ARTICOLO' : 'ARTICOLI'}`;
    if (totEl) totEl.textContent = `TOTALE: ${totalFormatted}`;
  }

  // --- 7. RENDERING CATALOGO MENU ---
  function renderCatalog(menuItems, onProductSelect) {
    const catalog = document.getElementById('asporto-menu-catalog');
    const nav = document.getElementById('asporto-categories-nav');

    if (!catalog || !menuItems || menuItems.length === 0) return;

    const categories = Array.from(new Set(menuItems.map(i => i.category || 'MENU')));

    if (nav) {
      nav.innerHTML = categories.map((c, i) => `
        <button type="button" class="cat-pill ${i === 0 ? 'active' : ''}" data-idx="${i}">${escapeHtml(c)}</button>
      `).join('');

      nav.querySelectorAll('.cat-pill').forEach(btn => {
        btn.onclick = function () {
          nav.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const idx = this.getAttribute('data-idx');
          const sec = document.getElementById('menu-cat-sec-' + idx);
          if (sec) {
            const y = sec.getBoundingClientRect().top + window.pageYOffset - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        };
      });
    }

    catalog.innerHTML = categories.map((cat, idx) => {
      const items = menuItems.filter(x => (x.category || 'MENU') === cat);
      return `
        <div class="cat-section" id="menu-cat-sec-${idx}" style="margin-bottom: 2.5rem;">
          <h3 class="cat-section-title">${escapeHtml(cat)}</h3>
          <div class="product-cards-grid">
            ${items.map(item => {
              const isSpina = item.dineInOnly || (item.category && item.category.toLowerCase().includes('spina'));
              const priceFmt = Number(item.price).toFixed(2).replace('.', ',') + ' €';
              return `
                <div class="prod-card" data-id="${item.id}">
                  <div class="prod-card-info">
                    <div>
                      <h4 class="prod-title">${escapeHtml(item.name)}</h4>
                      <div class="prod-price">${priceFmt}</div>
                      <p class="prod-desc">${escapeHtml(item.description || '')}</p>
                    </div>
                    ${isSpina
                      ? `<span class="btn-solo-tavolo">SOLO SERVIZIO AL TAVOLO</span>`
                      : `<button type="button" class="btn-add-open btn-add-item" data-id="${item.id}">+ AGGIUNGI</button>`
                    }
                  </div>
                  ${item.image ? `
                    <div class="prod-card-img">
                      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.parentElement.style.display='none';">
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    catalog.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.onclick = function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        const prod = menuItems.find(x => String(x.id) === String(id));
        if (prod && typeof onProductSelect === 'function') {
          onProductSelect(prod);
        }
      };
    });

    catalog.querySelectorAll('.prod-card').forEach(card => {
      card.onclick = function () {
        const id = this.getAttribute('data-id');
        const prod = menuItems.find(x => String(x.id) === String(id));
        if (prod && !prod.dineInOnly && typeof onProductSelect === 'function') {
          onProductSelect(prod);
        }
      };
    });
  }

  // --- 8. LEAD FORM CANDIDATURA FRANCHISING ---
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
            formFeedback.textContent = 'Si è verificato un problema con l\'invio. Puoi contattarci direttamente a: mascoloalfy@libero.it';
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

  // --- 9. PULSANTE TORNA SU FLOTTANTE ---
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
    });
  }

  window.UI = {
    escapeHtml,
    showSection,
    updateHeaderCartVisibility,
    setupNavigation,
    setupTabs,
    showToast,
    openItemModal,
    closeItemModal,
    setupModalEvents,
    openCartDrawer,
    closeCartDrawer,
    renderCartDrawer,
    setupDrawerEvents,
    updateCartCounters,
    renderCatalog,
    setupLeadForm,
    setupScrollTop
  };
})();
