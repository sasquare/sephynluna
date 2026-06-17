import { useState, useEffect } from 'react'
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseReady } from '../firebase'

function Stars({ value, onChange, readonly = false, size = 'text-2xl' }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={readonly ? undefined : () => onChange(s)}
          onMouseEnter={readonly ? undefined : () => setHover(s)}
          onMouseLeave={readonly ? undefined : () => setHover(0)}
          className={`${size} leading-none bg-transparent border-0 p-0 ${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          style={{ color: s <= (hover || value) ? '#D4AF37' : '#D1D5DB' }}>
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewSection({ productId }) {
  const [reviews,   setReviews]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form,      setForm]      = useState({ name: '', rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!isFirebaseReady || !db) { setLoading(false); return }
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [productId])

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())    { setError('Please enter your name'); return }
    if (!form.rating)         { setError('Please select a star rating'); return }
    if (!form.comment.trim()) { setError('Please write a comment'); return }
    setSubmitting(true)
    setError('')
    try {
      if (isFirebaseReady && db) {
        await addDoc(collection(db, 'reviews'), {
          productId,
          reviewerName: form.name.trim(),
          rating:       form.rating,
          comment:      form.comment.trim(),
          createdAt:    serverTimestamp(),
        })
      }
      setSubmitted(true)
      setShowForm(false)
      setForm({ name: '', rating: 0, comment: '' })
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg mt-6">
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-brand-purple"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              Customer Reviews
            </h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-brand-purple">{avgRating.toFixed(1)}</span>
                <Stars value={Math.round(avgRating)} readonly size="text-base" />
                <span className="text-gray-400 text-xs">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
          {!submitted && (
            <button onClick={() => setShowForm(v => !v)}
              className="px-4 py-2 rounded-xl border-2 border-brand-purple text-brand-purple text-sm font-bold hover:bg-brand-purple hover:text-white transition-all cursor-pointer bg-transparent">
              {showForm ? 'Cancel' : '✍ Write Review'}
            </button>
          )}
        </div>

        {/* Thank-you after submit */}
        {submitted && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
            ✓ Thank you for your review!
          </div>
        )}

        {/* Review form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl space-y-4"
            style={{ background: '#F5F0FF' }}>
            <div>
              <label className="block text-xs font-bold text-brand-purple uppercase tracking-wide mb-1">Your Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Amara Johnson"
                className="w-full px-3 py-2.5 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-purple uppercase tracking-wide mb-1.5">Your Rating</label>
              <Stars value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-purple uppercase tracking-wide mb-1">Your Review</label>
              <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                rows={3} placeholder="Share your experience with this fragrance..."
                className="w-full px-3 py-2.5 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white resize-none" />
            </div>
            {error && <p className="text-red-600 text-xs">⚠ {error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer border-0 disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#1E0437' }}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">✍</p>
            <p className="text-sm">No reviews yet — be the first!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-purple-50 pb-5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">{r.reviewerName}</span>
                  <span className="text-xs text-gray-400">
                    {r.createdAt?.toDate?.()?.toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    }) || ''}
                  </span>
                </div>
                <Stars value={r.rating} readonly size="text-base" />
                <p className="text-sm text-gray-600 leading-relaxed mt-2">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewSection
