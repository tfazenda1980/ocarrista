"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { TacticalBackground } from "@/app/components/tactical-background";

function Form() {
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
      setError("As passwords não coincidem.");
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
      setError(data.error ?? "Não foi possível guardar.");
      return;
    }
    setOk(true);
    setTimeout(() => router.push("/entrar"), 2000);
  };

  if (!token) {
    return <p className="text-muted">Link inválido. Peça um novo convite após aprovação.</p>;
  }

  if (ok) {
    return (
      <p className="text-gold">
        Password definida. A redirecionar para entrar…
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="card-tactical space-y-4 p-8">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nova password (mín. 8 caracteres)"
        required
        minLength={8}
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirmar password"
        required
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      {error && <p className="text-sm text-muted">{error}</p>}
      <button type="submit" className="btn-primary w-full">
        Guardar password
      </button>
    </form>
  );
}

export default function DefinirPasswordPage() {
  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-md px-4 py-24 sm:px-6">
        <Link href="/" className="mb-8 inline-block font-mono text-xs text-muted hover:text-gold">
          ← O Carrista
        </Link>
        <h1 className="font-display mb-6 text-2xl font-semibold uppercase">
          Definir password
        </h1>
        <Suspense fallback={<p className="text-muted">A carregar…</p>}>
          <Form />
        </Suspense>
      </main>
    </>
  );
}
