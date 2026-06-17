import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db, isFirebaseReady } from '../firebase'
import Navbar from '../components/Navbar'
import OrderForm from '../components/OrderForm'
import SuccessMessage from '../components/SuccessMessage'
import ReviewSection from '../components/ReviewSection'

function ProductPage() {
  const { id } = useParams()
  const [product,    setProduct]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showOrder,  setShowOrder]  = useState(false)
  const [submission, setSubmission] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!isFirebaseReady) { setLoading(false); return }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() })
      } catch (err) {
        console.error('Failed to load product:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSuccess = (orderData, orderId) => {
    setSubmission({ orderData, orderId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#FAF5FF' }}>
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="aspect-video bg-purple-100" />
            <div className="p-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen" style={{ background: '#FAF5FF' }}>
        <Navbar />
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-xl font-bold text-brand-purple mb-3">Product not found</h2>
          <Link to="/" className="text-brand-purple underline text-sm">← Back to Collection</Link>
        </div>
      </div>
    )
  }

  // Map category to perfume type for the order form
  const perfumeType = product.category === 'Brand Inspired' ? 'Brand Perfume' : 'Custom Blend'

  return (
    <div className="min-h-screen" style={{ background: '#FAF5FF' }}>
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-8 pb-16">
        <Link to="/" className="inline-flex items-center gap-1 text-brand-purple text-sm mb-6 hover:underline">
          ← Back to Collection
        </Link>

        {submission ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />
            <div className="p-6 md:p-8">
              <SuccessMessage
                orderData={submission.orderData}
                orderId={submission.orderId}
                onNewOrder={() => setSubmission(null)}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Product card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />

              {/* Image */}
              <div className="aspect-video bg-purple-50 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">🌸</div>
                )}
              </div>

              <div className="p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#F5F0FF', color: '#3B0764' }}>
                    {product.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {product.baseType === 'Oil Based' ? '💧 Oil Based' : '✨ Alcohol Based'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {product.size}
                  </span>
                  {!product.inStock && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                  {product.name}
                </h1>

                {/* Price */}
                <p className="text-3xl font-bold mb-5" style={{ color: '#3B0764' }}>
                  ₦{Number(product.price).toLocaleString()}
                </p>

                {/* Scent notes */}
                {product.scentNotes && (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: '#F5F0FF' }}>
                    <p className="text-xs font-bold text-brand-purple uppercase tracking-widest mb-1">Scent Notes</p>
                    <p className="text-gray-700 text-sm">{product.scentNotes}</p>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>
                )}

                {/* Order button */}
                {product.inStock && !showOrder && (
                  <button
                    onClick={() => setShowOrder(true)}
                    className="w-full py-4 rounded-xl font-bold text-base tracking-widest uppercase transition-all duration-300 cursor-pointer border-0"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)',
                      color: '#1E0437',
                      boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
                    }}
                  >
                    ✦ Order This Perfume ✦
                  </button>
                )}

                {!product.inStock && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
                    ⚠ Currently out of stock — check back soon or contact us on WhatsApp.
                  </div>
                )}
              </div>
            </div>

            {/* Inline order form */}
            {showOrder && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />
                <div className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-brand-purple"
                      style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                      Complete Your Order
                    </h2>
                  </div>
                  <OrderForm
                    onSuccess={handleSuccess}
                    prefill={{
                      perfumeName: product.name,
                      perfumeType,
                      baseType:    product.baseType,
                      scentNotes:  product.scentNotes || '',
                      price:       product.price,
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {!submission && <ReviewSection productId={id} />}

      <footer className="text-center py-6 text-gray-400 text-xs border-t border-gray-100 mt-8">
        © SephynLuna Perfumery Hub · By Maria Adewolu Sasa
      </footer>
    </div>
  )
}

export default ProductPage
