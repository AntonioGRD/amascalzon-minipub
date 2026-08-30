/**
 * AMASCALZON PUB - Cart Module (cart.js)
 * Gestione dello stato del carrello, logica di aggiunta/rimozione e calcolo subtotali.
 */
(function () {
  'use strict';

  let items = [];
  const listeners = [];

  function notify() {
    listeners.forEach(fn => {
      try {
        fn(getState());
      } catch (err) {
        console.error('Errore nel listener del carrello:', err);
      }
    });
  }

  function getState() {
    return {
      items: [...items],
      totals: getTotals(),
      grouped: getGroupedItems()
    };
  }

  function getItems() {
    return [...items];
  }

  function getTotals() {
    const count = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const totalRaw = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
    const totalFormatted = totalRaw.toFixed(2).replace('.', ',') + ' €';
    return { count, totalRaw, totalFormatted };
  }

  function addItem(product) {
    if (!product || !product.id) return;

    const qty = Math.max(1, parseInt(product.qty, 10) || 1);
    const price = typeof product.price === 'number' ? product.price : (parseFloat(product.price) || 0);
    const excluded = Array.isArray(product.excluded) ? [...product.excluded] : [];
    const notes = (product.notes || '').trim();

    const newItem = {
      cartItemId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      id: product.id,
      name: product.name || 'Prodotto',
      price: price,
      qty: qty,
      excluded: excluded,
      notes: notes
    };

    items.push(newItem);
    notify();
    return newItem;
  }

  function removeItem(cartItemId) {
    const initialLen = items.length;
    items = items.filter(item => item.cartItemId !== cartItemId);
    if (items.length !== initialLen) {
      notify();
    }
  }

  function removeByIndex(index) {
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      notify();
    }
  }

  function changeQty(cartItemId, delta) {
    const item = items.find(it => it.cartItemId === cartItemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      items = items.filter(it => it.cartItemId !== cartItemId);
    }
    notify();
  }

  function changeQtyByIndex(index, delta) {
    if (index >= 0 && index < items.length) {
      items[index].qty += delta;
      if (items[index].qty <= 0) {
        items.splice(index, 1);
      }
      notify();
    }
  }

  function clearCart() {
    items = [];
    notify();
  }

  function getGroupedItems() {
    const groupedMap = new Map();

    items.forEach(item => {
      const excludedKey = (item.excluded || []).slice().sort().join('|');
      const notesKey = (item.notes || '').trim().toLowerCase();
      const groupKey = `${item.id}__${excludedKey}__${notesKey}`;

      if (groupedMap.has(groupKey)) {
        const existing = groupedMap.get(groupKey);
        existing.qty += item.qty;
      } else {
        groupedMap.set(groupKey, {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          excluded: [...(item.excluded || [])],
          notes: item.notes || ''
        });
      }
    });

    return Array.from(groupedMap.values());
  }

  function subscribe(listener) {
    if (typeof listener === 'function') {
      listeners.push(listener);
      // Esegui subito per allineare lo stato iniziale
      listener(getState());
    }
    return function unsubscribe() {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  // Esposizione globale
  window.Cart = {
    getItems,
    getState,
    getTotals,
    getGroupedItems,
    addItem,
    removeItem,
    removeByIndex,
    changeQty,
    changeQtyByIndex,
    clearCart,
    subscribe
  };
})();
