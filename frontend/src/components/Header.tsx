import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { navItems } from "../data/content";

export function Header(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <a href="#inicio" className="logo" aria-label="Aline Studio inicio">
        Aline Studio
      </a>
      <nav className="desktop-nav" aria-label="Navegacao principal">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-cta shimmer" href="#contato">
        Agendar
      </a>
      <button
        className={`menu-toggle ${open ? "is-open" : ""}`}
        type="button"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
        <a href="#contato" className="header-cta shimmer" onClick={() => setOpen(false)}>
          Agendar agora
        </a>
        <Link to="/admin/login" className="admin-link" onClick={() => setOpen(false)}>
          Admin
        </Link>
      </div>
    </header>
  );
}
