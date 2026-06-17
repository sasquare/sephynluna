import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import emailjs from '@emailjs/browser'
import { db, isFirebaseReady } from '../firebase'
import { DELIVERY_ZONES } from '../constants'

const inputBase =
  'w-full px-4 py-3 rounded-lg border text-gray-800 placeholder-gray-400 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all duration-200 hover:border-purple-400'

const inputValid = 'border-purple-200 bg-white'
const inputError = 'border-red-400 bg-red-50 focus:ring-red-300'

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1.5">⚠ {msg}</p>
}

function Label({ htmlFor, children, optional }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-brand-purple mb-1.5">
      {children}
      {optional
        ? <span className="text-gray-400 font-normal ml-1">(optional)</span>
        : <span className="text-brand-gold ml-1">✦</span>}
    </label>
  )
}

function RadioCard({ name, value, selected, onChange, label, icon, locked }) {
  return (
    <label className={
      'flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-xl border-2 text-center ' +
      (locked ? 'cursor-default opacity-90 ' : 'cursor-pointer ') +
      (selected
        ? 'border-brand-purple bg-brand-purple text-white shadow-lg'
        : 'border-purple-100 bg-white text-gray-700 ' + (!locked ? 'hover:border-brand-purple-light hover:shadow-md' : ''))
    }>
      <input type="radio" name={name} value={value} checked={selected}
        onChange={locked ? undefined : onChange} className="sr-only" readOnly={locked} />
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </label>
  )
}

const isPickup = (zone) => zone?.includes('Pick Up')

async function saveOrderToFirestore(orderData) {
  if (!isFirebaseReady) {
    return `demo${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  }
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

async function sendOwnerEmail(orderData, orderId) {
  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) return
  const orderRef  = `#${orderId.substring(0, 8).toUpperCase()}`
  const orderDate = new Date().toLocaleString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      order_id:         orderRef,
      perfume_name:     orderData.perfumeName || 'Not specified',
      customer_name:    orderData.fullName,
      contact_info:     orderData.contactInfo,
      delivery_address: orderData.deliveryAddress || 'N/A',
      perfume_type:     orderData.perfumeType,
      base_type:        orderData.baseType,
      scent_notes:      orderData.scentNotes,
      quantity:         orderData.quantity,
      delivery_zone:    orderData.deliveryZone,
      delivery_fee:     `₦${Number(orderData.deliveryFee).toLocaleString()}`,
      subtotal:         orderData.subtotal != null ? `₦${Number(orderData.subtotal).toLocaleString()}` : 'TBD',
      total_amount:     orderData.totalAmount != null ? `₦${Number(orderData.totalAmount).toLocaleString()}` : 'TBD',
      instructions:     orderData.additionalInstructions || 'None',
      order_date:       orderDate,
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  )
}

// prefill = { perfumeName, perfumeType, baseType, scentNotes, price }
function OrderForm({ onSuccess, prefill = {} }) {
  const defaultZone = DELIVERY_ZONES[0]

  const [form, setForm] = useState({
    fullName:               '',
    contactInfo:            '',
    deliveryZone:           defaultZone.label,
    deliveryFee:            defaultZone.fee,
    deliveryAddress:        '',
    perfumeType:            prefill.perfumeType || '',
    baseType:               prefill.baseType    || '',
    scentNotes:             prefill.scentNotes  || '',
    quantity:               1,
    additionalInstructions: '',
  })
  const [errors,       setErrors]       = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError,  setSubmitError]  = useState('')

  const hasPrefill = Boolean(prefill.perfumeName)
  const unitPrice  = prefill.price ? Number(prefill.price) : null
  const qty        = Number(form.quantity) || 1
  const subtotal   = unitPrice ? unitPrice * qty : null
  const total      = subtotal !== null ? subtotal + form.deliveryFee : null

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())    e.fullName    = 'Please enter your full name'
    if (!form.contactInfo.trim()) e.contactInfo = 'Please enter your WhatsApp number or email'
    if (!form.perfumeType)        e.perfumeType = 'Please select a perfume type'
    if (!form.baseType)           e.baseType    = 'Please select a base type'
    if (!form.scentNotes.trim())  e.scentNotes  = 'Please describe your preferred scent'
    if (!form.quantity || qty < 1) e.quantity   = 'Quantity must be at least 1'
    if (!isPickup(form.deliveryZone) && !form.deliveryAddress.trim())
      e.deliveryAddress = 'Please enter your delivery address'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'deliveryZone') {
      const zone = DELIVERY_ZONES.find(z => z.label === value)
      setForm(prev => ({ ...prev, deliveryZone: value, deliveryFee: zone?.fee ?? 0 }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (submitError)  setSubmitError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate()
    if (Object.keys(found).length > 0) { setErrors(found); return }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const orderData = {
        perfumeName:            prefill.perfumeName || '',
        fullName:               form.fullName,
        contactInfo:            form.contactInfo,
        perfumeType:            form.perfumeType,
        baseType:               form.baseType,
        scentNotes:             form.scentNotes,
        quantity:               qty,
        additionalInstructions: form.additionalInstructions,
        deliveryZone:           form.deliveryZone,
        deliveryFee:            form.deliveryFee,
        deliveryAddress:        isPickup(form.deliveryZone) ? 'Pick Up' : form.deliveryAddress,
        subtotal,
        totalAmount: total,
      }
      const orderId = await saveOrderToFirestore(orderData)
      sendOwnerEmail(orderData, orderId).catch(err => console.warn('Email failed:', err))
      onSuccess(orderData, orderId)
    } catch (err) {
      console.error(err)
      setSubmitError("Couldn't place your order. Check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {hasPrefill && (
        <div className="rounded-xl p-3 text-center" style={{ background: '#F5F0FF' }}>
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-0.5">Ordering</p>
          <p className="text-brand-purple font-bold text-base">{prefill.perfumeName}</p>
        </div>
      )}

      {/* Full Name */}
      <div>
        <Label htmlFor="fullName">Customer Full Name</Label>
        <input id="fullName" type="text" name="fullName" value={form.fullName}
          onChange={handleChange} placeholder="e.g. Amara Johnson"
          className={`${inputBase} ${errors.fullName ? inputError : inputValid}`} />
        <FieldError msg={errors.fullName} />
      </div>

      {/* Contact */}
      <div>
        <Label htmlFor="contactInfo">WhatsApp Number or Email</Label>
        <input id="contactInfo" type="text" name="contactInfo" value={form.contactInfo}
          onChange={handleChange} placeholder="e.g. +234 801 234 5678 or you@email.com"
          className={`${inputBase} ${errors.contactInfo ? inputError : inputValid}`} />
        <FieldError msg={errors.contactInfo} />
      </div>

      {/* Perfume Type */}
      <div>
        <Label>Perfume Type</Label>
        <div className="grid grid-cols-2 gap-3">
          <RadioCard name="perfumeType" value="Brand Perfume" icon="🏷️" label="Brand Perfume"
            selected={form.perfumeType === 'Brand Perfume'} onChange={handleChange}
            locked={hasPrefill} />
          <RadioCard name="perfumeType" value="Custom Blend" icon="🌸" label="Custom Blend"
            selected={form.perfumeType === 'Custom Blend'} onChange={handleChange}
            locked={hasPrefill} />
        </div>
        <FieldError msg={errors.perfumeType} />
      </div>

      {/* Base Type */}
      <div>
        <Label>Base Type</Label>
        <div className="grid grid-cols-2 gap-3">
          <RadioCard name="baseType" value="Oil Based" icon="💧" label="Oil Based"
            selected={form.baseType === 'Oil Based'} onChange={handleChange}
            locked={hasPrefill} />
          <RadioCard name="baseType" value="Alcohol Based" icon="✨" label="Alcohol Based"
            selected={form.baseType === 'Alcohol Based'} onChange={handleChange}
            locked={hasPrefill} />
        </div>
        <FieldError msg={errors.baseType} />
      </div>

      {/* Scent Notes */}
      <div>
        <Label htmlFor="scentNotes">Preferred Scent / Notes</Label>
        <textarea id="scentNotes" name="scentNotes" value={form.scentNotes}
          onChange={handleChange} rows={3} placeholder="Floral with vanilla undertones..."
          className={`${inputBase} resize-none ${errors.scentNotes ? inputError : inputValid}`} />
        <FieldError msg={errors.scentNotes} />
      </div>

      {/* Quantity */}
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <input id="quantity" type="number" name="quantity" value={form.quantity}
          onChange={handleChange} min="1" max="100"
          className={`${inputBase} ${errors.quantity ? inputError : inputValid}`}
          style={{ maxWidth: '160px' }} />
        <FieldError msg={errors.quantity} />
      </div>

      {/* Delivery Zone */}
      <div>
        <Label htmlFor="deliveryZone">Delivery Location</Label>
        <select id="deliveryZone" name="deliveryZone" value={form.deliveryZone}
          onChange={handleChange} className={`${inputBase} ${inputValid}`}>
          {DELIVERY_ZONES.map(z => (
            <option key={z.label} value={z.label}>
              {z.label}{z.fee > 0 ? ` — ₦${z.fee.toLocaleString()}` : ' — FREE'}
            </option>
          ))}
        </select>
      </div>

      {/* Delivery Address (hidden for pickup) */}
      {!isPickup(form.deliveryZone) && (
        <div>
          <Label htmlFor="deliveryAddress">Delivery Address</Label>
          <textarea id="deliveryAddress" name="deliveryAddress" value={form.deliveryAddress}
            onChange={handleChange} rows={3}
            placeholder="House no., street name, area, city, state..."
            className={`${inputBase} resize-none ${errors.deliveryAddress ? inputError : inputValid}`} />
          <FieldError msg={errors.deliveryAddress} />
        </div>
      )}

      {/* Order Total Breakdown */}
      <div className="rounded-xl border border-purple-200 overflow-hidden">
        <div className="px-4 py-2 text-xs font-bold text-brand-purple uppercase tracking-widest text-center"
          style={{ background: '#F5F0FF' }}>
          ✦ Order Total
        </div>
        <div className="p-4 space-y-2">
          {unitPrice ? (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({qty} × ₦{unitPrice.toLocaleString()})</span>
              <span className="font-medium">₦{subtotal.toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Product price</span>
              <span className="italic text-gray-400">Confirmed by Maria</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery fee</span>
            <span className={`font-medium ${form.deliveryFee === 0 ? 'text-green-600' : ''}`}>
              {form.deliveryFee === 0 ? 'FREE (Pick Up)' : `₦${form.deliveryFee.toLocaleString()}`}
            </span>
          </div>
          {total !== null && (
            <div className="flex justify-between font-bold text-brand-purple text-base border-t border-purple-100 pt-2">
              <span>Total Payable</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Additional */}
      <div>
        <Label htmlFor="additionalInstructions" optional>Additional Instructions</Label>
        <textarea id="additionalInstructions" name="additionalInstructions"
          value={form.additionalInstructions} onChange={handleChange} rows={3}
          placeholder="Packaging preferences, delivery notes, gift messages..."
          className={`${inputBase} resize-none ${inputValid}`} />
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex gap-3">
          <span>⚠️</span><span>{submitError}</span>
        </div>
      )}

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-purple-100" />
        <span className="text-brand-gold text-lg">✦</span>
        <div className="flex-1 h-px bg-purple-100" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full py-4 rounded-xl font-bold text-base tracking-widest uppercase shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        style={{
          background: isSubmitting ? '#c9a030' : 'linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)',
          color: '#1E0437',
          boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
        }}>
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Placing Order…
          </>
        ) : <>✦ Place My Order ✦</>}
      </button>

      <p className="text-center text-gray-400 text-xs">
        Fields marked <span className="text-brand-gold font-bold">✦</span> are required
      </p>

      {!isFirebaseReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-amber-700 text-xs font-medium">
            🔧 Demo Mode — orders not saved. Add Firebase credentials in <code className="bg-amber-100 px-1 rounded">.env</code> to go live.
          </p>
        </div>
      )}
    </form>
  )
}

export default OrderForm
