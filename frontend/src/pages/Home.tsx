import { type CSSProperties, useRef } from "react";
import heroNails from "../assets/hero-nails.png";
import { Header } from "../components/Header";
import { ServiceIcon } from "../components/ServiceIcon";
import { Gallery } from "../components/Gallery";
import { TestimonialCarousel } from "../components/TestimonialCarousel";
import { SectionParticles } from "../components/SectionParticles";
import { services } from "../data/content";
import { useParallax } from "../hooks/useParallax";
import { useScrollReveal } from "../hooks/useScrollReveal";

const whatsappUrl =
  "https://wa.me/5500000000000?text=Oi%2C%20Aline%20Studio!%20Quero%20agendar%20um%20horario.";

function splitLetters(text: string): JSX.Element[] {
  let letterIndex = 0;

  return text.split(" ").map((word, wordIndex) => (
    <span className="word" key={`${word}-${wordIndex}`}>
      {Array.from(word).map((letter) => {
        const currentIndex = letterIndex;
        letterIndex += 1;

        return (
          <span key={`${letter}-${currentIndex}`} style={{ "--letter-index": currentIndex } as CSSProperties}>
            {letter}
          </span>
        );
      })}
      {wordIndex < text.split(" ").length - 1 ? "\u00a0" : null}
    </span>
  ));
}

export function Home(): JSX.Element {
  const heroImageRef = useRef<HTMLImageElement | null>(null);

  useScrollReveal();
  useParallax(heroImageRef, 0.12);

  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="hero" id="inicio">
          <SectionParticles />
          <div className="hero__media" aria-hidden="true">
            <img ref={heroImageRef} src={heroNails} alt="" />
          </div>
          <div className="hero__overlay" />
          <div className="container hero__content">
            <p className="accent-line">Nail design autoral em atmosfera de luxo</p>
            <h1 aria-label="Unhas feitas para serem lembradas">{splitLetters("Unhas feitas para serem lembradas")}</h1>
            <p className="typewriter">Gel, acrilico, nail art e blindagem com acabamento editorial.</p>
            <div className="hero__actions">
              <a className="btn btn--ghost" href="#portfolio">
                Ver Portfolio
              </a>
              <a className="btn btn--primary shimmer" href="#contato">
                Agendar Agora
              </a>
            </div>
          </div>
          <a href="#sobre" className="scroll-down" aria-label="Ir para sobre nos">
            <span />
          </a>
        </section>

        <section className="section about" id="sobre">
          <div className="container about__grid">
            <div className="about__copy reveal-left">
              <p className="section-kicker">Sobre nos</p>
              <h2>Precisao tecnica com olhar de atelier.</h2>
              <p>
                O Aline Studio une biosseguranca, curadoria de materiais e design personalizado para criar unhas
                que funcionam no close da camera e na rotina real. Cada atendimento comeca com analise da estrutura
                natural, estilo da cliente e durabilidade esperada.
              </p>
              <div className="metrics" data-stagger>
                <div>
                  <strong>500+</strong>
                  <span>clientes</span>
                </div>
                <div>
                  <strong>3</strong>
                  <span>anos</span>
                </div>
                <div>
                  <strong>98%</strong>
                  <span>satisfacao</span>
                </div>
              </div>
            </div>
            <div className="about__frame reveal-right">
              <img src={heroNails} alt="Maos com nail art fucsia e dourada em fundo escuro" loading="lazy" />
            </div>
          </div>
        </section>

        <section className="section services" id="servicos">
          <div className="container">
            <div className="section-heading reveal-up">
              <p className="section-kicker">Servicos</p>
              <h2>Menu enxuto. Execucao sem improviso.</h2>
              <p>Servicos pensados para resistencia, acabamento e manutencao inteligente.</p>
            </div>
            <div className="service-grid reveal-up" data-stagger>
              {services.map((service) => (
                <article className="service-card" key={service.name}>
                  <div className="service-card__icon">
                    <ServiceIcon icon={service.icon} />
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <strong>{service.price}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section portfolio" id="portfolio">
          <div className="container">
            <Gallery />
          </div>
        </section>

        <section className="section testimonials" id="depoimentos">
          <div className="container">
            <div className="section-heading reveal-up">
              <p className="section-kicker">Depoimentos</p>
              <h2>Clientes que voltam antes da unha pedir manutencao.</h2>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        <section className="section contact" id="contato">
          <div className="container contact__grid">
            <div className="contact__copy reveal-left">
              <p className="section-kicker">Agendamento</p>
              <h2>Agende seu horario direto pelo WhatsApp.</h2>
              <p>
                Fale com a Aline, envie sua referencia de unha e combine o melhor horario sem formulario no site.
              </p>
              <div className="contact-links">
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
                <span>Ceilândia Norte</span>
              </div>
            </div>
            <aside className="whatsapp-card reveal-right" aria-label="Agendamento pelo WhatsApp">
              <p className="section-kicker">Contato rapido</p>
              <h3>Atendimento sem friccao.</h3>
              <p>
                Clique no botao, mande sua ideia e receba as opcoes de horario pelo WhatsApp. Simples, rastreavel e
                melhor para responder rapido.
              </p>
              <div className="whatsapp-steps">
                <span>1. Envie a referencia</span>
                <span>2. Escolha o horario</span>
                <span>3. Confirme o atendimento</span>
              </div>
              <a className="btn btn--primary shimmer" href={whatsappUrl} target="_blank" rel="noreferrer">
                Chamar no WhatsApp
              </a>
            </aside>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__line" aria-hidden="true" />
        <div className="container footer__inner">
          <a href="#inicio" className="logo">
            Aline Studio
          </a>
          <nav aria-label="Links do rodape">
            <a href="#servicos">Servicos</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contato">Contato</a>
            <a href="/admin/login">Admin</a>
          </nav>
          <p>Feito com cuidado para Aline Studio.</p>
        </div>
      </footer>
    </div>
  );
}
