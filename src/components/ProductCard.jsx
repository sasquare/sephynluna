import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col">

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

          <div className="flex items-center justify-between mt-auto">
            <span className="font-bold text-base" style={{ color: '#3B0764' }}>
              ₦{Number(product.price).toLocaleString()}
            </span>
            {!product.inStock && (
              <span className="text-xs text-red-500 font-medium">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
