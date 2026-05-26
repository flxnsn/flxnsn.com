import { useState, useEffect, useRef } from 'react';

import Header        from './components/Header';
import Footer        from './components/Footer';
import ContactModal  from './components/ContactModal';
import PageHome      from './components/PageHome';
import PageIT        from './components/PageIT';
import PageDesign    from './components/PageDesign';
import PagePhoto     from './components/PagePhoto';
import PageAbout     from './components/PageAbout';
import PageImpressum from './components/PageImpressum';

const PAGES = ['home', 'it', 'design', 'photo', 'about', 'impressum'];

const PAGE_COMPONENTS = {
  home:      PageHome,
  it:        PageIT,
  design:    PageDesign,
  photo:     PagePhoto,
  about:     PageAbout,
  impressum: PageImpressum,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [contactOpen, setContactOpen] = useState(false);
  const pageRefs = useRef({});

  function navigate(page) {
    if (!PAGES.includes(page)) return;
    setCurrentPage(page);
    setTimeout(() => {
      const el = pageRefs.current[page];
      if (el) el.scrollTop = 0;
    }, 0);
  }

  // Global Escape → close contact modal
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && contactOpen) setContactOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [contactOpen]);

  return (
    <>
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenContact={() => setContactOpen(true)}
      />

      <main>
        {PAGES.map((page) => {
          const isActive    = page === currentPage;
          const PageContent = PAGE_COMPONENTS[page];
          return (
            <div
              key={page}
              ref={el => { pageRefs.current[page] = el; }}
              className={`page${isActive ? ' active' : ''}`}
              id={`page-${page}`}
            >
              <PageContent
                onNavigate={navigate}
                onOpenContact={() => setContactOpen(true)}
              />
            </div>
          );
        })}
      </main>

      <Footer
        onNavigate={navigate}
        onOpenContact={() => setContactOpen(true)}
      />

      {contactOpen && (
        <ContactModal onClose={() => setContactOpen(false)} />
      )}
    </>
  );
}
