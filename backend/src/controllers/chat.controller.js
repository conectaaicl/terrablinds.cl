const { Config } = require('../models');
const https = require('https');

const TG_TOKEN   = '58724091624:AAEpnBRNe-y49FM8DH0igIie-HnL83BA8yw';
const TG_CHAT_ID = '8676382169';

function sendTelegram(text) {
    const body = JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'Markdown' });
    const req = https.request({
        hostname: 'api.telegram.org',
        path: `/bot${TG_TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    });
    req.on('error', () => {});
    req.write(body);
    req.end();
}

const buildSystemPrompt = (waNumber, waEmail) => `Eres el asistente virtual de TerraBlinds, empresa chilena especializada en cortinas, persianas y domótica. Respondes de forma amable, concisa y profesional. Siempre en español.

CONTACTO DIRECTO:
${waNumber ? `- WhatsApp: https://wa.me/${waNumber} (envía ese link si piden contacto)` : '- WhatsApp: disponible en la página de contacto'}
${waEmail ? `- Email: ${waEmail}` : ''}
- Cotizador online: /quote (envía ese link para cotizar)
- Servicio técnico: /servicio-tecnico
- Domótica: /domotica

PRODUCTOS QUE OFRECEMOS:
- Cortinas Roller Blackout: oscurecimiento total, ideales para dormitorios
- Cortinas Roller Screen: filtra la luz manteniendo la vista al exterior, oficinas y living
- Cortinas Roller Sunscreen: protección solar manteniendo luminosidad
- Cortina Dual / Sheer Elegance: doble capa (blackout + tul), máxima versatilidad
- Persianas Venecianas: lamas de aluminio regulables, clásicas y duraderas
- Persianas de Madera: calidez y elegancia natural
- Persianas Romanas: tela plegable, look elegante y moderno
- Panel Japonés: paneles deslizantes, ideal para espacios amplios y minimalistas
- Cortinas de Tela: variedad de diseños y tejidos
- Motorización / Domótica: control por app, control remoto o integración con Alexa/Google Home
- Toldos Retráctiles: protección solar para exteriores y terrazas

PROCESO DE COMPRA:
1. El cliente elige el tipo de producto
2. Ingresa las medidas del vano (hueco de la ventana): ancho × alto en cm o mm
3. Elige color o tela
4. Recibe cotización por email con precio exacto
5. Coordinamos visita de instalación profesional

PRECIOS: Se calculan por metro cuadrado y dependen del modelo y las medidas. Para obtener precio exacto, el cliente debe ir al cotizador. Mínimo área cobrado: 1 m².

INSTALACIÓN: Incluimos instalación profesional. Trabajamos en Santiago y otras regiones.

INSTRUCCIONES:
- Máximo 3-4 oraciones por respuesta
- Si preguntan precio exacto, explica que depende de las medidas y ofrece ir al cotizador
- Si muestran interés en comprar, invítalos a cotizar con el link /quote
- Si preguntan por medidas, explica que se mide el vano (hueco) en ancho × alto
- Si no sabes algo, di "Para más información puedes contactarnos por WhatsApp o visitar nuestra página de contacto"
- No inventes precios específicos
- Sé cercano y usa un tono chileno amigable cuando sea apropiado
- Si el usuario pregunta por WhatsApp o cómo contactar, entrega el link directo de WhatsApp
- Si el usuario quiere cotizar, manda el link /quote
- En el PRIMER mensaje del usuario, después de responder su consulta, pídele amablemente su nombre y cómo contactarlo (email o WhatsApp). Ejemplo: "Por cierto, ¿me puedes dejar tu nombre y un email o WhatsApp para poder ayudarte mejor si necesitas seguimiento?"
- Si el usuario ya entregó sus datos de contacto en la conversación, NO los vuelvas a pedir`;

exports.chat = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages requerido' });
        }

        // Limit message history to last 12 messages
        const recentMessages = messages.slice(-12).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content || '').substring(0, 500),
        }));

        // Get Groq API key + contact info from config DB
        const configs = await Config.findAll({
            where: { key: ['groq_api_key', 'whatsapp_number', 'company_email'] }
        });
        const cfg = Object.fromEntries(configs.map(c => [c.key, c.value]));
        const apiKey = cfg.groq_api_key;
        const systemPrompt = buildSystemPrompt(cfg.whatsapp_number, cfg.company_email);

        if (!apiKey || apiKey.length < 10) {
            return res.status(503).json({ error: 'Chat temporalmente no disponible.' });
        }

        const payload = JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                ...recentMessages,
            ],
            max_tokens: 300,
            temperature: 0.65,
            stream: false,
        });

        const data = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.groq.com',
                path: '/openai/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Length': Buffer.byteLength(payload),
                },
            };

            const request = https.request(options, (response) => {
                let raw = '';
                response.on('data', chunk => raw += chunk);
                response.on('end', () => {
                    try { resolve(JSON.parse(raw)); }
                    catch { reject(new Error('Invalid response from Groq')); }
                });
            });

            request.on('error', reject);
            request.setTimeout(15000, () => {
                request.destroy();
                reject(new Error('Groq timeout'));
            });
            request.write(payload);
            request.end();
        });

        if (data.error) {
            console.error('Groq API error:', data.error);
            throw new Error(`Groq error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('Empty response from Groq');

        // Notify via Telegram on first user message only (non-blocking)
        if (recentMessages.length === 1) {
            const firstMsg = recentMessages[0].content;
            sendTelegram(`💬 *Nuevo chat — TerraBlinds.cl*\n\n📝 *Mensaje:* ${firstMsg}`);
        }

        res.json({ reply });

    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ reply: 'Lo siento, tuve un problema al procesar tu consulta. Puedes contactarnos directamente por WhatsApp o email.' });
    }
};
