import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Eye, X, ChevronDown, MessageCircle, Mail, RefreshCw, Phone, Printer, RotateCcw, Trash2 } from 'lucide-react';

const LOGO_URL = '/logoterrablinds.png';
const fmt = n => Math.round(Number(n) || 0).toLocaleString('es-CL');
const p2  = n => String(n).padStart(2, '0');

function printQuote(quote, items) {
    const d = new Date(quote.created_at || Date.now());
    const cotNum = String(quote.id).padStart(4, '0');
    const logoSrc = `${window.location.origin}${LOGO_URL}`;
    const logo = `<img src="${logoSrc}" style="max-height:52px;max-width:130px;object-fit:contain">`;

    // Calcular sub-total desde ítems, luego IVA
    const itemsTotal = items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1), 0);
    const storedTotal = parseFloat(quote.total_amount || 0);
    const subTotal = storedTotal > 0 ? Math.round(storedTotal / 1.19) : itemsTotal;
    const iva      = Math.round(subTotal * 0.19);
    const total    = subTotal + iva;

    // Filas — siempre 10 mínimo
    const padded = [...items];
    while (padded.length < 10) padded.push(null);
    const rows = padded.map(it => !it
        ? '<tr><td></td><td></td><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>'
        : `<tr>
            <td class="c">${parseInt(it.quantity) || 1}</td>
            <td class="c">-</td>
            <td><b>${it.productName || it.product || '-'}</b>${it.color ? ' · ' + it.color : ''}</td>
            <td class="c">${it.width || ''}</td>
            <td class="c">${it.height || ''}</td>
            <td class="r">${it.price > 0 ? fmt(it.price) : ''}</td>
            <td class="r b">${fmt((parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1))}</td>
           </tr>`
    ).join('');

    const css = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000}
.page{width:210mm;margin:0 auto;padding:8mm 10mm}
.hdr{display:grid;grid-template-columns:148px 1fr 148px;border:1.5px solid #000}
.hl{padding:8px;display:flex;align-items:center;justify-content:center;border-right:1px solid #ccc;min-height:58px}
.hc{padding:8px 12px;text-align:center}.cn{font-size:13px;font-weight:900}.ct{font-size:9.5px;color:#444;margin-top:3px}
.ttl{background:#e0e0e0;text-align:center;font-size:13px;font-weight:900;padding:5px;border:1.5px solid #000;border-top:none;letter-spacing:1px}
.cs{display:grid;grid-template-columns:1fr 153px;border:1.5px solid #000;border-top:none}
.cr{display:flex;border-bottom:1px solid #eee;min-height:18px}.cr:last-child{border-bottom:none}
.lbl{font-weight:900;font-style:italic;font-size:10px;min-width:68px;padding:3px 6px;border-right:1px solid #eee;display:flex;align-items:center}
.val{padding:3px 8px;font-size:10px;display:flex;align-items:center;flex:1}
.ds{display:flex;flex-direction:column;border-left:1px solid #ccc}
.dh-row{display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #ccc}
.dh{text-align:center;font-size:9px;font-weight:900;font-style:italic;padding:2px;border-right:1px solid #ccc}.dh:last-child{border-right:none}
.dv{text-align:center;font-size:11px;padding:3px 2px;border-right:1px solid #ccc}.dv:last-child{border-right:none}
.vl{font-weight:900;font-style:italic;font-size:10px;text-align:center;padding:4px}
table.it{width:100%;border-collapse:collapse;border:1.5px solid #000;border-top:none;font-size:10px}
table.it th{background:#e0e0e0;border:1px solid #ccc;padding:4px 5px;text-align:center;font-size:9px;font-weight:900}
table.it td{border:1px solid #ebebeb;padding:3px 5px;vertical-align:middle;height:17px}
.c{text-align:center}.r{text-align:right}.b{font-weight:700}
table.ft{width:100%;border-collapse:collapse;border:1.5px solid #000;border-top:none;font-size:10px}
table.ft td{border:1px solid #ccc;padding:4px 6px;vertical-align:top}
.sh{background:#c8e6c9;font-weight:900;font-size:11px;text-align:center;padding:5px;letter-spacing:.5px}
.sho{background:#ffe0b2;font-weight:900;font-size:11px;text-align:center;padding:5px}
.tot{background:#f5f5f5;font-weight:600;font-size:11px}.totf{background:#1d4ed8;color:#fff;font-weight:900;font-size:13px}
.pb{display:inline-block;border-radius:3px;padding:2px 8px;font-size:9.5px;font-weight:700;margin:2px}
@media print{body{background:#fff}.page{padding:5mm 7mm}@page{size:A4 portrait;margin:5mm}button{display:none!important}}`;

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Cotización N°${cotNum} - TerraBlinds</title><style>${css}</style></head><body>
<div class="page">
<div style="text-align:right;margin-bottom:6px">
  <button onclick="window.print()" style="background:#1d4ed8;color:#fff;border:none;border-radius:5px;padding:6px 18px;font-size:12px;cursor:pointer;font-weight:600">⬇ Descargar / Imprimir PDF</button>
</div>
<div class="hdr">
  <div class="hl">${logo}</div>
  <div class="hc">
    <div class="cn">TERRABLINDS SPA</div>
    <div class="ct">Fabricación de Cortinas Roller a Medida, Toldos, Persianas Interiores y Exteriores<br>Cierres de Terraza, Domótica y Control de Acceso</div>
  </div>
  <div class="hl" style="border-left:1px solid #ccc;border-right:none">${logo}</div>
</div>
<div class="ttl">COTIZACIÓN N° ${cotNum}</div>
<div class="cs">
  <div>
    <div class="cr"><div class="lbl">NOMBRE:</div><div class="val">${quote.customer_name || ''}</div></div>
    <div class="cr"><div class="lbl">CORREO:</div><div class="val">${quote.customer_email || ''}</div></div>
    <div class="cr"><div class="lbl">TELÉFONO:</div><div class="val">${quote.customer_phone || ''}</div></div>
    <div class="cr"><div class="lbl">NOTAS:</div><div class="val">${quote.notes || ''}</div></div>
  </div>
  <div class="ds">
    <div class="dh-row" style="background:#e0e0e0;font-weight:900;font-style:italic;font-size:10px;text-align:right;padding:3px 6px;border-bottom:1px solid #ccc;grid-template-columns:1fr">
      <div style="text-align:right;padding:3px 6px">FECHA COTIZACIÓN</div>
    </div>
    <div class="dh-row"><div class="dh">DÍA</div><div class="dh">MES</div><div class="dh">AÑO</div></div>
    <div class="dh-row"><div class="dv">${p2(d.getDate())}</div><div class="dv">${p2(d.getMonth()+1)}</div><div class="dv">${d.getFullYear()}</div></div>
    <div class="vl">VÁLIDO POR 7 DÍAS</div>
  </div>
</div>
<table class="it">
  <thead><tr>
    <th style="width:40px">CANTIDAD</th><th style="width:50px">COD</th><th>PRODUCTO</th>
    <th style="width:42px">ANCHO<br>(cm)</th><th style="width:42px">ALTO<br>(cm)</th>
    <th style="width:86px">VALOR UNIT.<br>(M2)</th><th style="width:76px">TOTAL</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<table class="ft">
  <tr>
    <td style="width:55%">
      <div style="font-weight:700;text-align:center;margin-bottom:4px">Métodos de Pago</div>
      <div style="text-align:center">
        <span class="pb" style="background:#f5f5f5;border:1px solid #bbb;color:#333">Efectivo</span>
        <span class="pb" style="background:#e3f2fd;border:1px solid #90caf9;color:#1565c0">Transferencia</span>
        <span class="pb" style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32">Tarjeta Débito</span>
        <span class="pb" style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32">Tarjeta Crédito</span>
      </div>
    </td>
    <td style="width:45%;padding:0">
      <table style="width:100%;border-collapse:collapse">
        <tr><td class="tot" style="padding:4px 10px">SUB-TOTAL</td><td class="tot r" style="padding:4px 10px">$${fmt(subTotal)}</td></tr>
        <tr><td class="tot" style="padding:4px 10px">IVA (19%)</td><td class="tot r" style="padding:4px 10px">$${fmt(iva)}</td></tr>
        <tr><td class="totf" style="padding:6px 10px">TOTAL</td><td class="totf r" style="padding:6px 10px">$${fmt(total)}</td></tr>
      </table>
    </td>
  </tr>
  <tr><td colspan="2" class="sh">TÉRMINOS Y CONDICIONES GENERALES</td></tr>
  <tr><td colspan="2" style="padding:8px 12px;font-size:10px;line-height:1.8">
    1.- Garantía de 3 años en Mecanismos y Cadenas.<br>
    2.- Los valores de esta cotización pueden variar una vez rectificadas las medidas en terreno.<br>
    3.- Contamos con todo método de pago: efectivo, transferencia, tarjeta de débito y crédito.<br>
    4.- Los productos son fabricados a medida; una vez confeccionados no se realiza devolución del dinero.<br>
    5.- La instalación es gratis en la Región Metropolitana. Otras regiones consultar costo de traslado.
  </td></tr>
  <tr><td colspan="2" class="sho">CONDICIONES DE PAGO</td></tr>
  <tr><td colspan="2" style="padding:8px 12px;font-size:10px;line-height:1.8">
    50% de adelanto para iniciar la confección de las cortinas.<br>
    50% el día de la instalación.
  </td></tr>
</table>
</div></body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
}
import api from '../api';

const STATUS_MAP = {
    pending:   { label: 'Pendiente',          cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    contacted: { label: 'Contactado',         cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    sent:      { label: 'Presupuesto Enviado', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    accepted:  { label: 'Aceptada',           cls: 'bg-green-100 text-green-800 border-green-200' },
    rejected:  { label: 'Rechazada',          cls: 'bg-red-100 text-red-800 border-red-200' },
    completed: { label: 'Completada',         cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

const AdminQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [resendingEmail, setResendingEmail] = useState(null);
    const [deletingQuote, setDeletingQuote] = useState(null);

    useEffect(() => { fetchQuotes(); }, []);

    const fetchQuotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/api/quotes');
            setQuotes(res.data);
        } catch (err) {
            setError('No se pudieron cargar las cotizaciones.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (quoteId, newStatus) => {
        setUpdatingStatus(quoteId);
        try {
            await api.put(`/api/quotes/${quoteId}/status`, { status: newStatus });
            setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
            if (selectedQuote?.id === quoteId) setSelectedQuote({ ...selectedQuote, status: newStatus });
        } catch {
            alert('Error al actualizar el estado.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const parseItems = (quote) => {
        if (Array.isArray(quote.items)) return quote.items;
        try { return JSON.parse(quote.items || '[]'); } catch { return []; }
    };

    const whatsappLink = (quote) => {
        const phone = (quote.customer_phone || '').replace(/\D/g, '');
        if (!phone) return null;
        const num = phone.startsWith('56') ? phone : '56' + phone;
        const msg = encodeURIComponent(`Hola ${quote.customer_name}, te contactamos de TerraBlinds sobre tu cotización #${quote.id} por $${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}. ¿Cómo podemos ayudarte?`);
        return `https://wa.me/${num}?text=${msg}`;
    };

    const handleDeleteQuote = async (quote) => {
        if (!window.confirm(`¿Eliminar cotización #${quote.id} de ${quote.customer_name}? Esta acción no se puede deshacer.`)) return;
        setDeletingQuote(quote.id);
        try {
            await api.delete(`/api/quotes/${quote.id}`);
            setQuotes(prev => prev.filter(q => q.id !== quote.id));
            if (selectedQuote?.id === quote.id) setSelectedQuote(null);
        } catch {
            alert('Error al eliminar la cotización.');
        } finally {
            setDeletingQuote(null);
        }
    };

    const handleResendEmail = async (quoteId, email) => {
        setResendingEmail(quoteId);
        try {
            await api.post(`/api/quotes/${quoteId}/resend-email`);
            alert(`Email reenviado a ${email}`);
        } catch {
            alert('Error al reenviar el email. Verifica la configuración de correo.');
        } finally {
            setResendingEmail(null);
        }
    };

    const emailLink = (quote) => {
        const subject = encodeURIComponent(`Cotización #${quote.id} - TerraBlinds`);
        const body = encodeURIComponent(`Hola ${quote.customer_name},\n\nTe contactamos por tu cotización #${quote.id}.\n\nSaludos,\nTerraBlinds`);
        return `mailto:${quote.customer_email}?subject=${subject}&body=${body}`;
    };

    const filteredQuotes = quotes.filter(q => {
        const matchesSearch = (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
                    <p className="text-gray-500 text-sm">{quotes.length} cotizaciones en total</p>
                </div>
                <button onClick={fetchQuotes} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">Todos los estados</option>
                        {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Cargando cotizaciones...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredQuotes.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-400">No hay cotizaciones para mostrar.</td></tr>
                                ) : filteredQuotes.map(quote => {
                                    const st = STATUS_MAP[quote.status] || { label: quote.status, cls: 'bg-gray-100 text-gray-700 border-gray-200' };
                                    const wa = whatsappLink(quote);
                                    return (
                                        <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{quote.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900 text-sm">{quote.customer_name}</div>
                                                <div className="text-xs text-gray-400">{quote.customer_email}</div>
                                                {quote.customer_phone && <div className="text-xs text-gray-400">{quote.customer_phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-CL') : '—'}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}</td>
                                            <td className="px-6 py-4">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={quote.status}
                                                        onChange={e => handleStatusChange(quote.id, e.target.value)}
                                                        disabled={updatingStatus === quote.id}
                                                        className={`appearance-none pr-7 pl-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer outline-none ${st.cls}`}
                                                    >
                                                        {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {wa && (
                                                        <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                                                            <MessageCircle className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <a href={emailLink(quote)} title="Enviar email" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                    <button onClick={() => setSelectedQuote(quote)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteQuote(quote)}
                                                        disabled={deletingQuote === quote.id}
                                                        title="Eliminar cotización"
                                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedQuote && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Cotización #{selectedQuote.id}</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{selectedQuote.createdAt ? new Date(selectedQuote.createdAt).toLocaleString('es-CL') : '—'}</p>
                            </div>
                            <button onClick={() => setSelectedQuote(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Client info */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Cliente', value: selectedQuote.customer_name },
                                    { label: 'Email', value: selectedQuote.customer_email },
                                    { label: 'Teléfono', value: selectedQuote.customer_phone || '-' },
                                    { label: 'Estado', value: STATUS_MAP[selectedQuote.status]?.label || selectedQuote.status },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">{label}</p>
                                        <p className="font-semibold text-gray-900 text-sm">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedQuote.notes && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Notas del cliente</p>
                                    <p className="text-gray-700 bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm">{selectedQuote.notes}</p>
                                </div>
                            )}

                            {/* Products */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Productos solicitados</p>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">Producto</th>
                                                <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">Detalle</th>
                                                <th className="px-4 py-2 text-center text-xs text-gray-500 font-semibold">Cant.</th>
                                                <th className="px-4 py-2 text-right text-xs text-gray-500 font-semibold">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {parseItems(selectedQuote).map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{item.productName || item.product || '-'}</td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {item.width && item.height ? `${item.width}×${item.height} cm` : 'Unidad'}
                                                        {item.color && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item.color}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{item.quantity || 1}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">${(item.price || 0).toLocaleString('es-CL')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-gray-500 font-medium">Total estimado</span>
                                <span className="text-2xl font-bold text-gray-900">${parseFloat(selectedQuote.total_amount || 0).toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        {/* Action footer */}
                        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-2 sm:gap-3">
                            <button
                                onClick={() => printQuote(selectedQuote, parseItems(selectedQuote))}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-700 transition-colors">
                                <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Descargar</span> PDF
                            </button>
                            <button
                                onClick={() => handleResendEmail(selectedQuote.id, selectedQuote.customer_email)}
                                disabled={resendingEmail === selectedQuote.id}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                {resendingEmail === selectedQuote.id
                                    ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    : <RotateCcw className="w-4 h-4" />}
                                <span className="hidden sm:inline">Reenviar Email</span>
                            </button>
                            {whatsappLink(selectedQuote) && (
                                <a href={whatsappLink(selectedQuote)} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
                                    <MessageCircle className="w-4 h-4" /> WA
                                </a>
                            )}
                            <a href={emailLink(selectedQuote)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                                <Mail className="w-4 h-4" /> Email
                            </a>
                            {selectedQuote.customer_phone && (
                                <a href={`tel:${selectedQuote.customer_phone}`}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-700 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors">
                                    <Phone className="w-4 h-4" /> Llamar
                                </a>
                            )}
                            <select
                                value={selectedQuote.status}
                                onChange={e => handleStatusChange(selectedQuote.id, e.target.value)}
                                className="ml-auto px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminQuotes;
