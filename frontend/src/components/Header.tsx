import { type MouseEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { navItems } from "../data/content";

export function Header(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lockedScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    lockedScrollY.current = window.scrollY;
    document.body.classList.add("menu-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, lockedScrollY.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeAndScrollTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setOpen(false);

    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    }, 0);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""} ${open ? "site-header--menu-open" : ""}`}>
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
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu__inner" role="dialog" aria-modal="true" aria-label="Menu principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={(event) => closeAndScrollTo(event, item.href)}>
              {item.label}
            </a>
          ))}
          <a href="#contato" className="header-cta shimmer" onClick={(event) => closeAndScrollTo(event, "#contato")}>
            Agendar agora
          </a>
          <Link to="/admin/login" className="admin-link" onClick={() => setOpen(false)}>
            Admin
          </Link>
        </div>
      </div>
    </>
  );
}
