"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError("Utilizador ou password incorretos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="card-tactical mx-auto max-w-md space-y-4 p-8">
      <p className="text-sm text-muted">
        Conta única de administração (nickname e password definidos na Vercel).
      </p>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nickname"
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
  );
}
