"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { TacticalBackground } from "@/app/components/tactical-background";
import { LanguageSwitcher } from "@/app/components/i18n/language-switcher";
import { useT } from "@/app/components/i18n/locale-provider";

function Form() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("password.mismatch"));
      return;
    }
    setError("");
    const res = await fetch("/api/conta/definir-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? t("password.error"));
      return;
    }
    setOk(true);
    setTimeout(() => router.push("/entrar"), 2000);
  };

  if (!token) {
    return <p className="text-muted">{t("password.invalid")}</p>;
  }

  if (ok) {
    return <p className="text-gold">{t("password.ok")}</p>;
  }

  return (
    <form onSubmit={submit} className="card-tactical space-y-4 p-8">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("password.newPassword")}
        required
        minLength={8}
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder={t("password.confirm")}
        required
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      {error && <p className="text-sm text-muted">{error}</p>}
      <button type="submit" className="btn-primary w-full">
        {t("password.save")}
      </button>
    </form>
  );
}

export default function DefinirPasswordPage() {
  const { t } = useT();
  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-md px-4 py-24 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs text-muted hover:text-gold">
            {t("password.back")}
          </Link>
          <LanguageSwitcher />
        </div>
        <h1 className="font-display mb-6 text-2xl font-semibold uppercase">{t("password.title")}</h1>
        <Suspense fallback={<p className="text-muted">{t("password.loading")}</p>}>
          <Form />
        </Suspense>
      </main>
    </>
  );
}
