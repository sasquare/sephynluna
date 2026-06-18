import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseReady } from '../firebase'

function Stars({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className="text-xs leading-none" style={{ color: s <= value ? '#D4AF37' : '#E5E7EB' }}>★</span>
      ))}
    </div>
  )
}

function TestimonialWidget() {
  const [reviews, setReviews] = useState([])
  const [index,   setIndex]   = useState(0)

  useEffect(() => {
    if (!isFirebaseReady) return
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(10))
    const unsub = onSnapshot(q, snap => {
      const top = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.rating >= 4)
      setReviews(top)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (reviews.length < 2) return
    const t = setInterval(() => setIndex(i => (i + 1) % reviews.length), 5000)
    return () => clearInterval(t)
  }, [reviews.length])

  if (reviews.length === 0) return null
  const r = reviews[index]

  return (
    <div className="sticky top-24">
      <p className="text-xs font-bold text-brand-purple uppercase tracking-[0.2em] px-1 mb-4">
        💬 Customer Love
      </p>

      <div className="bg-white rounded-2xl shadow-md p-5 relative overflow-hidden">
        <div className="h-1.5 absolute top-0 left-0 right-0"
          style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />
        <span className="text-4xl text-purple-100 leading-none block mb-1" style={{ fontFamily: 'Georgia, serif' }}>“</span>
        <Stars value={r.rating} />
        <p className="text-sm text-gray-600 leading-relaxed mt-3 italic">
          {r.comment.length > 140 ? `${r.comment.slice(0, 140)}…` : r.comment}
        </p>
        <p className="text-xs font-bold text-brand-purple mt-3">— {r.reviewerName}</p>

        {reviews.length > 1 && (
          <div className="flex gap-1.5 mt-4 justify-center">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className="w-1.5 h-1.5 rounded-full border-0 cursor-pointer p-0 transition-all"
                style={{ background: i === index ? '#3B0764' : '#E5E7EB' }} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-4 rounded-2xl text-center" style={{ background: '#F5F0FF' }}>
        <p className="text-xs text-gray-500">Loved a SephynLuna fragrance?</p>
        <p className="text-xs font-bold text-brand-purple mt-0.5">Leave a review on its product page ✦</p>
      </div>
    </div>
  )
}

export default TestimonialWidget
