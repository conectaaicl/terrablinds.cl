import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SiteConfigContext = createContext({ _loaded: false });
export const useSiteConfig = () => useContext(SiteConfigContext);

export function SiteConfigProvider({ children }) {
    const [value, setValue] = useState({ _loaded: false });
    useEffect(() => {
        api.get('/api/config/public')
            .then(r => {
                const cfg = r.data;
                setValue({ ...cfg, _loaded: true });
                // GA4: index.html already loads gtag.js with G-T80KNFRWE7. Loading the
                // library again (or re-configuring the same ID) double-counts every
                // page_view, so only add an extra *different* property ID here.
                const gaId = cfg.google_analytics_id;
                if (gaId && gaId.startsWith('G-') && gaId !== 'G-T80KNFRWE7' && !window.__tbExtraGa) {
                    window.__tbExtraGa = gaId;
                    if (typeof window.gtag === 'function') {
                        window.gtag('config', gaId);
                    } else if (!document.getElementById('ga4-script')) {
                        const s1 = document.createElement('script');
                        s1.id = 'ga4-script';
                        s1.async = true;
                        s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
                        document.head.appendChild(s1);
                        window.dataLayer = window.dataLayer || [];
                        window.gtag = function () { window.dataLayer.push(arguments); };
                        window.gtag('js', new Date());
                        window.gtag('config', gaId);
                    }
                }
            })
            .catch(() => setValue({ _loaded: true }));
    }, []);
    return (
        <SiteConfigContext.Provider value={value}>
            {children}
        </SiteConfigContext.Provider>
    );
}
