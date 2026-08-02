import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '../api';

const VisitCounter = () => {
    const [visits, setVisits] = useState(null);

    useEffect(() => {
        // Only count once per session
        const counted = sessionStorage.getItem('tb_visit_counted');
        if (!counted) {
            api.post('/api/stats/visit')
                .then(res => {
                    setVisits(res.data.visits);
                    sessionStorage.setItem('tb_visit_counted', '1');
                })
                .catch(() => {
                    // If POST fails, just GET
                    api.get('/api/stats/visits').then(r => setVisits(r.data.visits)).catch(() => {});
                });
        } else {
            api.get('/api/stats/visits').then(r => setVisits(r.data.visits)).catch(() => {});
        }
    }, []);

    if (visits === null) return null;

    return (
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{visits.toLocaleString('es-CL')} visitas al sitio</span>
        </div>
    );
};

export default VisitCounter;
