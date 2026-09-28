"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ImgcDelegation,
  ImgcEventData,
  ImgcGalleryPhoto,
  ImgcLink,
  ImgcLinkCategory,
  ImgcMessage,
} from "@/app/lib/events/imgc-types";
import { IMGC_FILE_ACCEPT, IMGC_IMAGE_ACCEPT, programmeSlot } from "@/app/lib/imgc/upload";

type Tab = "conteudo" | "delegacoes" | "links" | "galeria" | "contactos" | "mensagens";

type AdminPayload = {
  configured?: boolean;
  event?: ImgcEventData;
  error?: string;
};

function FileHint({ href, filename }: { href?: string | null; filename?: string | null }) {
  if (!href) {
    return <p className="text-xs text-muted">Sem ficheiro publicado</p>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline">
      {filename || "Ficheiro actual"} →
    </a>
  );
}

export function AdminImgcView({ year }: { year: string }) {
  const [tab, setTab] = useState<Tab>("conteudo");
  const [event, setEvent] = useState<ImgcEventData | null>(null);
  const [configured, setConfigured] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutBody, setAboutBody] = useState("");
  const [barracksTitle, setBarracksTitle] = useState("");
  const [barracksBody, setBarracksBody] = useState("");
  const [practicalTitle, setPracticalTitle] = useState("");
  const [practicalBody, setPracticalBody] = useState("");
  const [programmeTitle, setProgrammeTitle] = useState("");
  const [programmeBody, setProgrammeBody] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [host, setHost] = useState(false);

  const [linkCategory, setLinkCategory] = useState<ImgcLinkCategory>("tomar");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [messages, setMessages] = useState<ImgcMessage[]>([]);

  const applyEvent = useCallback((next: ImgcEventData) => {
    setEvent(next);
    setAboutTitle(next.about.title);
    setAboutBody(next.about.body);
    setBarracksTitle(next.barracks.title);
    setBarracksBody(next.barracks.body);
    setPracticalTitle(next.practical.title);
    setPracticalBody(next.practical.body);
    setProgrammeTitle(next.programme.title);
    setProgrammeBody(next.programme.body);
    setOrganizer(next.contacts.organizer);
    setEmail(next.contacts.email);
    setPhone(next.contacts.phone ?? "");
    setNotes(next.contacts.notes ?? "");
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/imgc/${year}`);
    const json = (await res.json()) as AdminPayload;
    if (!res.ok) {
      setError(json.error ?? "Não foi possível carregar o IMGC.");
      setConfigured(json.configured !== false);
      return;
    }
    setConfigured(json.configured !== false);
    setError("");
    if (json.event) applyEvent(json.event);
  }, [year, applyEvent]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleJson = async (res: Response) => {
    const json = (await res.json()) as AdminPayload & { ok?: boolean };
    if (!res.ok) {
      setFeedback("");
      setError(json.error ?? "Erro.");
      return false;
    }
    setError("");
    if (json.event) applyEvent(json.event);
    return true;
  };

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about_title: aboutTitle,
          about_body: aboutBody,
          barracks_title: barracksTitle,
          barracks_body: barracksBody,
          practical_title: practicalTitle,
          practical_body: practicalBody,
          programme_title: programmeTitle,
          programme_body: programmeBody,
        }),
      });
      if (await handleJson(res)) setFeedback("Textos da conferência guardados.");
    } finally {
      setBusy(false);
    }
  };

  const saveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer, email, phone, notes }),
      });
      if (await handleJson(res)) setFeedback("Contactos guardados.");
    } finally {
      setBusy(false);
    }
  };

  const uploadSlot = async (slot: string, file: File | null, label: string, clear = false) => {
    if (!file && !clear) return;
    setBusy(true);
    setFeedback("");
    try {
      const form = new FormData();
      form.set("slot", slot);
      form.set("label", label);
      if (clear) form.set("clear", "1");
      if (file) form.set("file", file);
      const res = await fetch(`/api/admin/imgc/${year}/assets`, { method: "POST", body: form });
      if (await handleJson(res)) {
        setFeedback(clear ? "Ficheiro removido." : "Ficheiro publicado no site.");
      }
    } finally {
      setBusy(false);
    }
  };

  const addDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/delegations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          city,
          lat: Number(lat),
          lng: Number(lng),
          host,
        }),
      });
      if (await handleJson(res)) {
        setCountry("");
        setCity("");
        setLat("");
        setLng("");
        setHost(false);
        setFeedback("Delegação adicionada.");
      }
    } finally {
      setBusy(false);
    }
  };

  const saveDelegation = async (item: ImgcDelegation) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/delegations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (await handleJson(res)) setFeedback("Delegação actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const deleteDelegation = async (id: string) => {
    if (!confirm("Eliminar esta delegação?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/delegations?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Delegação eliminada.");
    } finally {
      setBusy(false);
    }
  };

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: linkCategory,
          title: linkTitle,
          url: linkUrl,
          description: linkDescription,
        }),
      });
      if (await handleJson(res)) {
        setLinkTitle("");
        setLinkUrl("");
        setLinkDescription("");
        setFeedback("Ligação adicionada.");
      }
    } finally {
      setBusy(false);
    }
  };

  const saveLink = async (item: ImgcLink) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/links`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (await handleJson(res)) setFeedback("Ligação actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Eliminar esta ligação?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/links?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Ligação eliminada.");
    } finally {
      setBusy(false);
    }
  };

  const addPhoto = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setFeedback("");
    try {
      const form = new FormData();
      form.set("caption", newPhotoCaption);
      form.set("file", file);
      const res = await fetch(`/api/admin/imgc/${year}/gallery`, { method: "POST", body: form });
      if (await handleJson(res)) {
        setNewPhotoCaption("");
        setFeedback("Fotografia publicada.");
      }
    } finally {
      setBusy(false);
    }
  };

  const savePhoto = async (photo: ImgcGalleryPhoto, caption: string) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/gallery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id, caption }),
      });
      if (await handleJson(res)) setFeedback("Legenda actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm("Eliminar esta fotografia?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/gallery?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Fotografia eliminada.");
    } finally {
      setBusy(false);
    }
  };

  const loadMessages = async () => {
    const res = await fetch(`/api/admin/imgc/${year}/messages`);
    const json = (await res.json()) as { messages?: ImgcMessage[]; error?: string };
    if (!res.ok) {
      setError(json.error ?? "Erro.");
      return;
    }
    setMessages(json.messages ?? []);
  };

  useEffect(() => {
    if (tab === "mensagens") void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, year]);

  const deleteMessage = async (id: string) => {
    if (!confirm("Eliminar esta sugestão?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/imgc/${year}/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { messages?: ImgcMessage[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Erro.");
        return;
      }
      setError("");
      setMessages(json.messages ?? []);
      setFeedback("Sugestão eliminada.");
    } finally {
      setBusy(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "conteudo", label: "Textos e programa" },
    { id: "delegacoes", label: "Delegações" },
    { id: "links", label: "Tomar e ligações" },
    { id: "galeria", label: "Galeria" },
    { id: "contactos", label: "Contactos" },
    { id: "mensagens", label: "Sugestões" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 font-display text-xs tracking-[0.12em] uppercase ${
              tab === item.id
                ? "bg-gold text-background"
                : "border border-gold/30 text-gold hover:bg-gold/10"
            }`}
          >
            {item.label}
          </button>
        ))}
        <a
          href={`/eventos/imgc/${year}`}
          className="ml-auto font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-gold-bright"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver página pública →
        </a>
      </div>

      {!configured && (
        <p className="mb-6 border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Base de dados em falta. Defina DATABASE_URL. Os uploads de PDF e fotografias precisam de um
          Blob store na Vercel.
        </p>
      )}
      {configured && (
        <p className="mb-6 text-sm text-muted">
          O que guardar aqui (textos, mapa de delegações, programa, Tomar, galeria e contactos) é o
          que o público vê em{" "}
          <a
            href={`/eventos/imgc/${year}`}
            className="text-gold hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            /eventos/imgc/{year}
          </a>
          .
        </p>
      )}
      {error && (
        <p className="mb-6 border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          {error}
        </p>
      )}
      {feedback && (
        <p className="mb-6 border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">{feedback}</p>
      )}

      {tab === "conteudo" && event && (
        <form onSubmit={saveContent} className="space-y-8">
          {(
            [
              ["Conferência", aboutTitle, aboutBody, setAboutTitle, setAboutBody],
              ["Quartel da Cavalaria", barracksTitle, barracksBody, setBarracksTitle, setBarracksBody],
              ["Informação prática", practicalTitle, practicalBody, setPracticalTitle, setPracticalBody],
              ["Programa", programmeTitle, programmeBody, setProgrammeTitle, setProgrammeBody],
            ] as const
          ).map(([label, title, body, setTitle, setBody]) => (
            <div key={label} className="card-tactical space-y-4 p-6">
              <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
                {label}
              </h3>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
                required
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
                required
              />
            </div>
          ))}

          <div className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Documento do programa
            </h3>
            <FileHint href={event.programme.pdf.href} filename={event.programme.pdf.filename} />
            <input
              type="file"
              accept={IMGC_FILE_ACCEPT}
              disabled={busy}
              onChange={(e) =>
                void uploadSlot(programmeSlot(), e.target.files?.[0] ?? null, event.programme.pdf.label)
              }
            />
            {event.programme.pdf.href && (
              <button
                type="button"
                disabled={busy}
                className="btn-outline text-xs"
                onClick={() => void uploadSlot(programmeSlot(), null, event.programme.pdf.label, true)}
              >
                Remover programa
              </button>
            )}
          </div>

          <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
            Guardar textos
          </button>
        </form>
      )}

      {tab === "delegacoes" && event && (
        <div className="space-y-8">
          <form onSubmit={addDelegation} className="card-tactical grid gap-3 p-6 sm:grid-cols-2">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase sm:col-span-2">
              Nova delegação
            </h3>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="País"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cidade (opcional)"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude (ex. 51.50)"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude (ex. -0.12)"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
              <input type="checkbox" checked={host} onChange={(e) => setHost(e.target.checked)} />
              Nação anfitriã
            </label>
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs sm:col-span-2">
              Adicionar pin
            </button>
          </form>

          {event.delegations.map((item) => (
            <DelegationEditor
              key={item.id}
              item={item}
              busy={busy}
              onSave={saveDelegation}
              onDelete={deleteDelegation}
            />
          ))}
        </div>
      )}

      {tab === "links" && event && (
        <div className="space-y-8">
          <form onSubmit={addLink} className="card-tactical grid gap-3 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Nova ligação
            </h3>
            <select
              value={linkCategory}
              onChange={(e) => setLinkCategory(e.target.value as ImgcLinkCategory)}
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            >
              <option value="tomar">Descobrir Tomar</option>
              <option value="transport">Transportes</option>
              <option value="stay">Alojamento</option>
              <option value="other">Outros</option>
            </select>
            <input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Título"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={linkDescription}
              onChange={(e) => setLinkDescription(e.target.value)}
              placeholder="Descrição"
              rows={3}
              className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Adicionar ligação
            </button>
          </form>

          {event.links.map((item) => (
            <LinkEditor key={item.id} item={item} busy={busy} onSave={saveLink} onDelete={deleteLink} />
          ))}
        </div>
      )}

      {tab === "galeria" && event && (
        <div className="space-y-8">
          <div className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Nova fotografia
            </h3>
            <input
              value={newPhotoCaption}
              onChange={(e) => setNewPhotoCaption(e.target.value)}
              placeholder="Legenda"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <input
              type="file"
              accept={IMGC_IMAGE_ACCEPT}
              disabled={busy}
              onChange={(e) => void addPhoto(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {event.photoGallery.map((photo) => (
              <PhotoEditor
                key={photo.id}
                photo={photo}
                busy={busy}
                onSave={savePhoto}
                onDelete={deletePhoto}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "contactos" && event && (
        <form onSubmit={saveContacts} className="card-tactical max-w-xl space-y-4 p-6">
          <input
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="Organização"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefone"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas"
            rows={4}
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
          />
          <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
            Guardar contactos
          </button>
        </form>
      )}

      {tab === "mensagens" && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">Ainda não há sugestões.</p>
          ) : (
            messages.map((item) => (
              <div key={item.id} className="card-tactical p-6">
                <p className="font-display text-sm text-gold">
                  {item.name} · {item.email}
                </p>
                <p className="mt-1 text-xs text-muted">{item.createdAt}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">{item.body}</p>
                <button
                  type="button"
                  disabled={busy}
                  className="btn-outline mt-4 text-xs"
                  onClick={() => void deleteMessage(item.id)}
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DelegationEditor({
  item,
  busy,
  onSave,
  onDelete,
}: {
  item: ImgcDelegation;
  busy: boolean;
  onSave: (item: ImgcDelegation) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [country, setCountry] = useState(item.country);
  const [city, setCity] = useState(item.city ?? "");
  const [lat, setLat] = useState(String(item.lat));
  const [lng, setLng] = useState(String(item.lng));
  const [host, setHost] = useState(Boolean(item.host));

  return (
    <form
      className="card-tactical grid gap-3 p-6 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          ...item,
          country,
          city,
          lat: Number(lat),
          lng: Number(lng),
          host,
        });
      }}
    >
      <input
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <input
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <input
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
        <input type="checkbox" checked={host} onChange={(e) => setHost(e.target.checked)} />
        Nação anfitriã
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
          Guardar
        </button>
        <button
          type="button"
          disabled={busy}
          className="btn-outline text-xs"
          onClick={() => void onDelete(item.id)}
        >
          Eliminar
        </button>
      </div>
    </form>
  );
}

function LinkEditor({
  item,
  busy,
  onSave,
  onDelete,
}: {
  item: ImgcLink;
  busy: boolean;
  onSave: (item: ImgcLink) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [category, setCategory] = useState(item.category);
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.url);
  const [description, setDescription] = useState(item.description ?? "");

  return (
    <form
      className="card-tactical grid gap-3 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({ ...item, category, title, url, description });
      }}
    >
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ImgcLinkCategory)}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      >
        <option value="tomar">Descobrir Tomar</option>
        <option value="transport">Transportes</option>
        <option value="stay">Alojamento</option>
        <option value="other">Outros</option>
      </select>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
          Guardar
        </button>
        <button
          type="button"
          disabled={busy}
          className="btn-outline text-xs"
          onClick={() => void onDelete(item.id)}
        >
          Eliminar
        </button>
      </div>
    </form>
  );
}

function PhotoEditor({
  photo,
  busy,
  onSave,
  onDelete,
}: {
  photo: ImgcGalleryPhoto;
  busy: boolean;
  onSave: (photo: ImgcGalleryPhoto, caption: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [caption, setCaption] = useState(photo.alt);
  return (
    <div className="card-tactical space-y-3 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full border border-gold/20 bg-background/80 px-3 py-2 text-sm"
      />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          className="btn-primary px-3 py-2 text-xs"
          onClick={() => void onSave(photo, caption)}
        >
          Guardar
        </button>
        <button
          type="button"
          disabled={busy}
          className="btn-outline text-xs"
          onClick={() => void onDelete(photo.id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
