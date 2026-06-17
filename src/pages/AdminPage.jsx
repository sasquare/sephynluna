import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { auth, db, isFirebaseReady } from '../firebase'
import { CATEGORIES, SIZES, BASE_TYPES, WHOLESALE_CATEGORIES, WHOLESALE_DOZEN_SIZES, WHOLESALE_BULK_SIZES } from '../constants'
import { Link } from 'react-router-dom'

// ─── Login ────────────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      onLogin()
    } catch (err) {
      setError('Incorrect email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #1E0437 0%, #3B0764 100%)' }}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm">
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-brand-gold text-2xl mb-1">✦</p>
            <h1 className="text-2xl font-bold text-brand-purple"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              Admin Access
            </h1>
            <p className="text-gray-400 text-sm mt-1">SephynLuna Perfumery Hub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-purple mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="maria@example.com" required
                className="w-full px-4 py-3 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-purple mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-3 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple" />
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-3">⚠ {error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-60 cursor-pointer border-0"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#1E0437' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/" className="text-brand-purple hover:underline">← Back to store</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Product Form ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', category: CATEGORIES[0], baseType: BASE_TYPES[0],
  size: SIZES[3], price: '', scentNotes: '', description: '',
  inStock: true, featured: false, imageUrl: '',
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form,   setForm]   = useState(initial || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const handleField = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Product name is required.'); return }
    if (!form.price || Number(form.price) <= 0) { setError('Please enter a valid price.'); return }

    setSaving(true)
    setError('')
    try {
      const payload = {
        name:        form.name.trim(),
        category:    form.category,
        baseType:    form.baseType,
        size:        form.size,
        price:       Number(form.price),
        scentNotes:  form.scentNotes.trim(),
        description: form.description.trim(),
        inStock:     form.inStock,
        featured:    form.featured,
        imageUrl:    form.imageUrl.trim(),
      }
      if (initial?.id) {
        await updateDoc(doc(db, 'products', initial.id), payload)
      } else {
        await addDoc(collection(db, 'products'), { ...payload, createdAt: serverTimestamp() })
      }
      onSave()
    } catch (err) {
      console.error(err)
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white'
  const labelCls = 'block text-xs font-bold text-brand-purple uppercase tracking-wide mb-1'

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <h2 className="text-lg font-bold text-brand-purple"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
        {initial ? 'Edit Product' : 'Add New Product'}
      </h2>

      {/* Image URL */}
      <div>
        <label className={labelCls}>Product Photo Link</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleField}
          placeholder="https://i.ibb.co/xxxxx/photo.jpg" className={inputCls} />
        <p className="text-xs text-gray-400 mt-1">
          Upload to <strong>ibb.co</strong> → copy the <em>Direct link</em> (starts with i.ibb.co, ends in .jpg)
        </p>
        {form.imageUrl.trim() && (
          <div className="mt-3 rounded-xl overflow-hidden border border-purple-100 aspect-video bg-purple-50">
            <img src={form.imageUrl.trim()} alt="Preview" className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none' }} />
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className={labelCls}>Product Name *</label>
        <input name="name" value={form.name} onChange={handleField}
          placeholder="e.g. Rose Garden Elixir" className={inputCls} />
      </div>

      {/* Category + Base type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category *</label>
          <select name="category" value={form.category} onChange={handleField} className={inputCls}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Base Type *</label>
          <select name="baseType" value={form.baseType} onChange={handleField} className={inputCls}>
            {BASE_TYPES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Size + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Size *</label>
          <select name="size" value={form.size} onChange={handleField} className={inputCls}>
            {SIZES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Price (₦) *</label>
          <input type="number" name="price" value={form.price} onChange={handleField}
            placeholder="e.g. 15000" min="0" className={inputCls} />
        </div>
      </div>

      {/* Scent Notes */}
      <div>
        <label className={labelCls}>Scent Notes</label>
        <input name="scentNotes" value={form.scentNotes} onChange={handleField}
          placeholder="e.g. Rose, Jasmine, Vanilla, Musk" className={inputCls} />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" value={form.description} onChange={handleField}
          rows={3} placeholder="Describe this fragrance to your customers..."
          className={`${inputCls} resize-none`} />
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleField}
            className="w-4 h-4 accent-brand-purple" />
          <span className="text-sm font-medium text-gray-700">In Stock</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleField}
            className="w-4 h-4 accent-brand-purple" />
          <span className="text-sm font-medium text-gray-700">Featured</span>
        </label>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">⚠ {error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-60 cursor-pointer border-0"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#1E0437' }}>
          {saving ? 'Saving…' : (initial ? 'Save Changes' : 'Add Product')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-3 rounded-xl border-2 border-brand-purple text-brand-purple font-bold text-sm hover:bg-brand-purple hover:text-white transition-all cursor-pointer bg-transparent">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-300 transition-colors">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-purple-50 flex-shrink-0">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category} · {product.size} · ₦{Number(product.price).toLocaleString()}</p>
        <div className="flex gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
          {product.featured && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">⭐ Featured</span>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => onEdit(product)}
          className="text-xs px-3 py-1.5 rounded-lg border border-brand-purple text-brand-purple font-medium hover:bg-brand-purple hover:text-white transition-all cursor-pointer bg-transparent">
          Edit
        </button>
        {confirming ? (
          <div className="flex gap-1">
            <button onClick={() => onDelete(product.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium cursor-pointer border-0">
              Confirm
            </button>
            <button onClick={() => setConfirming(false)}
              className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 cursor-pointer border-0">
              ✕
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all cursor-pointer border-0">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Order Card ───────────────────────────────────────────────────────────────

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
}

function WaIcon() {
  return (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.529 5.844L.057 23.784c-.074.297.199.556.49.471l6.083-1.594A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.021-1.381l-.361-.214-3.736.979.997-3.644-.236-.375A9.8 9.8 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
  )
}

function OrderCard({ order }) {
  const [updating, setUpdating] = useState(false)

  const orderRef = `#${order.id.substring(0, 8).toUpperCase()}`
  const date = order.createdAt?.toDate?.()?.toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) || 'Just now'

  const rawPhone = order.contactInfo?.replace(/\D/g, '') || ''
  const phone = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone
  const waMsg = encodeURIComponent(
    `Hello ${order.fullName}! 🌸 Your SephynLuna order ${orderRef} has been received. We'll be in touch shortly.`
  )
  const waCustomer = phone ? `https://wa.me/${phone}?text=${waMsg}` : null

  const handleStatus = async (newStatus) => {
    if (!db) return
    setUpdating(true)
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: newStatus })
    } catch (err) {
      console.error('Status update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  const status = order.status || 'pending'

  return (
    <div className="bg-white rounded-xl border border-purple-100 hover:border-purple-200 transition-colors overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-50"
        style={{ background: '#FAF5FF' }}>
        <div className="flex items-center gap-3">
          <span className="font-bold text-brand-purple text-sm tracking-wider" style={{ fontFamily: 'monospace' }}>
            {orderRef}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer info */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm">{order.fullName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{order.contactInfo}</p>
            {order.deliveryAddress && order.deliveryAddress !== 'Pick Up' && (
              <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs">{order.deliveryAddress}</p>
            )}
            {order.deliveryAddress === 'Pick Up' && (
              <p className="text-xs text-green-600 mt-0.5 font-medium">📦 Pick Up</p>
            )}
          </div>
          {waCustomer && (
            <a href={waCustomer} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white font-medium flex-shrink-0 transition-opacity hover:opacity-90"
              style={{ background: '#25D366' }}>
              <WaIcon /> Reply
            </a>
          )}
        </div>

        {/* Product details */}
        <div className="rounded-lg p-3 text-xs space-y-1.5" style={{ background: '#F5F0FF' }}>
          {order.perfumeName && (
            <div className="flex justify-between">
              <span className="text-purple-400 font-semibold uppercase tracking-wide">Product</span>
              <span className="text-gray-800 font-medium">{order.perfumeName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-purple-400 font-semibold uppercase tracking-wide">Type</span>
            <span className="text-gray-700">{order.perfumeType} · {order.baseType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400 font-semibold uppercase tracking-wide">Qty</span>
            <span className="text-gray-700 font-medium">{order.quantity}</span>
          </div>
          {order.scentNotes && (
            <div className="flex justify-between">
              <span className="text-purple-400 font-semibold uppercase tracking-wide">Scent</span>
              <span className="text-gray-700 text-right max-w-[60%]">{order.scentNotes}</span>
            </div>
          )}
          {order.deliveryZone && (
            <div className="flex justify-between">
              <span className="text-purple-400 font-semibold uppercase tracking-wide">Delivery</span>
              <span className="text-gray-700">{order.deliveryZone}</span>
            </div>
          )}
        </div>

        {/* Price breakdown */}
        {order.totalAmount != null && (
          <div className="border-t border-purple-100 pt-3 space-y-1.5 text-sm">
            {order.subtotal != null && (
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₦{Number(order.subtotal).toLocaleString()}</span>
              </div>
            )}
            {order.deliveryFee != null && (
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₦${Number(order.deliveryFee).toLocaleString()}`}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-brand-purple">
              <span>Total</span>
              <span>₦{Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Additional notes */}
        {order.additionalInstructions && (
          <p className="text-xs text-gray-500 italic border-t border-purple-50 pt-3">
            📝 {order.additionalInstructions}
          </p>
        )}

        {/* Status selector */}
        <div className="flex items-center gap-2 pt-1 border-t border-purple-50">
          <span className="text-xs text-gray-500 flex-shrink-0">Update status:</span>
          <select value={status} onChange={e => handleStatus(e.target.value)} disabled={updating}
            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-60 cursor-pointer">
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

// ─── Wholesale Form ───────────────────────────────────────────────────────────

const EMPTY_WHOLESALE = {
  name: '', category: 'Dozens', unitSize: '', price: '',
  description: '', imageUrl: '', inStock: true,
}

function WholesaleForm({ initial, onSave, onCancel }) {
  const [form,   setForm]   = useState(initial || EMPTY_WHOLESALE)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const sizeOptions = form.category === 'Dozens' ? WHOLESALE_DOZEN_SIZES : WHOLESALE_BULK_SIZES

  const handleField = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'category') {
      const newSizes = value === 'Dozens' ? WHOLESALE_DOZEN_SIZES : WHOLESALE_BULK_SIZES
      setForm(prev => ({ ...prev, category: value, unitSize: newSizes[0] }))
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim())   { setError('Product name is required.'); return }
    if (!form.unitSize)      { setError('Please select a unit size.'); return }
    if (!form.price || Number(form.price) <= 0) { setError('Please enter a valid price.'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        name:        form.name.trim(),
        category:    form.category,
        unitSize:    form.unitSize,
        price:       Number(form.price),
        description: form.description.trim(),
        imageUrl:    form.imageUrl.trim(),
        inStock:     form.inStock,
      }
      if (initial?.id) {
        await updateDoc(doc(db, 'wholesale_products', initial.id), payload)
      } else {
        await addDoc(collection(db, 'wholesale_products'), { ...payload, createdAt: serverTimestamp() })
      }
      onSave()
    } catch (err) {
      console.error(err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white'
  const labelCls = 'block text-xs font-bold text-brand-purple uppercase tracking-wide mb-1'

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <h2 className="text-lg font-bold text-brand-purple"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
        {initial ? 'Edit Wholesale Product' : 'Add Wholesale Product'}
      </h2>

      {/* Image URL */}
      <div>
        <label className={labelCls}>Product Photo Link</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleField}
          placeholder="https://i.ibb.co/xxxxx/photo.jpg" className={inputCls} />
        <p className="text-xs text-gray-400 mt-1">
          Upload to <strong>ibb.co</strong> → copy the <em>Direct link</em>
        </p>
        {form.imageUrl.trim() && (
          <div className="mt-3 rounded-xl overflow-hidden border border-purple-100 aspect-video bg-purple-50">
            <img src={form.imageUrl.trim()} alt="Preview" className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none' }} />
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className={labelCls}>Product Name *</label>
        <input name="name" value={form.name} onChange={handleField}
          placeholder="e.g. Signature Blend Oil" className={inputCls} />
      </div>

      {/* Category + Unit Size */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category *</label>
          <select name="category" value={form.category} onChange={handleField} className={inputCls}>
            {WHOLESALE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Unit Size *</label>
          <select name="unitSize" value={form.unitSize} onChange={handleField} className={inputCls}>
            <option value="">— Select —</option>
            {sizeOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className={labelCls}>Price (₦) *</label>
        <input type="number" name="price" value={form.price} onChange={handleField}
          placeholder="e.g. 45000" min="0" className={inputCls} style={{ maxWidth: '200px' }} />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" value={form.description} onChange={handleField}
          rows={3} placeholder="e.g. 12 bottles of 15ml custom blend oil perfume..."
          className={`${inputCls} resize-none`} />
      </div>

      {/* In Stock */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleField}
          className="w-4 h-4 accent-brand-purple" />
        <span className="text-sm font-medium text-gray-700">In Stock</span>
      </label>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">⚠ {error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-60 cursor-pointer border-0"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#1E0437' }}>
          {saving ? 'Saving…' : (initial ? 'Save Changes' : 'Add Product')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-3 rounded-xl border-2 border-brand-purple text-brand-purple font-bold text-sm hover:bg-brand-purple hover:text-white transition-all cursor-pointer bg-transparent">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Wholesale Row ─────────────────────────────────────────────────────────────

function WholesaleRow({ product, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-300 transition-colors">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-purple-50 flex-shrink-0">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">💧</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category} · {product.unitSize} · ₦{Number(product.price).toLocaleString()}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => onEdit(product)}
          className="text-xs px-3 py-1.5 rounded-lg border border-brand-purple text-brand-purple font-medium hover:bg-brand-purple hover:text-white transition-all cursor-pointer bg-transparent">
          Edit
        </button>
        {confirming ? (
          <div className="flex gap-1">
            <button onClick={() => onDelete(product.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium cursor-pointer border-0">
              Confirm
            </button>
            <button onClick={() => setConfirming(false)}
              className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 cursor-pointer border-0">
              ✕
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all cursor-pointer border-0">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ onSignOut }) {
  const [activeTab,      setActiveTab]      = useState('products')
  const [products,       setProducts]       = useState([])
  const [orders,         setOrders]         = useState([])
  const [wholesale,      setWholesale]      = useState([])
  const [prodLoad,       setProdLoad]       = useState(true)
  const [ordLoad,        setOrdLoad]        = useState(true)
  const [wsLoad,         setWsLoad]         = useState(true)
  const [view,           setView]           = useState('list')
  const [editing,        setEditing]        = useState(null)
  const [wsView,         setWsView]         = useState('list')
  const [wsEditing,      setWsEditing]      = useState(null)

  useEffect(() => {
    if (!db) { setProdLoad(false); setOrdLoad(false); setWsLoad(false); return }
    const unsub1 = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      snap => { setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setProdLoad(false) }
    )
    const unsub2 = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setOrdLoad(false) }
    )
    const unsub3 = onSnapshot(
      query(collection(db, 'wholesale_products'), orderBy('createdAt', 'desc')),
      snap => { setWholesale(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setWsLoad(false) }
    )
    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'products', id)) }
    catch (err) { console.error('Delete failed:', err) }
  }

  const handleWholesaleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'wholesale_products', id)) }
    catch (err) { console.error('Delete failed:', err) }
  }

  const pendingCount = orders.filter(o => o.status === 'pending' || !o.status).length

  return (
    <div className="min-h-screen" style={{ background: '#FAF5FF' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #1E0437 0%, #3B0764 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-brand-gold text-xs tracking-widest uppercase">Admin Panel</p>
            <h1 className="text-white font-bold text-lg"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              SephynLuna Perfumery Hub
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/" className="text-purple-300 text-xs hover:text-white transition-colors">
              View Store
            </Link>
            <button onClick={onSignOut}
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-400 text-purple-300 hover:bg-purple-800 transition-all cursor-pointer bg-transparent">
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-3xl mx-auto px-4 flex gap-1 pb-0">
          {[
            { key: 'products',  label: 'Products' },
            { key: 'orders',    label: `Orders${pendingCount > 0 ? ` (${pendingCount} new)` : ''}` },
            { key: 'wholesale', label: 'Wholesale' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-0 ${
                activeTab === tab.key
                  ? 'bg-white text-brand-purple'
                  : 'text-purple-300 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Products tab ── */}
        {activeTab === 'products' && (
          <>
            {view === 'list' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-purple"
                      style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                      Your Fragrances
                    </h2>
                    <p className="text-gray-500 text-sm">{products.length} product{products.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setView('add')}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer border-0"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#1E0437' }}>
                    + Add Product
                  </button>
                </div>

                {!isFirebaseReady && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-amber-700 text-sm">
                    🔧 Demo Mode — add Firebase credentials in <code>.env</code> to save products for real.
                  </div>
                )}

                {prodLoad ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-purple-100" />)}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-purple-100">
                    <div className="text-5xl mb-4">🌸</div>
                    <h3 className="font-bold text-brand-purple mb-2">No products yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Add your first fragrance to the catalog.</p>
                    <button onClick={() => setView('add')}
                      className="px-6 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
                      style={{ background: '#3B0764', color: 'white' }}>
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map(p => (
                      <ProductRow key={p.id} product={p}
                        onEdit={prod => { setEditing(prod); setView('edit') }}
                        onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />
                <div className="p-6 md:p-8">
                  <ProductForm
                    initial={view === 'edit' ? editing : null}
                    onSave={() => { setView('list'); setEditing(null) }}
                    onCancel={() => { setView('list'); setEditing(null) }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Wholesale tab ── */}
        {activeTab === 'wholesale' && (
          <>
            {wsView === 'list' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-purple"
                      style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                      Wholesale Products
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {wholesale.length} product{wholesale.length !== 1 ? 's' : ''} · Oil Based Custom Blend
                    </p>
                  </div>
                  <button onClick={() => setWsView('add')}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer border-0"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#1E0437' }}>
                    + Add Product
                  </button>
                </div>

                {wsLoad ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-purple-100" />)}
                  </div>
                ) : wholesale.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-purple-100">
                    <div className="text-5xl mb-4">💧</div>
                    <h3 className="font-bold text-brand-purple mb-2">No wholesale products yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Add dozens or bulk canister products.</p>
                    <button onClick={() => setWsView('add')}
                      className="px-6 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
                      style={{ background: '#3B0764', color: 'white' }}>
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wholesale.map(p => (
                      <WholesaleRow key={p.id} product={p}
                        onEdit={prod => { setWsEditing(prod); setWsView('edit') }}
                        onDelete={handleWholesaleDelete} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3B0764, #D4AF37, #3B0764)' }} />
                <div className="p-6 md:p-8">
                  <WholesaleForm
                    initial={wsView === 'edit' ? wsEditing : null}
                    onSave={() => { setWsView('list'); setWsEditing(null) }}
                    onCancel={() => { setWsView('list'); setWsEditing(null) }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Orders tab ── */}
        {activeTab === 'orders' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-brand-purple"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                  Customer Orders
                </h2>
                <p className="text-gray-500 text-sm">
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                  {pendingCount > 0 && (
                    <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {pendingCount} pending
                    </span>
                  )}
                </p>
              </div>
            </div>

            {ordLoad ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-xl animate-pulse border border-purple-100" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-purple-100">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="font-bold text-brand-purple mb-2">No orders yet</h3>
                <p className="text-gray-500 text-sm">Orders will appear here in real time as customers place them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// ─── Admin Page (root) ────────────────────────────────────────────────────────

function AdminPage() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (!auth) { setUser(null); return }
    return onAuthStateChanged(auth, u => setUser(u || null))
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #1E0437, #3B0764)' }}>
        <div className="text-brand-gold text-4xl animate-pulse">✦</div>
      </div>
    )
  }

  if (!user) return <AdminLogin onLogin={() => {}} />

  return <AdminDashboard onSignOut={handleSignOut} />
}

export default AdminPage
