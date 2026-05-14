"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

type LoginFormProps = {
  recaptchaSiteKey?: string;
};

export function LoginForm({ recaptchaSiteKey }: LoginFormProps) {
  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recaptchaSiteKey) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha && recaptchaRef.current && widgetId.current === null) {
        widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: recaptchaSiteKey,
          callback: (token: string) => setCaptchaToken(token),
        });
      }
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [recaptchaSiteKey]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        recaptchaToken: captchaToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Não foi possível entrar.");
      setLoading(false);
      if (window.grecaptcha && widgetId.current !== null) {
        window.grecaptcha.reset(widgetId.current);
      }
      setCaptchaToken("");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form className="card mx-auto w-full max-w-md p-8" onSubmit={onSubmit}>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Acesso</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">Entrar no RH Flow</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Use seu e-mail e senha liberados pelo administrador.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
            E-mail
          </label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
            Senha
          </label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">reCAPTCHA</label>
          {recaptchaSiteKey ? (
            <div ref={recaptchaRef} />
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              reCAPTCHA não configurado. Em desenvolvimento, o login segue liberado sem o desafio.
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        className="mt-6 w-full rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
        disabled={loading}
        type="submit"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
