import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db, isFirebaseReady } from '../firebase'
import { CATEGORIES } from '../constants'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import BlogSidebar from '../components/BlogSidebar'
import TestimonialWidget from '../components/TestimonialWidget'

const ALL = 'All'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-purple-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  )
}

function CatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [activeBase,     setActiveBase]     = useState(ALL)

  useEffect(() => {
    if (!isFirebaseReady) { setLoading(false); return }
    const q    = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = products.filter(p => {
    const catOk  = activeCategory === ALL || p.category === activeCategory
    const baseOk = activeBase     === ALL || p.baseType  === activeBase
    return catOk && baseOk
  })

  return (
    <div className="min-h-screen" style={{ background: '#FAF5FF' }}>
      <Navbar showCarousel />

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-5xl mx-auto px-4 py-3">

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[ALL, ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                  activeCategory === cat
                    ? 'text-white'
                    : 'text-brand-purple hover:opacity-80'
                }`}
                style={activeCategory === cat
                  ? { background: '#3B0764' }
                  : { background: '#F5F0FF' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Base type pills */}
          <div className="flex gap-2 mt-2">
            {[ALL, 'Oil Based', 'Alcohol Based'].map(base => (
              <button key={base} onClick={() => setActiveBase(base)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                  activeBase === base ? 'text-brand-purple-dark font-bold' : 'text-gray-600 hover:opacity-80'
                }`}
                style={activeBase === base
                  ? { background: '#D4AF37' }
                  : { background: '#F3F4F6' }
                }
              >
                {base === 'Oil Based' ? '💧 Oil Based' : base === 'Alcohol Based' ? '✨ Alcohol Based' : base}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <main className="max-w-5xl xl:max-w-7xl mx-auto px-4 py-8 xl:grid xl:grid-cols-[260px_1fr_260px] xl:gap-6 xl:items-start">

        {/* Left — Maria's perfume journal */}
        <aside className="hidden xl:block">
          <BlogSidebar />
        </aside>

        {/* Center — catalog */}
        <div>
          {/* Wholesale link */}
          <Link to="/wholesale"
            className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: '#F5F0FF', color: '#3B0764', border: '1px solid #E9D8FD' }}>
            <span>💧</span>
            <span>Wholesale Store</span>
            <span className="text-gray-400 font-normal hidden sm:inline">· Oil Based Custom Blend</span>
            <span className="text-brand-gold">→</span>
          </Link>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-7xl mb-5">🌸</div>
              <h3 className="text-2xl font-bold text-brand-purple mb-2"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                {products.length === 0 ? 'Collection Coming Soon' : 'No products here'}
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                {products.length === 0
                  ? 'Our curated fragrances will appear here once added.'
                  : 'Try a different category or base type filter.'}
              </p>
              {!isFirebaseReady && (
                <p className="text-amber-700 text-xs mt-6 bg-amber-50 rounded-xl p-4 max-w-xs mx-auto">
                  🔧 Demo Mode — products load from Firebase once credentials are added.
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-4">{filtered.length} fragrance{filtered.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right — customer testimonials */}
        <aside className="hidden xl:block">
          <TestimonialWidget />
        </aside>
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs border-t border-gray-100 mt-4">
        <p>© SephynLuna Perfumery Hub · By Maria Adewolu Sasa</p>
        <Link to="/admin" className="text-purple-200 hover:text-brand-purple mt-1 inline-block text-xs transition-colors">
          Admin
        </Link>
      </footer>
    </div>
  )
}

export default CatalogPage
