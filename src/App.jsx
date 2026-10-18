import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Sheets from './pages/Sheets.jsx'
import SheetPage from './pages/SheetPage.jsx'
import Categories from './pages/Categories.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sheets" element={<Sheets />} />
          <Route path="/sheets/:slug" element={<SheetPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:cat" element={<Sheets />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
