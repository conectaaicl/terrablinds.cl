import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WA_BOT     = '56943449232';
const WA_HUMAN   = '56998101891';
const WA_BOT_URL = `https://wa.me/${WA_BOT}?text=${encodeURIComponent('Hola! Quiero saber más sobre cortinas TerraBlinds')}`;
const WA_HUMAN_URL = `https://wa.me/${WA_HUMAN}?text=${encodeURIComponent('Hola, me gustaría cotizar cortinas. ¿Me pueden ayudar?')}`;

const track = (event, params = {}) => { if (window.gtag) window.gtag('event', event, params); };

export default function BotWidget() {
    const [open, setOpen] = useState(false);
    const [bubble, setBubble] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setBubble(true), 3500);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="fixed bottom-40 right-5 z-40 flex flex-col items-end gap-2">
            <AnimatePresence>
                {(bubble && !open) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="relative bg-white rounded-2xl rounded-br-sm shadow-xl px-4 py-3 text-sm text-gray-800 font-medium border border-gray-100 max-w-[190px]"
                    >
                        👋 Hola, ¿en qué te puedo ayudar?
                        <button
                            onClick={() => setBubble(false)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-400 hover:bg-gray-500 text-white rounded-full text-xs flex items-center justify-center leading-none"
                        >×</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-64 overflow-hidden"
                    >
                        <div className="bg-[#0d0b08] px-4 py-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <p className="text-white font-semibold text-sm">TerraBlinds Bot</p>
                                <p className="text-green-400 text-xs">En línea</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-2.5">
                            <p className="text-gray-600 text-sm mb-1">¿Cómo prefieres contactarnos?</p>
                            <a
                                href={WA_BOT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { track('bot_click', { position: 'bot_widget' }); setOpen(false); }}
                                className="flex items-center gap-2 w-full bg-[#25D366] text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-green-500 transition-colors"
                            >
                                <span>💬</span> Chat con el bot
                            </a>
                            <a
                                href={WA_HUMAN_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { track('whatsapp_click', { position: 'bot_widget' }); setOpen(false); }}
                                className="flex items-center gap-2 w-full bg-gray-100 text-gray-800 text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <span>👤</span> Hablar con una persona
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => { setOpen(o => !o); setBubble(false); }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-[#0d0b08] border-2 border-amber-500 shadow-lg flex items-center justify-center text-2xl select-none"
                aria-label="Chat TerraBlinds"
            >
                🤖
            </motion.button>
        </div>
    );
}
