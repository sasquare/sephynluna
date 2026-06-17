import { Link } from 'react-router-dom'
import { MARIA_WHATSAPP } from '../constants'

function WaIcon() {
  return (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.529 5.844L.057 23.784c-.074.297.199.556.49.471l6.083-1.594A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.021-1.381l-.361-.214-3.736.979.997-3.644-.236-.375A9.8 9.8 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
  )
}

function ProductCard({ product }) {
  const waText = encodeURIComponent(
    `Hello Maria! 🌸 I'm interested in:\n\n` +
    `*Product:* ${product.name}\n` +
    `*Size:* ${product.size}\n` +
    `*Price:* ₦${Number(product.price).toLocaleString()}\n\n` +
    `Please let me know availability and how to proceed.`
  )
  const waUrl = `https://wa.me/${MARIA_WHATSAPP}?text=${waText}`

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
      <Link to={`/product/${product.id}`} className="block flex-1 flex flex-col">

        {/* Image */}
        <div className="aspect-square bg-purple-50 overflow-hidden flex-shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🌸
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 flex flex-col flex-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 self-start"
            style={{ background: '#F5F0FF', color: '#3B0764' }}
          >
            {product.category}
          </span>

          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 flex-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <span>{product.size}</span>
            <span>·</span>
            <span>{product.baseType === 'Oil Based' ? '💧 Oil' : '✨ Alcohol'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-base" style={{ color: '#3B0764' }}>
              ₦{Number(product.price).toLocaleString()}
            </span>
            {!product.inStock && (
              <span className="text-xs text-red-500 font-medium">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>

      {/* WhatsApp quick enquiry */}
      <div className="px-4 pb-4">
        {product.inStock ? (
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl font-bold text-xs text-white transition-opacity hover:opacity-90"
            style={{ background: '#25D366' }}>
            <WaIcon /> WhatsApp
          </a>
        ) : (
          <div className="w-full py-2 rounded-xl text-center text-xs text-red-500 bg-red-50 border border-red-100">
            Currently Unavailable
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
