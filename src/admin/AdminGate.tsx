import { useState, type ReactNode } from "react";
import { apiUrl } from "../lib/api";
import styles from "./Admin.module.css";

const TOKEN_KEY = "atamura_admin_token";

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function AdminGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)));
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(apiUrl("api/admin-auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error(`auth ${res.status}`);
      const data = (await res.json()) as { token: string };
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setAuthed(true);
    } catch (err) {
      console.warn("[admin] auth failed", err);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (authed) return <>{children}</>;

  return (
    <form className={styles.gate} onSubmit={submit}>
      <h1 className={styles.gateTitle}>Управление программами</h1>
      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className={styles.error}>Неверный пароль</p>}
      <button className={styles.btnPrimary} type="submit" disabled={busy} style={{ marginTop: 16, width: "100%" }}>
        {busy ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
