import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseReady } from '../firebase'

function BlogSidebar() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!isFirebaseReady) return
    const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'), limit(2))
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  if (posts.length === 0) return null

  return (
    <div className="sticky top-24 space-y-4">
      <p className="text-xs font-bold text-brand-purple uppercase tracking-[0.2em] px-1">
        ✦ Maria's Perfume Journal
      </p>
      {posts.map(post => (
        <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-md">
          {post.imageUrl && (
            <div className="aspect-[16/9] bg-purple-50 overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-4">
            <h3 className="font-bold text-sm text-gray-900 mb-1.5 leading-snug"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              {post.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">{post.content}</p>
            <p className="text-[10px] text-gray-400 mt-3">
              {post.createdAt?.toDate?.()?.toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric',
              }) || ''}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

export default BlogSidebar
