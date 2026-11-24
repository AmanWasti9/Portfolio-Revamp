import { Route, Routes, useLocation } from "react-router-dom";
import { TransitionProvider } from "./components/Transition";
import { Nav } from "./components/Nav";
import { CursorLabel } from "./components/Motion";
import { ContactBlock } from "./components/ContactBlock";
import Home from "./pages/Home";
import Work from "./pages/Work";
import CaseStudy from "./pages/CaseStudy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function Footer() {
  const { pathname } = useLocation();
  const known = ["/", "/work", "/about", "/contact"].includes(pathname) || pathname.startsWith("/work/");
  if (!known) return null;
  return <ContactBlock key={pathname} compact={pathname === "/contact"} />;
}

export default function App() {
  return (
    <TransitionProvider>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Nav />
      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <CursorLabel />
      <div className="grain" aria-hidden="true" />
    </TransitionProvider>
  );
}
