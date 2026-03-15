const { Config } = require('../models');
const https = require('https');

const SYSTEM_PROMPT = `Eres el asistente virtual de TerraBlinds, empresa chilena especializada en cortinas, persianas y domótica. Respondes de forma amable, concisa y profesional. Siempre en español.

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
- Sé cercano y usa un tono chileno amigable cuando sea apropiado`;

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

        // Get Groq API key from config DB
        const config = await Config.findOne({ where: { key: 'groq_api_key' } });
        const apiKey = config?.value;

        if (!apiKey || apiKey.length < 10) {
            return res.status(503).json({ error: 'Chat temporalmente no disponible.' });
        }

        const payload = JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...recentMessages,
            ],
            max_tokens: 250,
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

        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('Empty response from Groq');

        res.json({ reply });

    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ reply: 'Lo siento, tuve un problema al procesar tu consulta. Puedes contactarnos directamente por WhatsApp o email.' });
    }
};
