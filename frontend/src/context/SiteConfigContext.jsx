import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SiteConfigContext = createContext({ _loaded: false });
export const useSiteConfig = () => useContext(SiteConfigContext);

export function SiteConfigProvider({ children }) {
    const [value, setValue] = useState({ _loaded: false });
    useEffect(() => {
        api.get('/api/config/public')
            .then(r => setValue({ ...r.data, _loaded: true }))
            .catch(() => setValue({ _loaded: true }));
    }, []);
    return (
        <SiteConfigContext.Provider value={value}>
            {children}
        </SiteConfigContext.Provider>
    );
}
