import { useEffect, useState } from 'react';
import { NAV_ITEMS, type NavItem } from '../data/mosslineData';

interface NavbarProps {
  onOpenContact: () => void;
  onNavigateItem: (item: NavItem) => void;
  onScrollTop: () => void;
}

export function Navbar({ onOpenContact, onNavigateItem, onScrollTop }: NavbarProps) {
  const [overSolutions, setOverSolutions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const sol = document.getElementById('solutions');
      if (!sol) return;
      const rect = sol.getBoundingClientRect();
      setOverSolutions(rect.top <= 90);
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const handleNavClick = (item: NavItem) => {
    setMobileOpen(false);
    onNavigateItem(item);
  };

  return (
    <header className={`ml-nav ${overSolutions ? 'scrolled-panel' : ''}`}>
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          setMobileOpen(false);
          onScrollTop();
        }}
        className="ml-logo"
        aria-label="Mossline home"
      >
        <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 2l12 7v14l-12 7-12-7V9z" fill="currentColor" />
          <path
            d="M16 8c-4 4-5 9-1 16 1-5 4-9 8-11-3 0-5 1-7 3 0-3 0-5 0-8z"
            fill="#c6f35c"
          />
        </svg>
        <span>Mossline</span>
      </a>

      <nav className="ml-menu" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item)}
            className="ml-menu-link"
            title={item.summary}
          >
            <span>{item.label}</span>
            <span className="ml-chevron" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="ml-talk-wrap">
        <button
          type="button"
          onClick={onOpenContact}
          className="ml-talk"
        >
          <span>LET&apos;S TALK</span>
          <span className="ml-talk-sq" aria-hidden="true">
            ›
          </span>
        </button>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-[#10291a]/20 bg-[#f6f7f4]/80 text-[#10291a]"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="mono text-[10px] tracking-normal">{mobileOpen ? '✕' : '≡'}</span>
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed top-[68px] left-4 right-4 rounded-xl bg-[#f6f7f4]/95 backdrop-blur-md border border-[#10291a]/12 p-4 shadow-xl flex flex-col gap-3"
          role="dialog"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              className="flex items-center justify-between py-2 px-2 text-left border-b border-[#10291a]/10 last:border-b-0"
            >
              <span className="mono text-[#10291a]">{item.label}</span>
              <span className="text-xs text-[#2c4434]">›</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
