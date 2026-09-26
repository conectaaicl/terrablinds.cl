import { WhatsAppButton } from './WhatsAppCTA';

export function ConversionHero() {
  return (
    <section className="bg-[#0B1220] px-4 py-16 text-center">
      <div className="mx-auto max-w-3xl">
        <span className="inline-block rounded-full wa-pulse px-5 py-1.5 text-xs font-bold text-white tracking-wide uppercase shadow-lg">
          🔥 30% OFF hoy — Precio de fábrica
        </span>

        <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
          Cortinas roller a medida,
          <br />
          instaladas en tu hogar
        </h1>

        <p className="mt-4 text-base text-gray-300">
          Fabricación e instalación incluida en Santiago. 48 meses de garantía. Cotiza y recibe respuesta en minutos.
        </p>

        <div className="mt-6 flex items-baseline justify-center gap-3">
          <span className="text-lg text-gray-500 line-through">$45.715</span>
          <span className="text-3xl font-bold text-white">$32.000</span>
          <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">desde</span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="relative">
            <WhatsAppButton
              label="Cotizar por WhatsApp — 30% OFF hoy"
              message="¡Hola! Vi la oferta en la página de TerraBlinds y quiero cotizar cortinas roller."
              className="px-10 py-5 text-base font-bold shadow-xl"
            />
          </div>
          <a
            href="/agendar"
            className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-6 py-5 text-sm font-semibold text-gray-300 hover:border-white hover:text-white transition-colors"
          >
            Agendar visita técnica
          </a>
        </div>

        <p className="mt-4 text-xs text-gray-500">Respuesta en minutos · Sin compromiso · Todo Santiago</p>

        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500">
          <span>✂️ Fabricación propia</span>
          <span>🛡️ 48 meses garantía</span>
          <span>⭐ 5.0★ Google</span>
        </div>
      </div>
    </section>
  );
}
