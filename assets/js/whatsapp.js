/**
 * AMASCALZON PUB - WhatsApp Module (whatsapp.js)
 * Generazione di stringhe formattate, calcolo template e apertura link wa.me
 */
(function () {
  'use strict';

  const PHONE_NUMBER = '393293272738';

  function createWhatsAppUrl(messageText) {
    const encoded = encodeURIComponent(messageText);
    return `https://wa.me/${PHONE_NUMBER}?text=${encoded}`;
  }

  function openWhatsApp(messageText) {
    const url = createWhatsAppUrl(messageText);
    window.open(url, '_blank');
  }

  /**
   * Genera il messaggio di prenotazione tavolo
   * @param {Object} data { nome, tel, data, ora, coperti, note }
   */
  function buildTableBookingMessage(data) {
    const nome = (data.nome || '').trim();
    const tel = (data.tel || '').trim();
    const dataPrenotazione = (data.data || '').trim();
    const ora = (data.ora || '').trim();
    const coperti = (data.coperti || '').trim();
    const note = (data.note || '').trim();

    let msg = `*PRENOTAZIONE TAVOLO - AMASCALZON PUB*\n`;
    msg += `--------------------------------------\n`;
    msg += `*Nome:* ${nome}\n`;
    msg += `*Telefono:* ${tel}\n`;
    msg += `*Data:* ${dataPrenotazione}\n`;
    msg += `*Orario:* ${ora}\n`;
    msg += `*Persone:* ${coperti}\n`;
    if (note) {
      msg += `*Note:* ${note}\n`;
    }
    msg += `--------------------------------------\n`;
    msg += `Inviata dal sito ufficiale AMASCALZON`;

    return msg;
  }

  /**
   * Genera il messaggio di ordine asporto
   * @param {Object} data { nome, tel, ora, note, items, totalFormatted }
   */
  function buildAsportoOrderMessage(data) {
    const nome = (data.nome || '').trim();
    const tel = (data.tel || '').trim();
    const ora = (data.ora || '').trim();
    const note = (data.note || '').trim();
    const items = Array.isArray(data.items) ? data.items : [];
    const totalFormatted = data.totalFormatted || '0,00 €';

    const itemsLines = items.map((item, idx) => {
      const subtotal = ((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2).replace('.', ',') + ' €';
      let line = `${idx + 1}. *${String(item.name || '').toUpperCase()}* ➔ *${item.qty}x* (${subtotal})`;

      if (item.excluded && Array.isArray(item.excluded) && item.excluded.length > 0) {
        line += `\n   ❌ _Senza: ${item.excluded.join(', ')}_`;
      }
      if (item.notes && item.notes.trim() !== '') {
        line += `\n   📝 _Nota: ${item.notes.trim()}_`;
      }
      return line;
    }).join('\n\n');

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

    return msg;
  }

  function sendTableBooking(data) {
    const msg = buildTableBookingMessage(data);
    openWhatsApp(msg);
  }

  function sendAsportoOrder(data) {
    const msg = buildAsportoOrderMessage(data);
    openWhatsApp(msg);
  }

  window.WhatsAppService = {
    PHONE_NUMBER,
    createWhatsAppUrl,
    openWhatsApp,
    buildTableBookingMessage,
    buildAsportoOrderMessage,
    sendTableBooking,
    sendAsportoOrder
  };
})();
