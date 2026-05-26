import { useState } from 'react';
import { siteConfig } from '../data/content';

const NAV_ITEMS = [
  { label: 'IT',          page: 'it' },
  { label: 'Design',      page: 'design' },
  { label: 'Photography', page: 'photo' },
  { label: 'About',       page: 'about' },
];

export default function Header({ currentPage, onNavigate, onOpenContact }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(page) {
    onNavigate(page);
    setMenuOpen(false);
  }

  function handleContact() {
    onOpenContact();
    setMenuOpen(false);
  }

  return (
    <>
      <header>
        <a className="nav-brand" onClick={() => handleNav('home')} href="#">
          {siteConfig.brand}
        </a>

        <nav className="nav-links">
          {NAV_ITEMS.map(({ label, page }) => (
            <a
              key={page}
              className={currentPage === page ? 'active' : ''}
              onClick={() => handleNav(page)}
              data-page={page}
            >
              {label}
            </a>
          ))}
          <a onClick={handleContact}>Contact</a>
        </nav>

        <button
          className={`burger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_ITEMS.map(({ label, page }) => (
          <a key={page} onClick={() => handleNav(page)}>{label}</a>
        ))}
        <a onClick={handleContact}>Contact</a>
      </div>
    </>
  );
}
