/* ==========================================================================
   consent.js — CV Ramzi Bougdar
   Cookie banner for Google Consent Mode v2 (Google Tag Manager, Google Analytics).
   - The default state (everything denied) and a stored choice are applied by the inline
     script of the <head>, before Google Tag Manager loads: this file only asks and saves.
   - The banner (#consent, markup and texts in en/ and fr/index.html) is a non-modal dialog,
     shown while no choice is stored and from the footer button [data-consent-open]. On a
     first visit, an inline script right after it opens it during parsing (first paint).
   - The choice is kept 6 months in localStorage ("consent"), then asked again.
   Exposes nothing. No dependency.
   ========================================================================== */

(function () {
  'use strict';

  /** Storage key and version of the stored choice (read by the inline script of the <head>). */
  var KEY = 'consent';
  var VERSION = 1;

  /** Lifetime of a choice: 6 months, as advised by the CNIL. */
  var MAX_AGE = 182 * 24 * 3600 * 1000;

  /** Purposes shown in the banner, each with the Consent Mode v2 signals it grants. */
  var PURPOSES = {
    analytics: ['analytics_storage'],
    ads: ['ad_storage', 'ad_user_data', 'ad_personalization']
  };

  /** Cookies set by Google Analytics, removed when consent is withdrawn. */
  var GA_COOKIE = /^(_ga|_ga_\w+|_gid|_gat\w*)$/;

  var banner = document.getElementById('consent');
  // PDF, ATS and pre-render modes are documents, not visits: no banner.
  if (!banner || typeof banner.show !== 'function' || /[?&](pdf|ats|prerender)\b/.test(window.location.search)) return;

  var choices = banner.querySelector('.consent__choices');
  var customize = banner.querySelector('[data-consent="customize"]');
  var save = banner.querySelector('[data-consent="save"]');
  var opener = null;

  window.dataLayer = window.dataLayer || [];
  // Same function as the one of the <head>, defined again in case that script is missing.
  var gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  /**
   * Reads the stored choice, or null when there is none, it is outdated or storage is off.
   * @returns {?Object} { version, date, analytics, ads }
   */
  function read() {
    try {
      var stored = JSON.parse(localStorage.getItem(KEY));
      return stored && stored.version === VERSION && Date.now() - stored.date < MAX_AGE ? stored : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Sends the choice to Google Tag Manager, stores it, and closes the banner.
   * @param {Object} choice { analytics: boolean, ads: boolean }
   */
  function apply(choice) {
    var previous = read();
    var signals = {};
    Object.keys(PURPOSES).forEach(function (purpose) {
      PURPOSES[purpose].forEach(function (signal) { signals[signal] = choice[purpose] ? 'granted' : 'denied'; });
    });
    gtag('consent', 'update', signals);
    // Custom event, for GTM triggers that must wait for the visitor's answer
    window.dataLayer.push({ event: 'consent_update', consent_analytics: choice.analytics, consent_ads: choice.ads });
    if (previous && previous.analytics && !choice.analytics) removeAnalyticsCookies();
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: VERSION, date: Date.now(), analytics: choice.analytics, ads: choice.ads }));
    } catch (e) { /* storage unavailable: the banner comes back on the next page */ }
    document.documentElement.classList.remove('consent-pending');
    close();
  }

  /** Withdrawn consent: deletes the Google Analytics cookies already set on this site. */
  function removeAnalyticsCookies() {
    var host = window.location.hostname;
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (!GA_COOKIE.test(name)) return;
      ['', '; domain=' + host, '; domain=.' + host].forEach(function (domain) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + domain;
      });
    });
  }

  /**
   * Shows or hides the per-purpose choices, ticked with the stored choice.
   * @param {boolean} visible
   */
  function showChoices(visible) {
    var stored = read() || {};
    Object.keys(PURPOSES).forEach(function (purpose) {
      var box = choices.elements[purpose];
      if (box) box.checked = !!stored[purpose];
    });
    choices.hidden = !visible;
    save.hidden = !visible;
    customize.hidden = visible;
    customize.setAttribute('aria-expanded', String(visible));
  }

  /**
   * Opens the banner.
   * @param {boolean} detailed shows the per-purpose choices (footer button)
   * @param {?HTMLElement} from element given the focus back on closing
   */
  function open(detailed, from) {
    opener = from || null;
    showChoices(detailed);
    if (opener) {
      banner.show();
      banner.querySelector(detailed ? 'input' : 'button').focus();
    } else {
      // On page load, the attribute (unlike show()) leaves the focus and the tab order alone.
      banner.setAttribute('open', '');
    }
  }

  function close() {
    banner.close();
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  }

  banner.addEventListener('click', function (evt) {
    var button = evt.target.closest('[data-consent]');
    if (!button) return;
    switch (button.getAttribute('data-consent')) {
      case 'accept': apply({ analytics: true, ads: true }); break;
      case 'deny': apply({ analytics: false, ads: false }); break;
      case 'save': apply({ analytics: choices.elements.analytics.checked, ads: choices.elements.ads.checked }); break;
      case 'customize':
        showChoices(true);
        choices.querySelector('input').focus();
        break;
    }
  });

  // Escape closes the banner without a choice: it comes back on the next page.
  banner.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape') close();
  });

  document.querySelectorAll('[data-consent-open]').forEach(function (button) {
    button.addEventListener('click', function () { open(true, button); });
  });

  if (!read()) open(false, null);
})();
