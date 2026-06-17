import { Link } from 'react-router-dom'
import { MARIA_WHATSAPP } from '../constants'

function WaIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.529 5.844L.057 23.784c-.074.297.199.556.49.471l6.083-1.594A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.021-1.381l-.361-.214-3.736.979.997-3.644-.236-.375A9.8 9.8 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
  )
}

function SuccessMessage({ orderData, orderId, onNewOrder }) {
  const isDemoOrder = orderId.startsWith('demo')
  const orderRef    = isDemoOrder ? '#DEMO-MODE' : `#${orderId.substring(0, 8).toUpperCase()}`

  const waLines = [
    `🌸 *New Order — SephynLuna Perfumery Hub*`,
    `Order Ref: ${orderRef}`,
    ``,
    `*Customer:* ${orderData.fullName}`,
    `*Contact:* ${orderData.contactInfo}`,
    orderData.deliveryAddress && orderData.deliveryAddress !== 'Pick Up'
      ? `*Address:* ${orderData.deliveryAddress}`
      : `*Delivery:* Pick Up`,
    ``,
    orderData.perfumeName ? `*Product:* ${orderData.perfumeName}` : null,
    `*Type:* ${orderData.perfumeType}`,
    `*Base:* ${orderData.baseType}`,
    `*Scent Notes:* ${orderData.scentNotes}`,
    `*Quantity:* ${orderData.quantity}`,
    ``,
    orderData.subtotal != null
      ? `*Subtotal:* ₦${Number(orderData.subtotal).toLocaleString()}`
      : null,
    orderData.deliveryZone
      ? `*Delivery (${orderData.deliveryZone}):* ${orderData.deliveryFee === 0 ? 'FREE' : `₦${Number(orderData.deliveryFee).toLocaleString()}`}`
      : null,
    orderData.totalAmount != null
      ? `*TOTAL: ₦${Number(orderData.totalAmount).toLocaleString()}*`
      : null,
    orderData.additionalInstructions
      ? `\n*Notes:* ${orderData.additionalInstructions}`
      : null,
  ].filter(Boolean).join('\n')

  const waUrl = `https://wa.me/${MARIA_WHATSAPP}?text=${encodeURIComponent(waLines)}`

  return (
    <div className="text-center py-4">

      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', boxShadow: '0 8px 30px rgba(212,175,55,0.35)' }}>
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-brand-purple mb-2"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
        Order Received!
      </h2>

      <p className="text-gray-500 text-sm mb-5 leading-relaxed max-w-sm mx-auto">
        Thank you, <span className="font-semibold text-brand-purple">{orderData.fullName}</span>!
        We'll reach out at{' '}
        <span className="font-medium text-brand-purple break-all">{orderData.contactInfo}</span> soon.
      </p>

      <div className="rounded-xl p-4 mb-5"
        style={{ background: 'linear-gradient(135deg, #1E0437, #3B0764)' }}>
        <p className="text-purple-300 text-xs uppercase tracking-[0.2em] mb-2">Your Order Reference</p>
        <p className="text-brand-gold text-3xl font-bold tracking-widest" style={{ fontFamily: 'monospace' }}>
          {orderRef}
        </p>
        <p className="text-purple-300 text-xs mt-2">Screenshot this for your records</p>
      </div>

      {/* WhatsApp button */}
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-base text-white mb-5 transition-opacity hover:opacity-90"
        style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}>
        <WaIcon />
        Send Order to Maria on WhatsApp
      </a>

      {/* Order Summary */}
      <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 mb-6 text-left">
        <p className="text-xs font-bold text-brand-purple tracking-[0.2em] uppercase mb-4 text-center">✦ Order Summary ✦</p>
        <div className="space-y-3">
          {orderData.perfumeName && <SummaryRow label="Perfume"  value={orderData.perfumeName} />}
          <SummaryRow label="Type"     value={orderData.perfumeType} />
          <SummaryRow label="Base"     value={orderData.baseType} />
          <SummaryRow label="Quantity" value={orderData.quantity} />
          <SummaryRow label="Scent"    value={orderData.scentNotes} multiLine />
          {orderData.deliveryZone && <SummaryRow label="Delivery" value={orderData.deliveryZone} />}
          {orderData.deliveryAddress && orderData.deliveryAddress !== 'Pick Up' && (
            <SummaryRow label="Address" value={orderData.deliveryAddress} multiLine />
          )}
          {orderData.additionalInstructions && (
            <SummaryRow label="Notes" value={orderData.additionalInstructions} multiLine />
          )}
        </div>

        {(orderData.subtotal != null || orderData.deliveryFee != null) && (
          <div className="mt-4 pt-4 border-t border-purple-200 space-y-2">
            {orderData.subtotal != null && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₦{Number(orderData.subtotal).toLocaleString()}</span>
              </div>
            )}
            {orderData.deliveryFee != null && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={orderData.deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {orderData.deliveryFee === 0 ? 'FREE' : `₦${Number(orderData.deliveryFee).toLocaleString()}`}
                </span>
              </div>
            )}
            {orderData.totalAmount != null && (
              <div className="flex justify-between font-bold text-brand-purple pt-1 border-t border-purple-200">
                <span>Total Payable</span>
                <span>₦{Number(orderData.totalAmount).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-purple-100" />
        <span className="text-brand-gold text-lg">✦</span>
        <div className="flex-1 h-px bg-purple-100" />
      </div>

      <Link to="/"
        className="block w-full py-3.5 rounded-xl border-2 border-brand-purple text-brand-purple font-bold text-sm tracking-widest uppercase hover:bg-brand-purple hover:text-white transition-all duration-300 text-center mb-3">
        ← Back to Collection
      </Link>

      <button onClick={onNewOrder}
        className="block w-full py-3 rounded-xl text-gray-500 text-sm hover:text-brand-purple transition-colors cursor-pointer bg-transparent border-0">
        Place Another Order
      </button>

      {isDemoOrder ? (
        <p className="text-xs text-amber-600 mt-4 bg-amber-50 rounded-lg p-3">
          🔧 <strong>Demo submission</strong> — nothing was saved. Add Firebase credentials to go live.
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-4">Quote your reference when contacting us on WhatsApp.</p>
      )}
    </div>
  )
}

function SummaryRow({ label, value, multiLine }) {
  return (
    <div className={`flex ${multiLine ? 'flex-col gap-0.5' : 'items-center justify-between'}`}>
      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-gray-700 ${multiLine ? '' : 'text-right font-medium'}`}>{value}</span>
    </div>
  )
}

export default SuccessMessage
