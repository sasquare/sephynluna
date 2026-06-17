import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db, isFirebaseReady } from '../firebase'
import { MARIA_WHATSAPP } from '../constants'
import HeroCarousel from '../components/HeroCarousel'

function WaIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.529 5.844L.057 23.784c-.074.297.199.556.49.471l6.083-1.594A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.021-1.381l-.361-.214-3.736.979.997-3.644-.236-.375A9.8 9.8 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
  )
}

function WholesaleCard({ product }) {
  const waText = encodeURIComponent(
    `Hello Maria! 🌸 I'm interested in a wholesale order:\n\n` +
    `*Product:* ${product.name}\n` +
    `*Category:* ${product.category}\n` +
    `*Unit:* ${product.unitSize}\n` +
    `*Price:* ₦${Number(product.price).toLocaleString()}\n\n` +
    `Please let me know availability and how to proceed.`
  )
  const waUrl = `https://wa.me/${MARIA_WHATSAPP}?text=${waText}`

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col h-full">
      <div className="aspect-square bg-purple-50 overflow-hidden flex-shrink-0">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">💧</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 self-start"
          style={{ background: '#F5F0FF', color: '#3B0764' }}>
          {product.category}
        </span>

        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 flex-1">{product.name}</h3>

        <p className="text-xs font-semibold text-purple-400 mb-1">{product.unitSize}</p>

        {product.description && (
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-3 mt-auto">
          <span className="font-bold text-base" style={{ color: '#3B0764' }}>
            ₦{Number(product.price).toLocaleString()}
          </span>
          {!product.inStock && (
            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
          )}
        </div>

        {product.inStock ? (
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: '#25D366' }}>
            <WaIcon /> Enquire on WhatsApp
          </a>
        ) : (
          <div className="w-full py-3 rounded-xl text-center text-sm text-red-500 bg-red-50 border border-red-100">
            Currently Unavailable
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-purple-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-full mt-3" />
      </div>
    </div>
  )
}

const TABS = ['All', 'Dozens', 'Bulk / Canister']

function WholesalePage() {
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!isFirebaseReady) { setLoading(false); return }
    const q = query(collection(db, 'wholesale_products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = activeTab === 'All'
    ? products
    : products.filter(p => p.category === activeTab)

  return (
    <div className="min-h-screen" style={{ background: '#FAF5FF' }}>

      {/* Hero — carousel of wholesale product photos behind a translucent purple veil */}
      <header className="relative overflow-hidden">
        <HeroCarousel collectionName="wholesale_products" />

        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(30,4,55,0.82) 0%, rgba(59,7,100,0.72) 60%, rgba(74,14,143,0.72) 100%)' }} />

        <div className="relative z-10 text-center py-8 px-4">
          <Link to="/" className="inline-block text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 hover:text-white transition-colors"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            ✦ SephynLuna ✦
          </Link>
          <p className="text-brand-gold text-xs tracking-[0.3em] uppercase mb-2 font-semibold"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            💧 Oil Based · Custom Blend
          </p>
          <h2 className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}>
            Wholesale Store
          </h2>
          <p className="text-purple-100 text-sm" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            Buy in dozens or bulk canisters — enquire via WhatsApp
          </p>
          <Link to="/"
            className="inline-block mt-4 text-xs text-purple-200 hover:text-white transition-colors underline">
            ← Back to Main Store
          </Link>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0"
              style={activeTab === tab
                ? { background: '#3B0764', color: 'white' }
                : { background: '#F5F0FF', color: '#3B0764' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Info banner */}
        <div className="mb-6 p-4 rounded-xl border border-purple-100 bg-white flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0">ℹ️</span>
          <div>
            <p className="text-sm font-bold text-brand-purple">How wholesale ordering works</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Click "Enquire on WhatsApp" on any product — a pre-filled message will open for Maria.
              She will confirm the scent blend, quantity, and arrange delivery.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-5">💧</div>
            <h3 className="text-2xl font-bold text-brand-purple mb-2"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              {products.length === 0 ? 'Wholesale Catalog Coming Soon' : 'Nothing in this category'}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              {products.length === 0
                ? 'Wholesale products will appear here once added.'
                : 'Switch to a different tab above.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map(p => <WholesaleCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs border-t border-gray-100 mt-4">
        © SephynLuna Perfumery Hub · By Maria Adewolu Sasa
      </footer>
    </div>
  )
}

export default WholesalePage
