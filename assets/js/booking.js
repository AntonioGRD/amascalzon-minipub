/**
 * AMASCALZON PUB - Modulo Booking & Asporto WhatsApp
 * 100% Locale e Statico da window.MENU_DATA / window.AMASCALZON_MENU
 */
(function () {
  'use strict';

  const WHATSAPP_PHONE = '393293272738';
  let cart = [];
  let currentProd = null;
  let currentQty = 1;
  let excludedIngredients = [];

  function initBookingModule() {
    setupTabs();
    setupModalsAndDrawer();
    setupTavoloForm();
    setupAsportoCheckout();
    renderCatalog();
  }

  function getMenu() {
    if (window.MENU_DATA && Array.isArray(window.MENU_DATA) && window.MENU_DATA.length > 0) {
      return window.MENU_DATA;
    }
    if (window.AMASCALZON_MENU && Array.isArray(window.AMASCALZON_MENU)) {
      const flat = [];
      window.AMASCALZON_MENU.forEach(cat => {
        if (Array.isArray(cat.items)) {
          cat.items.forEach(it => {
            const numPrice = parseFloat(String(it.price || '0').replace('€', '').replace(',', '.').trim()) || 0;
            const isSpina = (cat.category && cat.category.toLowerCase().includes('spina')) || false;
            flat.push({
              id: it.id,
              category: cat.category,
              name: it.title || it.name,
              description: it.desc || it.description || '',
              price: numPrice,
              image: it.img || it.image || '',
              ingredients: it.ingredients || [],
              dineInOnly: isSpina
            });
          });
        }
      });
      return flat;
    }
    return [];
  }

  function updateHeaderCartVisibility() {
    const isPrenotazioni = window.location.hash.includes('view-prenotazioni');
    const tabAsporto = document.getElementById('tab-booking-asporto');
    const isAsportoVisible = isPrenotazioni && tabAsporto && (tabAsporto.style.display === 'block' || (getComputedStyle(tabAsporto).display !== 'none' && tabAsporto.style.display !== 'none'));
    const btnHeaderCart = document.getElementById('btn-header-cart');
    if (btnHeaderCart) {
      if (isAsportoVisible) {
        btnHeaderCart.classList.add('is-visible');
      } else {
        btnHeaderCart.classList.remove('is-visible');
      }
    }
  }

  function setupTabs() {
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
        renderCatalog();
        const topOffset = tabAsporto.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
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
    }

    if (btnAsporto) btnAsporto.onclick = (e) => { e.preventDefault(); selectAsporto(); };
    if (btnTavolo) btnTavolo.onclick = (e) => { e.preventDefault(); selectTavolo(); };
  }

  function renderCatalog(categoryToOpen) {
    const catalog = document.getElementById('asporto-menu-catalog');
    const nav = document.getElementById('asporto-categories-nav');
    const menu = getMenu();

    if (!catalog || menu.length === 0) return;

    if (nav) {
      nav.style.display = 'none';
    }

    const categories = Array.from(new Set(menu.map(i => i.category || 'MENU')));
    const defaultOpenCat = (categoryToOpen && categories.includes(categoryToOpen)) ? categoryToOpen : null;

    let html = `
      <div class="menu-heading-block">
        <h3 class="menu-white-title">MENÙ</h3>
      </div>
      <div class="menu-top-strip">
        <span>COPERTO 2,00 € &bull; SERVIZIO AL TAVOLO & ASPORTO WHATSAPP</span>
      </div>
      <div class="menu-accordion-wrapper">
    `;

    categories.forEach((cat) => {
      const items = menu.filter(x => (x.category || 'MENU') === cat);
      const isOpen = Boolean(defaultOpenCat && cat === defaultOpenCat);
      const countLabel = items.length;

      html += `
        <div class="menu-accordion-item ${isOpen ? 'is-open' : ''}" data-cat-name="${escapeHtml(cat)}">
          <button type="button" class="menu-acc-header" aria-expanded="${isOpen ? 'true' : 'false'}">
            <div class="acc-title-left">
              <span class="acc-bullet-dot"></span>
              <span class="acc-title-text">${escapeHtml(cat)}</span>
            </div>
            <div class="acc-title-right">
              <span class="acc-count-pill">${countLabel}</span>
              <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </button>
          
          <div class="menu-acc-collapse" style="${isOpen ? 'display: block;' : 'display: none;'}">
            <div class="menu-acc-body">
              ${items.map(item => {
                const isSpina = item.dineInOnly || (item.category && item.category.toLowerCase().includes('spina'));
                const priceFmt = item.price > 0 ? Number(item.price).toFixed(2).replace('.', ',') + ' €' : '';
                const hasIngredients = item.ingredients && Array.isArray(item.ingredients) && item.ingredients.length > 0;

                return `
                  <div class="menu-dish-card" data-id="${item.id}">
                    <div class="dish-card-main">
                      ${item.image ? `
                        <div class="dish-img-box">
                          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.parentElement.style.display='none';">
                          <div class="dish-img-zoom" title="Visualizza Prodotto">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              <line x1="11" y1="8" x2="11" y2="14"></line>
                              <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                          </div>
                        </div>
                      ` : ''}
                      <div class="dish-content-box">
                        <h4 class="dish-title">${escapeHtml(item.name)}</h4>
                        ${item.description ? `<p class="dish-desc">${escapeHtml(item.description)}</p>` : ''}
                      </div>
                    </div>

                    ${hasIngredients ? `
                      <div class="dish-allergens-section">
                        <div class="dish-allergens-label">&mdash; INGREDIENTI / ALLERGENI &mdash;</div>
                        <div class="dish-allergens-list">
                          ${item.ingredients.map(ing => `<span class="allergen-tag">&bull; ${escapeHtml(ing)}</span>`).join(' ')}
                        </div>
                      </div>
                    ` : ''}

                    <div class="dish-card-footer">
                      ${isSpina
                        ? `<span class="btn-solo-tavolo">SOLO SERVIZIO AL TAVOLO</span>`
                        : `<button type="button" class="btn-aggiungi btn-add-item" data-id="${item.id}">AGGIUNGI +</button>`
                      }
                      ${priceFmt ? `<span class="dish-price-tag">${priceFmt}</span>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    catalog.innerHTML = html;

    // Gestione click accordion
    catalog.querySelectorAll('.menu-acc-header').forEach(header => {
      header.onclick = function (e) {
        e.preventDefault();
        const item = this.closest('.menu-accordion-item');
        if (!item) return;

        const isOpen = item.classList.contains('is-open');
        const collapse = item.querySelector('.menu-acc-collapse');

        if (isOpen) {
          item.classList.remove('is-open');
          this.setAttribute('aria-expanded', 'false');
          if (collapse) collapse.style.display = 'none';
        } else {
          catalog.querySelectorAll('.menu-accordion-item').forEach(other => {
            if (other !== item) {
              other.classList.remove('is-open');
              const otherHeader = other.querySelector('.menu-acc-header');
              if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
              const otherCol = other.querySelector('.menu-acc-collapse');
              if (otherCol) otherCol.style.display = 'none';
            }
          });

          item.classList.add('is-open');
          this.setAttribute('aria-expanded', 'true');
          if (collapse) collapse.style.display = 'block';

          setTimeout(() => {
            const y = item.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 100);
        }
      };
    });

    // Click Aggiungi
    catalog.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.onclick = function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        const prod = menu.find(x => String(x.id) === String(id));
        if (prod) openItemModal(prod);
      };
    });

    // Click Card
    catalog.querySelectorAll('.menu-dish-card').forEach(card => {
      card.onclick = function (e) {
        if (e.target.closest('.btn-add-item')) return;
        const id = this.getAttribute('data-id');
        const prod = menu.find(x => String(x.id) === String(id));
        if (prod && !prod.dineInOnly) openItemModal(prod);
      };
    });
  }

  // 1. Funzione aggiornamento visuale prezzo e quantità
  function updateModalPrice() {
    if (!currentProd) return;
    const priceNum = typeof currentProd.price === 'number' ? currentProd.price : parseFloat(currentProd.price);
    const totalItemPrice = (priceNum * currentQty).toFixed(2).replace('.', ',') + ' €';

    const qtyDisplay = document.getElementById('custom-qty-display');
    const priceBadge = document.getElementById('custom-modal-price');
    const addBtn = document.getElementById('btn-add-to-cart');

    if (qtyDisplay) qtyDisplay.textContent = currentQty;
    if (priceBadge) priceBadge.textContent = totalItemPrice;
    if (addBtn) addBtn.textContent = `AGGIUNGI AL CARRELLO - ${totalItemPrice}`;
  }

  // 2. Apertura Modale Personalizzazione con Reset Quantità a 1
  function openItemModal(prod) {
    currentProd = prod;
    currentQty = 1;
    excludedIngredients = [];

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
            if (!excludedIngredients.includes(ing)) excludedIngredients.push(ing);
          } else {
            excludedIngredients = excludedIngredients.filter(x => x !== ing);
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

  // 3. Setup Modali e Drawer con onclick idempotenti
  function setupModalsAndDrawer() {
    const modal = document.getElementById('modal-customization');
    const drawer = document.getElementById('cart-drawer-modal');

    const btnPlus = document.getElementById('btn-custom-qty-plus');
    if (btnPlus) {
      btnPlus.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        currentQty += 1;
        updateModalPrice();
      };
    }

    const btnMinus = document.getElementById('btn-custom-qty-minus');
    if (btnMinus) {
      btnMinus.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (currentQty > 1) {
          currentQty -= 1;
          updateModalPrice();
        }
      };
    }

    const btnCloseModal = document.getElementById('btn-close-custom-modal');
    if (btnCloseModal) {
      btnCloseModal.onclick = function (e) {
        e.preventDefault();
        if (modal) {
          modal.classList.remove('is-open');
          modal.style.display = 'none';
        }
      };
    }

    if (modal) {
      modal.onclick = function (e) {
        if (e.target === modal) {
          modal.classList.remove('is-open');
          modal.style.display = 'none';
        }
      };
    }

    const btnAddToCart = document.getElementById('btn-add-to-cart');
    if (btnAddToCart) {
      btnAddToCart.onclick = function (e) {
        e.preventDefault();
        if (!currentProd) return;

        const priceNum = typeof currentProd.price === 'number' ? currentProd.price : parseFloat(currentProd.price);
        const notesVal = document.getElementById('custom-item-notes')?.value.trim() || '';

        cart.push({
          cartItemId: Date.now() + '_' + Math.random(),
          id: currentProd.id,
          name: currentProd.name,
          price: priceNum,
          qty: currentQty,
          excluded: [...excludedIngredients],
          notes: notesVal
        });

        if (modal) {
          modal.classList.remove('is-open');
          modal.style.display = 'none';
        }
        updateCartUI();
      };
    }

    const floatBarBtn = document.getElementById('asporto-floating-cart-bar');
    if (floatBarBtn) {
      floatBarBtn.onclick = function (e) {
        e.preventDefault();
        openCartDrawer();
      };
    }

    const btnOpenCart = document.getElementById('btn-open-cart');
    if (btnOpenCart) {
      btnOpenCart.onclick = function (e) {
        e.preventDefault();
        openCartDrawer();
      };
    }

    const btnHeaderCart = document.getElementById('btn-header-cart');
    if (btnHeaderCart) {
      btnHeaderCart.onclick = function (e) {
        e.preventDefault();
        openCartDrawer();
      };
    }

    const btnCloseDrawer = document.getElementById('btn-close-cart-drawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.onclick = function (e) {
        e.preventDefault();
        if (drawer) {
          drawer.classList.remove('is-open');
          drawer.style.display = 'none';
        }
      };
    }

    if (drawer) {
      drawer.onclick = function (e) {
        if (e.target === drawer) {
          drawer.classList.remove('is-open');
          drawer.style.display = 'none';
        }
      };
    }
  }

  function updateCartUI() {
    const floatBar = document.getElementById('asporto-floating-cart-bar');
    const badgeEl = document.getElementById('float-cart-badge');
    const countEl = document.getElementById('float-cart-count');
    const totEl = document.getElementById('float-cart-total');
    const headerBadge = document.getElementById('header-cart-badge');

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2).replace('.', ',') + ' €';

    if (headerBadge) {
      headerBadge.textContent = totalQty;
      headerBadge.classList.toggle('has-items', totalQty > 0);
    }

    if (badgeEl) {
      badgeEl.textContent = totalQty;
      badgeEl.classList.toggle('has-items', totalQty > 0);
    }

    if (floatBar) {
      floatBar.classList.toggle('is-visible', totalQty > 0);
      floatBar.style.display = totalQty > 0 ? 'flex' : 'none';
    }
    if (countEl) countEl.textContent = `${totalQty} ${totalQty === 1 ? 'PIATTO' : 'PIATTI'}`;
    if (totEl) totEl.textContent = totalPrice;
  }

  // Gestione Drawer Carrello con Modifica Quantità (+ / -) ed Eliminazione
  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer-modal');
    const list = document.getElementById('cart-items-list');
    const checkSec = document.getElementById('cart-checkout-section');
    const totalEl = document.getElementById('cart-drawer-total');

    if (!drawer) return;

    if (cart.length === 0) {
      if (list) {
        list.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; color: #777;">
            <p style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 0.4rem;">Il tuo carrello è vuoto</p>
            <p style="font-size: 0.85rem; margin: 0;">Aggiungi i piatti dal menù per completare il tuo ordine da asporto.</p>
          </div>
        `;
      }
      if (checkSec) checkSec.style.display = 'none';
    } else {
      if (checkSec) checkSec.style.display = 'block';
      const totPrice = cart.reduce((s, i) => s + (i.price * i.qty), 0);
      const totFormatted = totPrice.toFixed(2).replace('.', ',') + ' €';
      if (totalEl) totalEl.textContent = totFormatted;

      if (list) {
        list.innerHTML = cart.map((item, idx) => {
          const itemSubtotal = (item.price * item.qty).toFixed(2).replace('.', ',') + ' €';
          return `
            <div class="cart-item-card" style="background: #161616; border: 1px solid #282828; border-radius: 8px; padding: 0.9rem; margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <div>
                  <h4 style="color: #FFFFFF; font-size: 0.95rem; font-weight: 800; margin: 0 0 0.2rem 0; text-transform: uppercase;">${escapeHtml(item.name)}</h4>
                  <div style="color: #D4AF37; font-weight: 700; font-size: 0.85rem;">${itemSubtotal}</div>
                </div>
                <button type="button" class="btn-cart-delete" data-idx="${idx}" style="background: transparent; border: none; color: #e57373; font-size: 0.75rem; cursor: pointer; padding: 0.2rem 0.4rem; font-weight: 700;">
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
                  <button type="button" class="btn-cart-qty-minus" data-idx="${idx}" style="background: #222; border: none; color: #fff; width: 28px; height: 28px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                  <span style="min-width: 32px; text-align: center; color: #D4AF37; font-weight: 800; font-size: 0.85rem;">${item.qty}</span>
                  <button type="button" class="btn-cart-qty-plus" data-idx="${idx}" style="background: #222; border: none; color: #fff; width: 28px; height: 28px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Listener Aumento Quantità (+)
        list.querySelectorAll('.btn-cart-qty-plus').forEach(btn => {
          btn.onclick = function (e) {
            e.preventDefault();
            const idx = parseInt(this.getAttribute('data-idx'));
            if (cart[idx]) {
              cart[idx].qty += 1;
              updateCartUI();
              openCartDrawer();
            }
          };
        });

        // Listener Diminuzione Quantità (-)
        list.querySelectorAll('.btn-cart-qty-minus').forEach(btn => {
          btn.onclick = function (e) {
            e.preventDefault();
            const idx = parseInt(this.getAttribute('data-idx'));
            if (cart[idx]) {
              if (cart[idx].qty > 1) {
                cart[idx].qty -= 1;
              } else {
                cart.splice(idx, 1);
              }
              updateCartUI();
              openCartDrawer();
            }
          };
        });

        // Listener Eliminazione Singola (Rimuovi)
        list.querySelectorAll('.btn-cart-delete').forEach(btn => {
          btn.onclick = function (e) {
            e.preventDefault();
            const idx = parseInt(this.getAttribute('data-idx'));
            if (cart[idx] !== undefined) {
              cart.splice(idx, 1);
              updateCartUI();
              openCartDrawer();
            }
          };
        });
      }
    }

    drawer.classList.add('is-open');
    drawer.style.display = 'flex';
  }

  function setupTavoloForm() {
    const form = document.getElementById('form-prenotazione-tavolo');
    if (!form) return;

    form.onsubmit = function (e) {
      e.preventDefault();
      const nome = document.getElementById('tavolo-nome').value;
      const tel = document.getElementById('tavolo-telefono').value;
      const data = document.getElementById('tavolo-data').value;
      const ora = document.getElementById('tavolo-ora').value;
      const cop = document.getElementById('tavolo-coperti').value;
      const note = document.getElementById('tavolo-note').value;

      let msg = `*PRENOTAZIONE TAVOLO - AMASCALZON PUB*\n`;
      msg += `--------------------------------------\n`;
      msg += `*Nome:* ${nome}\n`;
      msg += `*Telefono:* ${tel}\n`;
      msg += `*Data:* ${data}\n`;
      msg += `*Orario:* ${ora}\n`;
      msg += `*Persone:* ${cop}\n`;
      if (note) msg += `*Note:* ${note}\n`;
      msg += `--------------------------------------\n`;
      msg += `Inviata dal sito ufficiale AMASCALZON`;

      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    };
  }

  function setupAsportoCheckout() {
    const form = document.getElementById('form-checkout-asporto');
    if (!form) return;

    form.onsubmit = function (e) {
      e.preventDefault();
      if (cart.length === 0) return;

      const nome = document.getElementById('asporto-nome')?.value.trim() || '';
      const tel = document.getElementById('asporto-telefono')?.value.trim() || '';
      const ora = document.getElementById('asporto-orario')?.value || '';
      const note = document.getElementById('asporto-note')?.value.trim() || '';

      // 1. Raggruppamento piatti identici (stesso ID, stesse esclusioni, stesse note)
      const groupedMap = new Map();

      cart.forEach(item => {
        const excludedKey = (item.excluded || []).slice().sort().join('|');
        const notesKey = (item.notes || '').trim().toLowerCase();
        const groupKey = `${item.id}__${excludedKey}__${notesKey}`;

        if (groupedMap.has(groupKey)) {
          const existing = groupedMap.get(groupKey);
          existing.qty += item.qty;
        } else {
          groupedMap.set(groupKey, {
            name: item.name,
            price: Number(item.price),
            qty: item.qty,
            excluded: item.excluded || [],
            notes: item.notes || ''
          });
        }
      });

      const consolidatedItems = Array.from(groupedMap.values());
      const totalOrder = consolidatedItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
      const totalFormatted = totalOrder.toFixed(2).replace('.', ',') + ' €';

      // 2. Costruzione lista piatti formattata
      const itemsLines = consolidatedItems.map((item, idx) => {
        const subtotal = (item.price * item.qty).toFixed(2).replace('.', ',') + ' €';
        let line = `${idx + 1}. *${item.name.toUpperCase()}* ➔ *${item.qty}x* (${subtotal})`;
        
        if (item.excluded && item.excluded.length > 0) {
          line += `\n   ❌ _Senza: ${item.excluded.join(', ')}_`;
        }
        if (item.notes && item.notes.trim() !== '') {
          line += `\n   📝 _Nota: ${item.notes.trim()}_`;
        }
        return line;
      }).join('\n\n');

      // 3. Template finale WhatsApp con emoji
      let msg = `🍔 *NUOVO ORDINE ASPORTO - AMASCALZON PUB*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `👤 *Cliente:* ${nome}\n`;
      msg += `📞 *Telefono:* ${tel}\n`;
      msg += `🕒 *Orario Ritiro:* ${ora}\n`;
      msg += `📍 *Sede Ritiro:* Via Stabia 210, Sant'Antonio Abate (NA)\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📋 *DETTAGLIO ORDINE:*\n\n`;
      msg += `${itemsLines}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      if (note) {
        msg += `💬 *NOTE GENERALI:*\n_${note}_\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      }
      msg += `💰 *TOTALE DA PAGARE AL RITIRO:* *${totalFormatted}*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `_Inviato dal sito ufficiale AMASCALZON_`;

      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMsg}`, '_blank');

      const drawer = document.getElementById('cart-drawer-modal');
      if (drawer) {
        drawer.classList.remove('is-open');
        drawer.style.display = 'none';
      }
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.initBookingModule = initBookingModule;
  window.updateHeaderCartVisibility = updateHeaderCartVisibility;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookingModule);
  } else {
    initBookingModule();
  }
})();
