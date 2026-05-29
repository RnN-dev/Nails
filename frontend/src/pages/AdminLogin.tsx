import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RippleButton } from "../components/RippleButton";
import { loginAdmin } from "../utils/api";
import { getToken, setToken } from "../utils/auth";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export function AdminLogin(): JSX.Element {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const remainingSeconds = useMemo(() => Math.max(0, Math.ceil((lockUntil - now) / 1000)), [lockUntil, now]);
  const locked = remainingSeconds > 0;

  useEffect(() => {
    if (getToken()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!locked) {
      return undefined;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [locked]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (locked) {
      return;
    }

    const controller = new AbortController();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!email || !password) {
      setError("Email e senha sao obrigatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginAdmin(email, password, controller.signal);
      setToken(response.token);
      toast.success("Login aprovado");
      navigate("/admin/dashboard", { replace: true });
    } catch {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setError("Credenciais invalidas.");

      if (nextAttempts >= MAX_ATTEMPTS) {
        setLockUntil(Date.now() + LOCK_SECONDS * 1000);
        setAttempts(0);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-auth">
      <section className="admin-auth__panel">
        <a href="/" className="logo">
          Aline Studio
        </a>
        <div>
          <p className="section-kicker">Admin</p>
          <h1>Entrar no painel</h1>
          <p>Gerencie fotos do portfolio sem expor credenciais no frontend.</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <label className="floating-field">
            <input name="email" type="email" required placeholder=" " autoComplete="username" disabled={locked || loading} />
            <span>Email</span>
          </label>
          <label className="floating-field">
            <input
              name="password"
              type="password"
              required
              placeholder=" "
              autoComplete="current-password"
              disabled={locked || loading}
            />
            <span>Senha</span>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {locked ? <p className="form-error">Muitas tentativas. Tente novamente em {remainingSeconds}s.</p> : null}
          <RippleButton type="submit" disabled={locked || loading}>
            {loading ? "Validando..." : "Entrar"}
          </RippleButton>
        </form>
      </section>
    </main>
  );
}
