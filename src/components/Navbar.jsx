import { Link } from 'react-router-dom'
import HeroCarousel from './HeroCarousel'

function Navbar({ showCarousel = false }) {
  return (
    <header className="relative overflow-hidden">
      {showCarousel && <HeroCarousel featuredOnly />}

      {/* Translucent purple veil over the carousel so text stays readable */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, rgba(30,4,55,0.78) 0%, rgba(59,7,100,0.68) 60%, rgba(74,14,143,0.68) 100%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-brand-gold opacity-50 text-lg">─────</span>
          <span className="text-brand-gold text-xl">✦</span>
          <span className="text-brand-gold opacity-50 text-lg">─────</span>
        </div>

        <Link to="/" className="block no-underline">
          <h1
            className="text-white text-4xl md:text-5xl font-bold uppercase"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              letterSpacing: '0.15em',
              textShadow: '0 2px 14px rgba(0,0,0,0.45)',
            }}
          >
            SephynLuna
          </h1>
          <p
            className="text-brand-gold text-lg md:text-xl italic mt-0.5"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', textShadow: '0 2px 10px rgba(0,0,0,0.45)' }}
          >
            Perfumery Hub
          </p>
        </Link>

        <p className="text-purple-100 text-xs tracking-[0.25em] uppercase mt-2"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
          Bespoke Fragrances for the Discerning Soul
        </p>

        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="text-brand-gold opacity-50 text-lg">─────</span>
          <span className="text-brand-gold text-xl">✦</span>
          <span className="text-brand-gold opacity-50 text-lg">─────</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
