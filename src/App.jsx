import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CatalogPage   from './pages/CatalogPage'
import ProductPage   from './pages/ProductPage'
import AdminPage     from './pages/AdminPage'
import WholesalePage from './pages/WholesalePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<CatalogPage />}   />
        <Route path="/product/:id" element={<ProductPage />}   />
        <Route path="/wholesale"   element={<WholesalePage />} />
        <Route path="/admin"       element={<AdminPage />}     />
      </Routes>
    </BrowserRouter>
  )
}

export default App
