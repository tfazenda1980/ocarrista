"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
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
      setError(data.error ?? "Credenciais inválidas.");
      return;
    }

    onSuccess?.();

    if (data.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/#loja");
    }
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="card-tactical space-y-4 p-8">
      <p className="text-sm leading-relaxed text-muted">
        <strong className="text-foreground">Membros:</strong> use o email da adesão aprovada.
        <br />
        <strong className="text-foreground">Administração:</strong> use o nickname de administrador.
      </p>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email ou nickname"
        required
        autoComplete="username"
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        autoComplete="current-password"
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
      />
      {error && <p className="text-sm text-muted">{error}</p>}
      <button type="submit" className="btn-primary w-full">
        Entrar
      </button>
      <p className="text-center text-xs text-muted">
        Ainda não é membro?{" "}
        <Link href="/#comunidade" className="text-gold hover:underline">
          Pedir adesão
        </Link>
      </p>
    </form>
  );
}
