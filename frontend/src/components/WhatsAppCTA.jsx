// Botón CTA de WhatsApp — conversión directa
const WA_NUMBER = "56998101891";
const DEFAULT_MSG = "¡Hola! Estoy viendo la página de TerraBlinds y me gustaría cotizar cortinas roller.";

function buildUrl(msg = DEFAULT_MSG) {
  return `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;
}

function WAIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.34a9.85 9.85 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.76 14.1c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.3-1.64-.6-2.9-1.25-4.79-4.17-4.93-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.21 1.36.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.87.27.14.44.2.51.32.07.11.07.66-.17 1.34z" />
    </svg>
  );
}

export function WhatsAppButton({ label = "Cotizar por WhatsApp", message, className = "" }) {
  return (
    <a
      href={buildUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full wa-pulse px-7 py-3.5 text-sm font-bold text-white transition-transform hover:scale-105 ${className}`}
    >
      <WAIcon className="h-5 w-5" />
      {label}
    </a>
  );
}

export function WhatsAppFloating() {
  return (
    <a
      href={buildUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cotizar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full wa-pulse shadow-lg transition-transform hover:scale-105"
    >
      <WAIcon className="h-7 w-7 text-white" />
    </a>
  );
}
