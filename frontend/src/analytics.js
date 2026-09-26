// GA4 conversion tracking. gtag.js is loaded in index.html (G-T80KNFRWE7);
// page views come from GA4 enhanced measurement (history changes).

// A form that reached the business: quote, cart, contact, booking, chat lead.
// Mark "generate_lead" as a key event in GA4 (Admin → Events) to see it as a conversion.
export function trackLead(formName, params = {}) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', 'generate_lead', {
        form_name:      formName,
        page:           window.location.pathname,
        currency:       'CLP',
        value:          0,
        transport_type: 'beacon', // survives an immediate redirect (booking)
        ...params,
    });
}
