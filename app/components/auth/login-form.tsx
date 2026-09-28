"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "../i18n/locale-provider";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useT();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = (await res.json()) as { role?: "admin" | "user"; error?: string };

    if (!res.ok) {
      setError(data.error ?? t("login.invalid"));
      return;
    }

    onSuccess?.();

    if (data.role === "admin") {
      window.location.href = "/?section=admin";
      return;
    }

    window.location.href = "/?section=loja";
  };

  return (
    <form onSubmit={submit} className="card-tactical space-y-4 p-8">
      <p className="text-sm leading-relaxed text-muted">
        <strong className="text-foreground">{t("login.formLeadMembers")}</strong>
        {t("login.formLeadMembersBody")}
        <br />
        <strong className="text-foreground">{t("login.formLeadAdmin")}</strong>
        {t("login.formLeadAdminBody")}
      </p>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder={t("login.identifier")}
        required
        autoComplete="username"
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("login.password")}
        required
        autoComplete="current-password"
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      {error && <p className="text-sm text-muted">{error}</p>}
      <button type="submit" className="btn-primary w-full">
        {t("login.submit")}
      </button>
      <p className="text-center text-xs text-muted">
        {t("login.notMember")}{" "}
        <Link href="/#comunidade" className="text-gold hover:underline">
          {t("login.requestJoin")}
        </Link>
      </p>
    </form>
  );
}
