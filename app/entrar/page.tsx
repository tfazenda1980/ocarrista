"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TacticalBackground } from "@/app/components/tactical-background";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/member/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("Email ou password incorretos, ou adesão ainda não aprovada.");
      return;
    }
    router.push("/#loja");
    router.refresh();
  };

  return (
    <>
      <TacticalBackground />
      <main className="relative z-10 mx-auto max-w-md px-4 py-24 sm:px-6">
        <Link href="/#comunidade" className="mb-8 inline-block font-mono text-xs text-muted hover:text-gold">
          ← Comunidade
        </Link>
        <h1 className="font-display mb-6 text-2xl font-semibold uppercase">Entrar</h1>
        <form onSubmit={submit} className="card-tactical space-y-4 p-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
          />
          {error && <p className="text-sm text-muted">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>
      </main>
    </>
  );
}
