import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tb_popup_dismissed'
const TTL = 24 * 60 * 60 * 1000
const API = 'https://clientes.conectaai.cl/api/banner/public/terrablinds.cl'

export default function PopupBanner() {
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    try {
      const d = localStorage.getItem(STORAGE_KEY)
      if (d && Date.now() - Number(d) < TTL) return
    } catch {}
    fetch(API, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.active && data.type === 'popup') setPopup(data)
      })
      .catch(() => {})
  }, [])

  if (!popup) return null

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch {}
    setPopup(null)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={dismiss}
    >
      <div
        style={{
          position: 'relative', maxWidth: '480px', width: '100%',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '32px', height: '32px', borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: 'rgba(0,0,0,0.5)', color: '#fff',
            fontSize: '18px', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >
          ×
        </button>
        {popup.imageUrl
          ? (
            <img
              src={popup.imageUrl}
              alt={popup.text || 'Promoción'}
              style={{ width: '100%', display: 'block', cursor: popup.link ? 'pointer' : 'default' }}
              onClick={() => { if (popup.link) { dismiss(); window.open(popup.link, '_blank') } }}
            />
          )
          : popup.text && (
            <div
              style={{ padding: '24px', background: '#fff', fontSize: '15px' }}
              dangerouslySetInnerHTML={{ __html: popup.text }}
            />
          )
        }
      </div>
    </div>
  )
}
