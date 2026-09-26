import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '../api';

const VisitCounter = () => {
    const [visits, setVisits] = useState(null);

    useEffect(() => {
        // Display only. Visits are recorded per route by Layout.jsx — posting here
        // too counted every session twice and logged a fake visit to "/".
        api.get('/api/stats/visits').then(r => setVisits(r.data?.visits)).catch(() => {});
    }, []);

    // Never let an unexpected API response crash the footer (and the whole page)
    if (typeof visits !== 'number' || !Number.isFinite(visits)) return null;

    return (
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{visits.toLocaleString('es-CL')} visitas al sitio</span>
        </div>
    );
};

export default VisitCounter;
