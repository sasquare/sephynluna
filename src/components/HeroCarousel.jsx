import { useState, useEffect } from 'react'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db, isFirebaseReady } from '../firebase'

function HeroCarousel() {
  const [images, setImages] = useState([])

  useEffect(() => {
    if (!isFirebaseReady) return
    const load = async () => {
      try {
        let snap = await getDocs(query(collection(db, 'products'), where('featured', '==', true), limit(8)))
        if (snap.empty) {
          snap = await getDocs(query(collection(db, 'products'), limit(8)))
        }
        setImages(snap.docs.map(d => d.data().imageUrl).filter(Boolean))
      } catch (err) {
        console.error('Failed to load carousel images:', err)
      }
    }
    load()
  }, [])

  if (images.length === 0) return null

  // duplicated strip for a seamless infinite loop
  const strip = [...images, ...images]

  return (
    <div className="absolute inset-0">
      <div className="flex h-full animate-marquee">
        {strip.map((src, i) => (
          <img key={i} src={src} alt=""
            className="h-full w-[280px] sm:w-[360px] object-cover flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel
