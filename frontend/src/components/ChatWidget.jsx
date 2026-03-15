import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Bot, ChevronRight, RotateCcw } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

const QUICK_REPLIES = [
    '¿Qué tipos de cortinas tienen?',
    '¿Cómo tomo las medidas?',
    '¿Cuánto demora la instalación?',
    '¿Hacen domótica / motorización?',
];

const WELCOME_MSG = {
    role: 'assistant',
    content: '¡Hola! 👋 Soy el asistente de **TerraBlinds**. ¿En qué puedo ayudarte hoy?\n\nPuedo orientarte sobre nuestros productos, medidas, instalación y más.',
};

function renderContent(text) {
    // Simple markdown: **bold** and newlines
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part.split('\n').map((line, j) => (
            <React.Fragment key={`${i}-${j}`}>
                {line}
                {j < part.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    });
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [greetingDismissed, setGreetingDismissed] = useState(false);
    const [available, setAvailable] = useState(false);
    const [leadSaved, setLeadSaved] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Check if Groq is configured (chat endpoint will tell us)
    useEffect(() => {
        // We check availability by seeing if the key exists in public config
        // Actually just try — if chat fails it means not configured
        setAvailable(true); // Optimistic — show widget, hide gracefully if API missing
    }, []);

    // Auto-greet after 6 seconds on first visit
    useEffect(() => {
        const seen = sessionStorage.getItem('tb_chat_greeted');
        if (!seen && !greetingDismissed) {
            const t = setTimeout(() => {
                setShowGreeting(true);
                sessionStorage.setItem('tb_chat_greeted', '1');
            }, 6000);
            return () => clearTimeout(t);
        }
    }, [greetingDismissed]);

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const openChat = () => {
        setOpen(true);
        setShowGreeting(false);
        setGreetingDismissed(true);
    };

    const send = async (text) => {
        const content = (text || input).trim();
        if (!content || loading) return;
        setInput('');
        setShowGreeting(false);

        const userMsg = { role: 'user', content };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await api.post('/api/chat', {
                messages: newMessages.filter(m => m.role !== 'system'),
            });
            const reply = res.data.reply;
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            setAvailable(true);

            // Try to extract contact info from conversation and save lead
            if (!leadSaved) {
                const allText = newMessages.map(m => m.content).join(' ');
                const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                const phoneMatch = allText.match(/(\+?56\s?)?(\+?9\d[\s-]?\d{4}[\s-]?\d{4}|\d{8,})/);
                const nameMatch = allText.match(/(?:me llamo|soy|mi nombre es)\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ]?[a-záéíóú]+)?)/i);
                if (emailMatch || phoneMatch) {
                    api.post('/api/leads', {
                        name: nameMatch?.[1] || null,
                        email: emailMatch?.[0] || null,
                        phone: phoneMatch?.[0] || null,
                        source: 'chat',
                        notes: allText.substring(0, 500),
                    }).then(() => setLeadSaved(true)).catch(() => {});
                }
            }
        } catch (err) {
            const fallback = err.response?.status === 503
                ? 'El chat no está disponible en este momento. Puedes contactarnos por WhatsApp o email directamente.'
                : 'Tuve un problema. Por favor intenta nuevamente o contáctanos por WhatsApp.';
            setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMessages([WELCOME_MSG]);
        setInput('');
    };

    if (!available) return null;

    return (
        <>
            {/* Greeting bubble */}
            {showGreeting && !open && (
                <div className="fixed bottom-28 right-5 z-50 animate-bounce-in">
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 max-w-[220px]">
                        <button onClick={() => { setShowGreeting(false); setGreetingDismissed(true); }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                        <p className="text-sm text-gray-700 font-medium leading-snug">
                            👋 ¡Hola! ¿Puedo ayudarte a encontrar la cortina ideal?
                        </p>
                        <button onClick={openChat}
                            className="mt-2 w-full text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 transition-colors">
                            Chatear ahora <ChevronRight className="w-3 h-3" />
                        </button>
                        {/* Triangle */}
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45" />
                    </div>
                </div>
            )}

            {/* Chat window */}
            {open && (
                <div className="fixed bottom-24 right-5 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
                    style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 flex-shrink-0">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">Asistente TerraBlinds</p>
                            <p className="text-xs text-blue-200">Responde al instante con IA</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={reset} title="Nueva conversación"
                                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                        <Bot className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                                }`}>
                                    {renderContent(msg.content)}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                    <Bot className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                                    {[0, 1, 2].map(d => (
                                        <div key={d} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                            style={{ animationDelay: `${d * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA after a few messages */}
                        {messages.length >= 3 && messages[messages.length - 1]?.role === 'assistant' && !loading && (
                            <div className="flex justify-center">
                                <Link to="/quote" onClick={() => setOpen(false)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-colors">
                                    📋 Ir al Cotizador <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Quick replies (only at start) */}
                    {messages.length === 1 && !loading && (
                        <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0 bg-gray-50">
                            {QUICK_REPLIES.map(q => (
                                <button key={q} onClick={() => send(q)}
                                    className="text-xs bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700 px-2.5 py-1.5 rounded-full transition-all font-medium">
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                            placeholder="Escribe tu consulta..."
                            disabled={loading}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none disabled:opacity-60"
                        />
                        <button onClick={() => send()}
                            disabled={!input.trim() || loading}
                            className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={() => open ? setOpen(false) : openChat()}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Chat con asistente"
            >
                {open
                    ? <X className="w-6 h-6" />
                    : <MessageCircle className="w-6 h-6" />
                }
                {!open && messages.length > 1 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                        {messages.filter(m => m.role === 'assistant').length}
                    </span>
                )}
            </button>
        </>
    );
}
