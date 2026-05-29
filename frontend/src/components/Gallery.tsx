import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories } from "../data/content";
import type { Photo } from "../types";
import { fetchPhotos } from "../utils/api";
import { ErrorBoundary } from "./ErrorBoundary";

const fallbackPhotos: Photo[] = [
  {
    id: "fallback-1",
    title: "Francesinha champagne",
    category: "Gel",
    filename: "fallback-1",
    mimeType: "image/webp",
    size: 0,
    url: "",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "fallback-2",
    title: "Rosa cromado",
    category: "Nail Art",
    filename: "fallback-2",
    mimeType: "image/webp",
    size: 0,
    url: "",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "fallback-3",
    title: "Acrilico almond",
    category: "Acrilico",
    filename: "fallback-3",
    mimeType: "image/webp",
    size: 0,
    url: "",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "fallback-4",
    title: "Blindagem natural",
    category: "Blindagem",
    filename: "fallback-4",
    mimeType: "image/webp",
    size: 0,
    url: "",
    createdAt: "2026-01-01T00:00:00.000Z"
  }
];

function GalleryContent(): JSX.Element {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPhotos(): Promise<void> {
      setLoading(true);
      setError("");

      try {
        const nextPhotos = await fetchPhotos(controller.signal);
        setPhotos(nextPhotos);
      } catch {
        if (!controller.signal.aborted) {
          setError("Galeria online indisponivel agora. Mostrando referencias elegantes.");
          setPhotos([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPhotos();

    return () => controller.abort();
  }, []);

  const visiblePhotos = useMemo(() => {
    const source = photos.length > 0 ? photos : fallbackPhotos;

    if (filter === "Todos") {
      return source;
    }

    return source.filter((photo) => photo.category === filter);
  }, [filter, photos]);

  return (
    <>
      <div className="section-heading reveal-up">
        <p className="section-kicker">Portfolio</p>
        <h2>Trabalhos com acabamento de perto.</h2>
        <p>
          A galeria e alimentada pelo painel administrativo. Quando o backend ainda nao tem fotos,
          mostramos referencias visuais no mesmo padrao estetico.
        </p>
      </div>

      <div className="filter-bar reveal-up" role="tablist" aria-label="Filtrar portfolio">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={filter === category ? "is-active" : ""}
            onClick={() => setFilter(category)}
            role="tab"
            aria-selected={filter === category}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="gallery-grid" aria-label="Carregando portfolio">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="gallery-skeleton shimmer-surface" key={index} />
          ))}
        </div>
      ) : (
        <>
          {error ? <p className="inline-note reveal-up">{error}</p> : null}
          <motion.div layout className="gallery-grid">
            <AnimatePresence mode="popLayout">
              {visiblePhotos.map((photo, index) => (
                <motion.button
                  type="button"
                  className={`gallery-item gallery-item--${(index % 4) + 1}`}
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.28, delay: index * 0.03 }}
                  onClick={() => setActivePhoto(photo)}
                >
                  {photo.url ? (
                    <img src={photo.url} alt={photo.title} loading="lazy" />
                  ) : (
                    <span className="gallery-placeholder" aria-hidden="true" />
                  )}
                  <span className="gallery-overlay">
                    <strong>{photo.title}</strong>
                    <small>{photo.category}</small>
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {activePhoto ? (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.title}
          >
            <motion.div
              className="lightbox__content"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="lightbox__close" onClick={() => setActivePhoto(null)}>
                Fechar
              </button>
              {activePhoto.url ? (
                <img src={activePhoto.url} alt={activePhoto.title} />
              ) : (
                <span className="gallery-placeholder gallery-placeholder--large" aria-hidden="true" />
              )}
              <h3>{activePhoto.title}</h3>
              <p>{activePhoto.category}</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function Gallery(): JSX.Element {
  return (
    <ErrorBoundary label="galeria">
      <GalleryContent />
    </ErrorBoundary>
  );
}
