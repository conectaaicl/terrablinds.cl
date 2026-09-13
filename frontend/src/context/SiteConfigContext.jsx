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
                // Inject GA4 tag if configured
                const gaId = cfg.google_analytics_id;
                if (gaId && gaId.startsWith('G-') && !document.getElementById('ga4-script')) {
                    const s1 = document.createElement('script');
                    s1.id = 'ga4-script';
                    s1.async = true;
                    s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
                    document.head.appendChild(s1);
                    const s2 = document.createElement('script');
                    s2.id = 'ga4-init';
                    s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
                    document.head.appendChild(s2);
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
