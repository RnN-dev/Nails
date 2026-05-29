import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import type { Photo } from "../types";
import { deletePhoto, fetchPhotos, updatePhoto, uploadPhoto } from "../utils/api";
import { clearToken } from "../utils/auth";
import { RippleButton } from "../components/RippleButton";
import { ErrorBoundary } from "../components/ErrorBoundary";

const validTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxUploadBytes = 5 * 1024 * 1024;

type DraftUpload = {
  file: File;
  preview: string;
  base64: string;
  title: string;
  category: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("INVALID_FILE"));
      }
    };
    reader.onerror = () => reject(new Error("INVALID_FILE"));
    reader.readAsDataURL(file);
  });
}

function validateFile(file: File): string {
  if (!validTypes.has(file.type)) {
    return "Use JPG, PNG ou WEBP.";
  }

  if (file.size > maxUploadBytes) {
    return "A imagem deve ter no maximo 5MB.";
  }

  return "";
}

function DashboardContent(): JSX.Element {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<DraftUpload | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);

  const totalSize = useMemo(
    () => photos.reduce((total, photo) => total + photo.size, 0) / 1024 / 1024,
    [photos]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function load(): Promise<void> {
      try {
        const records = await fetchPhotos(controller.signal);
        setPhotos(records);
      } catch {
        if (!controller.signal.aborted) {
          toast.error("Nao foi possivel carregar fotos.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  async function consumeFile(file: File): Promise<void> {
    const error = validateFile(file);

    if (error) {
      toast.error(error);
      return;
    }

    const base64 = await fileToBase64(file);
    setDraft({
      file,
      preview: URL.createObjectURL(file),
      base64,
      title: file.name.replace(/\.[^.]+$/, ""),
      category: "Nail Art"
    });
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file) {
      await consumeFile(file);
    }

    event.target.value = "";
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>): Promise<void> {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      await consumeFile(file);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!draft) {
      return;
    }

    setSaving(true);

    try {
      const uploaded = await uploadPhoto({
        title: draft.title,
        category: draft.category,
        filename: draft.file.name,
        image: draft.base64
      });
      setPhotos((current) => [uploaded, ...current]);
      URL.revokeObjectURL(draft.preview);
      setDraft(null);
      toast.success("Foto publicada");
    } catch {
      toast.error("Upload recusado. Verifique tipo, tamanho e login.");
    } finally {
      setSaving(false);
    }
  }

  async function handleInlineSave(photo: Photo, nextTitle: string, nextCategory: string): Promise<void> {
    try {
      const updated = await updatePhoto(photo.id, { title: nextTitle, category: nextCategory });
      setPhotos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Foto atualizada");
    } catch {
      toast.error("Nao foi possivel atualizar.");
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) {
      return;
    }

    try {
      await deletePhoto(deleteTarget.id);
      setPhotos((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Foto removida");
    } catch {
      toast.error("Nao foi possivel remover.");
    }
  }

  function logout(): void {
    clearToken();
    navigate("/admin/login", { replace: true });
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="logo">
          Aline Studio
        </a>
        <nav aria-label="Admin">
          <a href="#upload">Upload</a>
          <a href="#fotos">Fotos</a>
        </nav>
        <RippleButton type="button" variant="ghost" onClick={logout}>
          Sair
        </RippleButton>
      </aside>

      <section className="admin-main">
        <header className="admin-main__header">
          <div>
            <p className="section-kicker">Dashboard</p>
            <h1>Portfolio administravel</h1>
          </div>
          <div className="admin-stats">
            <span>{photos.length} fotos</span>
            <span>{totalSize.toFixed(1)} MB</span>
          </div>
        </header>

        <section className="upload-panel" id="upload">
          <label
            className="dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            <strong>Arraste uma foto ou clique para selecionar</strong>
            <span>JPG, PNG ou WEBP ate 5MB.</span>
          </label>

          {draft ? (
            <form className="upload-preview" onSubmit={handleUpload}>
              <img src={draft.preview} alt="Preview da foto selecionada" />
              <label className="floating-field">
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder=" "
                  required
                />
                <span>Titulo</span>
              </label>
              <label className="floating-field">
                <select
                  value={draft.category}
                  onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                  required
                >
                  <option>Gel</option>
                  <option>Nail Art</option>
                  <option>Acrilico</option>
                  <option>Blindagem</option>
                  <option>Classica</option>
                </select>
                <span>Categoria</span>
              </label>
              <div className="button-row">
                <RippleButton type="submit" disabled={saving}>
                  {saving ? "Publicando..." : "Confirmar upload"}
                </RippleButton>
                <RippleButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    URL.revokeObjectURL(draft.preview);
                    setDraft(null);
                  }}
                >
                  Cancelar
                </RippleButton>
              </div>
            </form>
          ) : null}
        </section>

        <section className="admin-photo-grid" id="fotos" aria-live="polite">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => <div className="gallery-skeleton shimmer-surface" key={index} />)
          ) : photos.length === 0 ? (
            <p className="inline-note">Nenhuma foto cadastrada ainda.</p>
          ) : (
            photos.map((photo) => (
              <AdminPhotoCard
                key={photo.id}
                photo={photo}
                onSave={handleInlineSave}
                onDelete={() => setDeleteTarget(photo)}
              />
            ))
          )}
        </section>
      </section>

      <AnimatePresence>
        {deleteTarget ? (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="confirm-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h2>Remover foto?</h2>
              <p>{deleteTarget.title} sera removida do portfolio.</p>
              <div className="button-row">
                <RippleButton type="button" variant="danger" onClick={confirmDelete}>
                  Remover
                </RippleButton>
                <RippleButton type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
                  Cancelar
                </RippleButton>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function AdminPhotoCard({
  photo,
  onSave,
  onDelete
}: {
  photo: Photo;
  onSave: (photo: Photo, title: string, category: string) => Promise<void>;
  onDelete: () => void;
}): JSX.Element {
  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState(photo.category);
  const changed = title !== photo.title || category !== photo.category;

  return (
    <article className="admin-photo-card">
      <img src={photo.url} alt={photo.title} loading="lazy" />
      <label>
        <span>Titulo</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        <span>Categoria</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>Gel</option>
          <option>Nail Art</option>
          <option>Acrilico</option>
          <option>Blindagem</option>
          <option>Classica</option>
        </select>
      </label>
      <div className="button-row">
        <RippleButton type="button" disabled={!changed} onClick={() => void onSave(photo, title, category)}>
          Salvar
        </RippleButton>
        <RippleButton type="button" variant="danger" onClick={onDelete}>
          Deletar
        </RippleButton>
      </div>
    </article>
  );
}

export function AdminDashboard(): JSX.Element {
  return (
    <ErrorBoundary label="admin">
      <DashboardContent />
    </ErrorBoundary>
  );
}
