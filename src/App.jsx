import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ScrollTrigger } from './lib/gsap.js';
import GLImageLayer from './gl/GLImageLayer.jsx';
import Preloader from './components/Preloader.jsx';
import Nav from './components/Nav.jsx';
import DrawerMenu from './components/DrawerMenu.jsx';
import DoorTransition from './components/DoorTransition.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ProductSheet from './components/ProductSheet.jsx';
import SoundEffects from './components/SoundEffects.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

const Shop = lazy(() => import('./pages/Shop.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderConfirmed = lazy(() => import('./pages/OrderConfirmed.jsx'));

// Pins and triggers measure the page; re-measure when fonts and images settle.
function useRefreshOnLoad() {
  const { pathname } = useLocation();
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    const t = setTimeout(refresh, 1200);
    return () => {
      window.removeEventListener('load', refresh);
      clearTimeout(t);
    };
  }, [pathname]);
}

export default function App() {
  const location = useLocation();
  useRefreshOnLoad();

  return (
    <>
      <GLImageLayer />
      <SoundEffects />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:rounded-full focus:bg-espresso focus:px-4 focus:py-2 focus:text-linen">
        Skip to content
      </a>
      <Nav />
      <DrawerMenu />
      <main id="main" className="relative z-[1]">
        <Suspense fallback={<div className="min-h-[100svh]" />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderConfirmed />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer key={location.pathname} />
      <CartDrawer />
      <ProductSheet />
      <DoorTransition />
      <Preloader />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
