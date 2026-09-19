"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CncDiscipline,
  CncEventData,
  CncGalleryPhoto,
  CncNotice,
  CncSponsor,
  CncUsefulInfoItem,
} from "@/app/lib/events/cnc-types";
import { CNC_FILE_ACCEPT, CNC_IMAGE_ACCEPT } from "@/app/lib/cnc/upload";
import { cncMessageKindLabel, type CncMessage } from "@/app/lib/cnc/messages";
import {
  disciplineSlot,
  generalProgramSlot,
  openingNoteSlot,
  regulationSlot,
  sponsorSlot,
  usefulSlot,
} from "@/app/lib/cnc/slots";

type Tab =
  | "conteudo"
  | "avisos"
  | "provas"
  | "galeria"
  | "info"
  | "patrocinadores"
  | "contactos"
  | "mensagens";

type AdminPayload = {
  configured?: boolean;
  event?: CncEventData;
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

export function AdminCncView({ year }: { year: string }) {
  const [tab, setTab] = useState<Tab>("conteudo");
  const [event, setEvent] = useState<CncEventData | null>(null);
  const [configured, setConfigured] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [openingTitle, setOpeningTitle] = useState("");
  const [openingBody, setOpeningBody] = useState("");
  const [programTitle, setProgramTitle] = useState("");
  const [programBody, setProgramBody] = useState("");
  const [regulationTitle, setRegulationTitle] = useState("");
  const [regulationBody, setRegulationBody] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [newProvaTitle, setNewProvaTitle] = useState("");
  const [newProvaDescription, setNewProvaDescription] = useState("");
  const [newProvaKind, setNewProvaKind] = useState<"resources" | "gallery">("resources");
  const [newInfoTitle, setNewInfoTitle] = useState("");
  const [newInfoDescription, setNewInfoDescription] = useState("");
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorUrl, setNewSponsorUrl] = useState("");
  const [newNotice, setNewNotice] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [messages, setMessages] = useState<CncMessage[]>([]);

  const applyEvent = useCallback((next: CncEventData) => {
    setEvent(next);
    setOpeningTitle(next.openingNote.title);
    setOpeningBody(next.openingNote.body);
    setProgramTitle(next.generalProgram.title);
    setProgramBody(next.generalProgram.body);
    setRegulationTitle(next.regulation?.title ?? "Regulamento");
    setRegulationBody(next.regulation?.body ?? "");
    setOrganizer(next.contacts.organizer);
    setEmail(next.contacts.email);
    setPhone(next.contacts.phone ?? "");
    setNotes(next.contacts.notes ?? "");
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/cnc/${year}`);
    const json = (await res.json()) as AdminPayload;
    if (!res.ok) {
      setError(json.error ?? "Não foi possível carregar o CNC.");
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
      const res = await fetch(`/api/admin/cnc/${year}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opening_note_title: openingTitle,
          opening_note_body: openingBody,
          general_program_title: programTitle,
          general_program_body: programBody,
          regulation_title: regulationTitle,
          regulation_body: regulationBody,
        }),
      });
      if (await handleJson(res)) setFeedback("Nota, programa e regulamento guardados.");
    } finally {
      setBusy(false);
    }
  };

  const saveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}`, {
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
      const res = await fetch(`/api/admin/cnc/${year}/assets`, { method: "POST", body: form });
      if (await handleJson(res)) {
        setFeedback(clear ? "Ficheiro removido." : "Ficheiro publicado no site.");
      }
    } finally {
      setBusy(false);
    }
  };

  const addDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/disciplines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProvaTitle,
          description: newProvaDescription,
          kind: newProvaKind,
        }),
      });
      if (await handleJson(res)) {
        setNewProvaTitle("");
        setNewProvaDescription("");
        setNewProvaKind("resources");
        setFeedback("Prova adicionada.");
      }
    } finally {
      setBusy(false);
    }
  };

  const saveDiscipline = async (discipline: CncDiscipline, title: string, description: string) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/disciplines`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: discipline.id,
          title,
          description,
          kind: discipline.galleryPdf ? "gallery" : "resources",
        }),
      });
      if (await handleJson(res)) setFeedback("Prova actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const deleteDiscipline = async (id: string) => {
    if (!confirm("Eliminar esta prova e os respectivos documentos?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/disciplines?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Prova eliminada.");
    } finally {
      setBusy(false);
    }
  };

  const moveDiscipline = async (id: string, move: "up" | "down") => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/disciplines`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, move }),
      });
      if (await handleJson(res)) setFeedback("Ordem das provas actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const addUseful = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/useful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newInfoTitle, description: newInfoDescription }),
      });
      if (await handleJson(res)) {
        setNewInfoTitle("");
        setNewInfoDescription("");
        setFeedback("Informação útil adicionada.");
      }
    } finally {
      setBusy(false);
    }
  };

  const saveUseful = async (item: CncUsefulInfoItem, title: string, description: string) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/useful`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, title, description }),
      });
      if (await handleJson(res)) setFeedback("Item actualizado.");
    } finally {
      setBusy(false);
    }
  };

  const deleteUseful = async (id: string) => {
    if (!confirm("Eliminar este item de informação útil?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/useful?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Item eliminado.");
    } finally {
      setBusy(false);
    }
  };

  const moveUseful = async (id: string, move: "up" | "down") => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/useful`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, move }),
      });
      if (await handleJson(res)) setFeedback("Ordem da informação útil actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const addSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/sponsors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSponsorName, url: newSponsorUrl }),
      });
      if (await handleJson(res)) {
        setNewSponsorName("");
        setNewSponsorUrl("");
        setFeedback("Patrocinador adicionado. Carregue o logótipo.");
      }
    } finally {
      setBusy(false);
    }
  };

  const saveSponsor = async (sponsor: CncSponsor, name: string, url: string) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/sponsors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sponsor.id, name, url }),
      });
      if (await handleJson(res)) setFeedback("Patrocinador actualizado.");
    } finally {
      setBusy(false);
    }
  };

  const deleteSponsor = async (id: string) => {
    if (!confirm("Eliminar este patrocinador?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/sponsors?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Patrocinador eliminado.");
    } finally {
      setBusy(false);
    }
  };

  const moveSponsor = async (id: string, move: "up" | "down") => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/sponsors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, move }),
      });
      if (await handleJson(res)) setFeedback("Ordem dos patrocinadores actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const publishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newNotice }),
      });
      if (await handleJson(res)) {
        setNewNotice("");
        setFeedback("Aviso publicado na página pública.");
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleNotice = async (notice: CncNotice) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/notices`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notice.id, active: !notice.active }),
      });
      if (await handleJson(res)) {
        setFeedback(notice.active ? "Aviso retirado da página pública." : "Aviso reactivado.");
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm("Eliminar este aviso?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/notices?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Aviso eliminado.");
    } finally {
      setBusy(false);
    }
  };

  const addGalleryPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fileInput = formEl.elements.namedItem("photo") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Escolha uma fotografia.");
      return;
    }
    setBusy(true);
    setFeedback("");
    try {
      const form = new FormData();
      form.set("caption", newPhotoCaption);
      form.set("file", file);
      const res = await fetch(`/api/admin/cnc/${year}/gallery`, { method: "POST", body: form });
      if (await handleJson(res)) {
        setNewPhotoCaption("");
        formEl.reset();
        setFeedback("Fotografia publicada na galeria.");
      }
    } finally {
      setBusy(false);
    }
  };

  const saveGalleryCaption = async (photo: CncGalleryPhoto, caption: string) => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/gallery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id, caption }),
      });
      if (await handleJson(res)) setFeedback("Legenda actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const deleteGalleryPhoto = async (id: string) => {
    if (!confirm("Eliminar esta fotografia da galeria?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/gallery?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (await handleJson(res)) setFeedback("Fotografia eliminada.");
    } finally {
      setBusy(false);
    }
  };

  const moveGalleryPhoto = async (id: string, move: "up" | "down") => {
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/gallery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, move }),
      });
      if (await handleJson(res)) setFeedback("Ordem da galeria actualizada.");
    } finally {
      setBusy(false);
    }
  };

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/admin/cnc/${year}/messages`);
    const json = (await res.json()) as { messages?: CncMessage[]; error?: string };
    if (!res.ok) {
      setError(json.error ?? "Não foi possível carregar as mensagens.");
      return;
    }
    setMessages(json.messages ?? []);
  }, [year]);

  useEffect(() => {
    if (tab === "mensagens") void loadMessages();
  }, [tab, loadMessages]);

  const deleteMessage = async (id: string) => {
    if (!confirm("Eliminar esta mensagem?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/cnc/${year}/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { messages?: CncMessage[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Erro.");
        return;
      }
      setError("");
      setMessages(json.messages ?? []);
      setFeedback("Mensagem eliminada.");
    } finally {
      setBusy(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "conteudo", label: "Nota, programa e regulamento" },
    { id: "avisos", label: "Avisos do dia" },
    { id: "provas", label: "Provas e croquis" },
    { id: "galeria", label: "Galeria fotográfica" },
    { id: "info", label: "Informação útil" },
    { id: "patrocinadores", label: "Patrocinadores" },
    { id: "contactos", label: "Contactos" },
    { id: "mensagens", label: "Fale connosco" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-display text-xs tracking-[0.12em] uppercase ${
              tab === t.id
                ? "bg-gold text-background"
                : "border border-gold/30 text-gold hover:bg-gold/10"
            }`}
          >
            {t.label}
          </button>
        ))}
        <a
          href={`/eventos/cnc/${year}`}
          className="ml-auto font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-gold-bright"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver página pública →
        </a>
      </div>

      {!configured && (
        <p className="mb-6 border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Base de dados em falta. Defina DATABASE_URL ou execute{" "}
          <code className="text-gold">scripts/migrate-cnc-admin.sql</code> no Neon. Os uploads de PDF
          e croquis precisam de um Blob store na Vercel.
        </p>
      )}
      {configured && (
        <p className="mb-6 text-sm text-muted">
          Tudo o que guardar ou carregar aqui (textos, PDFs, croquis, regulamento, galeria,
          avisos, informação útil e patrocinadores) passa a ser o que o público e os
          concorrentes vêem em{" "}
          <a href={`/eventos/cnc/${year}`} className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">
            /eventos/cnc/{year}
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
          <div className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Nota de abertura
            </h3>
            <input
              value={openingTitle}
              onChange={(e) => setOpeningTitle(e.target.value)}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={openingBody}
              onChange={(e) => setOpeningBody(e.target.value)}
              rows={5}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <AssetUploader
              label={event.openingNote.pdf?.label ?? "Nota de Abertura (PDF)"}
              href={event.openingNote.pdf?.href}
              filename={event.openingNote.pdf?.filename}
              disabled={busy}
              onUpload={(file) =>
                uploadSlot(openingNoteSlot(), file, event.openingNote.pdf?.label ?? "Nota de Abertura (PDF)")
              }
              onClear={() =>
                uploadSlot(openingNoteSlot(), null, event.openingNote.pdf?.label ?? "Nota de Abertura (PDF)", true)
              }
            />
          </div>

          <div className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Programa geral
            </h3>
            <input
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={programBody}
              onChange={(e) => setProgramBody(e.target.value)}
              rows={5}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <AssetUploader
              label={event.generalProgram.pdf?.label ?? "Programa geral (PDF)"}
              href={event.generalProgram.pdf?.href}
              filename={event.generalProgram.pdf?.filename}
              disabled={busy}
              onUpload={(file) =>
                uploadSlot(
                  generalProgramSlot(),
                  file,
                  event.generalProgram.pdf?.label ?? "Programa geral (PDF)",
                )
              }
              onClear={() =>
                uploadSlot(
                  generalProgramSlot(),
                  null,
                  event.generalProgram.pdf?.label ?? "Programa geral (PDF)",
                  true,
                )
              }
            />
          </div>

          <div className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Regulamento
            </h3>
            <p className="text-sm text-muted">
              Área pública com o regulamento oficial. Carregue o PDF homologado para o
              público o consultar e descarregar.
            </p>
            <input
              value={regulationTitle}
              onChange={(e) => setRegulationTitle(e.target.value)}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={regulationBody}
              onChange={(e) => setRegulationBody(e.target.value)}
              rows={5}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <AssetUploader
              label={event.regulation?.pdf?.label ?? "Regulamento (PDF)"}
              href={event.regulation?.pdf?.href}
              filename={event.regulation?.pdf?.filename}
              disabled={busy}
              onUpload={(file) =>
                uploadSlot(regulationSlot(), file, event.regulation?.pdf?.label ?? "Regulamento (PDF)")
              }
              onClear={() =>
                uploadSlot(regulationSlot(), null, event.regulation?.pdf?.label ?? "Regulamento (PDF)", true)
              }
            />
          </div>

          <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
            Guardar textos
          </button>
        </form>
      )}

      {tab === "avisos" && event && (
        <div className="space-y-8">
          <form onSubmit={publishNotice} className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Novo aviso do dia
            </h3>
            <p className="text-sm text-muted">
              Aparece no topo da página pública (atrasos, alterações de pista, horários). Não
              substitui o programa geral.
            </p>
            <textarea
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              rows={4}
              placeholder="Ex. O reconhecimento da pista de obstáculos atrasou 15 minutos."
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Publicar aviso
            </button>
          </form>

          {(event.notices ?? []).length === 0 ? (
            <p className="text-sm text-muted">Ainda não há avisos nesta edição.</p>
          ) : (
            <ul className="space-y-4">
              {(event.notices ?? []).map((notice) => (
                <li key={notice.id} className="card-tactical space-y-3 p-6">
                  <p className="text-sm leading-relaxed text-foreground">{notice.body}</p>
                  <p className="text-xs text-muted">
                    {notice.active ? "Visível no site" : "Retirado"} ·{" "}
                    {new Date(notice.createdAt).toLocaleString("pt-PT")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleNotice(notice)}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      {notice.active ? "Retirar do site" : "Reactivar"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => deleteNotice(notice.id)}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "galeria" && event && (
        <div className="space-y-10">
          <form onSubmit={addGalleryPhoto} className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Nova fotografia
            </h3>
            <p className="text-sm text-muted">
              Publica imediatamente na Galeria Fotográfica da página do CNC.
            </p>
            <input
              value={newPhotoCaption}
              onChange={(e) => setNewPhotoCaption(e.target.value)}
              placeholder="Legenda (opcional)"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <input
              name="photo"
              type="file"
              accept={CNC_IMAGE_ACCEPT}
              disabled={busy}
              className="text-sm text-muted"
              required
            />
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Publicar fotografia
            </button>
          </form>

          {(event.photoGallery ?? []).map((photo, index) => (
            <GalleryEditor
              key={photo.id}
              photo={photo}
              busy={busy}
              canMoveUp={index > 0}
              canMoveDown={index < (event.photoGallery?.length ?? 0) - 1}
              onSave={saveGalleryCaption}
              onDelete={() => deleteGalleryPhoto(photo.id)}
              onMove={(dir) => moveGalleryPhoto(photo.id, dir)}
            />
          ))}
        </div>
      )}

      {tab === "provas" && event && (
        <div className="space-y-10">
          <form onSubmit={addDiscipline} className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Nova prova / secção
            </h3>
            <input
              value={newProvaTitle}
              onChange={(e) => setNewProvaTitle(e.target.value)}
              placeholder="Ex. CNC Iniciação"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={newProvaDescription}
              onChange={(e) => setNewProvaDescription(e.target.value)}
              placeholder="Descrição para o público"
              rows={3}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={newProvaKind === "gallery"}
                onChange={(e) => setNewProvaKind(e.target.checked ? "gallery" : "resources")}
              />
              Galeria de prémios (um PDF em largura total)
            </label>
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Adicionar
            </button>
          </form>

          {event.disciplines.map((discipline, index) => (
            <DisciplineEditor
              key={discipline.id}
              discipline={discipline}
              busy={busy}
              canMoveUp={index > 0}
              canMoveDown={index < event.disciplines.length - 1}
              onSave={saveDiscipline}
              onDelete={() => deleteDiscipline(discipline.id)}
              onMove={(dir) => moveDiscipline(discipline.id, dir)}
              onUpload={(slot, file, label) => uploadSlot(slot, file, label)}
              onClear={(slot, label) => uploadSlot(slot, null, label, true)}
            />
          ))}
        </div>
      )}

      {tab === "info" && event && (
        <div className="space-y-10">
          <form onSubmit={addUseful} className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Novo item de informação útil
            </h3>
            <input
              value={newInfoTitle}
              onChange={(e) => setNewInfoTitle(e.target.value)}
              placeholder="Ex. Planta do CMSM"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={newInfoDescription}
              onChange={(e) => setNewInfoDescription(e.target.value)}
              placeholder="Texto curto para concorrentes"
              rows={3}
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Adicionar
            </button>
          </form>

          {event.usefulInfo.map((item, index) => (
            <UsefulEditor
              key={item.id}
              item={item}
              busy={busy}
              canMoveUp={index > 0}
              canMoveDown={index < event.usefulInfo.length - 1}
              onSave={saveUseful}
              onDelete={() => deleteUseful(item.id)}
              onMove={(dir) => moveUseful(item.id, dir)}
              onUpload={(file) => uploadSlot(usefulSlot(item.id), file, item.pdf.label)}
              onClear={() => uploadSlot(usefulSlot(item.id), null, item.pdf.label, true)}
            />
          ))}
        </div>
      )}

      {tab === "patrocinadores" && event && (
        <div className="space-y-10">
          <form onSubmit={addSponsor} className="card-tactical space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
              Novo patrocinador
            </h3>
            <p className="text-sm text-muted">
              Aparece na secção Patrocinadores da página pública, com logótipo. O sítio web é
              opcional.
            </p>
            <input
              value={newSponsorName}
              onChange={(e) => setNewSponsorName(e.target.value)}
              placeholder="Nome do patrocinador"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
              required
            />
            <input
              value={newSponsorUrl}
              onChange={(e) => setNewSponsorUrl(e.target.value)}
              placeholder="https://www.exemplo.pt (opcional)"
              className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
            />
            <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
              Adicionar
            </button>
          </form>

          {event.sponsors.map((sponsor, index) => (
            <SponsorEditor
              key={sponsor.id}
              sponsor={sponsor}
              busy={busy}
              canMoveUp={index > 0}
              canMoveDown={index < event.sponsors.length - 1}
              onSave={saveSponsor}
              onDelete={() => deleteSponsor(sponsor.id)}
              onMove={(dir) => moveSponsor(sponsor.id, dir)}
              onUpload={(file) => uploadSlot(sponsorSlot(sponsor.id), file, sponsor.name)}
              onClear={() => uploadSlot(sponsorSlot(sponsor.id), null, sponsor.name, true)}
            />
          ))}
        </div>
      )}

      {tab === "contactos" && event && (
        <form onSubmit={saveContacts} className="card-tactical max-w-xl space-y-4 p-6">
          <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-gold uppercase">
            Contactos públicos
          </h3>
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
            placeholder="Telefone (opcional)"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Notas para concorrentes"
            className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
          />
          <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
            Guardar contactos
          </button>
        </form>
      )}

      {tab === "mensagens" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Mensagens enviadas pelo público em «Fale connosco» (esclarecimentos, questões de
            prova e sugestões).
          </p>
          {messages.length === 0 ? (
            <p className="text-sm text-muted">Ainda não há mensagens.</p>
          ) : (
            messages.map((message) => (
              <article key={message.id} className="card-tactical space-y-2 p-6">
                <p className="font-display text-xs tracking-[0.12em] text-gold uppercase">
                  {cncMessageKindLabel(message.kind)}
                </p>
                <p className="text-sm text-foreground">
                  {message.name} · {message.email}
                </p>
                {message.provaId && (
                  <p className="text-xs text-muted">Prova: {message.provaId}</p>
                )}
                <p className="text-sm leading-relaxed text-muted">{message.body}</p>
                <p className="text-xs text-muted">
                  {new Date(message.createdAt).toLocaleString("pt-PT")}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => deleteMessage(message.id)}
                  className="btn-outline px-3 py-1.5 text-xs"
                >
                  Eliminar
                </button>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AssetUploader({
  label,
  href,
  filename,
  disabled,
  accept = CNC_FILE_ACCEPT,
  hint = "PDF, imagem ou PPT",
  onUpload,
  onClear,
}: {
  label: string;
  href?: string | null;
  filename?: string | null;
  disabled?: boolean;
  accept?: string;
  hint?: string;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        {label} · {hint}
      </p>
      <FileHint href={href} filename={filename} />
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="text-sm text-muted"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        {href && (
          <button type="button" disabled={disabled} onClick={onClear} className="btn-outline px-3 py-1.5 text-xs">
            Remover
          </button>
        )}
      </div>
      {href && /\.(png|jpe?g|webp|gif|avif)$/i.test(href.split("?")[0]) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={href} alt="" className="mt-3 max-h-40 w-auto border border-gold/20 object-contain" />
      )}
    </div>
  );
}

function DisciplineEditor({
  discipline,
  busy,
  canMoveUp,
  canMoveDown,
  onSave,
  onDelete,
  onMove,
  onUpload,
  onClear,
}: {
  discipline: CncDiscipline;
  busy: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSave: (discipline: CncDiscipline, title: string, description: string) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  onUpload: (slot: string, file: File, label: string) => void;
  onClear: (slot: string, label: string) => void;
}) {
  const [title, setTitle] = useState(discipline.title);
  const [description, setDescription] = useState(discipline.description ?? "");

  useEffect(() => {
    setTitle(discipline.title);
    setDescription(discipline.description ?? "");
  }, [discipline.title, discipline.description]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(discipline, title, description);
      }}
      className="card-tactical space-y-4 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg text-foreground">{discipline.title}</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onMove("up")} disabled={busy || !canMoveUp} className="btn-outline px-3 py-1.5 text-xs">
            Subir
          </button>
          <button type="button" onClick={() => onMove("down")} disabled={busy || !canMoveDown} className="btn-outline px-3 py-1.5 text-xs">
            Descer
          </button>
          <button type="button" onClick={onDelete} disabled={busy} className="btn-outline px-3 py-1.5 text-xs">
            Eliminar
          </button>
        </div>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />

      {discipline.galleryPdf ? (
        <AssetUploader
          label={discipline.galleryPdf.label}
          href={discipline.galleryPdf.href}
          filename={discipline.galleryPdf.filename}
          disabled={busy}
          onUpload={(file) =>
            onUpload(disciplineSlot(discipline.id, "gallery"), file, discipline.galleryPdf?.label ?? "Galeria")
          }
          onClear={() =>
            onClear(disciplineSlot(discipline.id, "gallery"), discipline.galleryPdf?.label ?? "Galeria")
          }
        />
      ) : discipline.resources ? (
        <div className="grid gap-6 sm:grid-cols-3">
          <AssetUploader
            label={discipline.resources.ordens.label}
            href={discipline.resources.ordens.href}
            filename={discipline.resources.ordens.filename}
            disabled={busy}
            onUpload={(file) =>
              onUpload(disciplineSlot(discipline.id, "ordens"), file, discipline.resources?.ordens.label ?? "")
            }
            onClear={() =>
              onClear(disciplineSlot(discipline.id, "ordens"), discipline.resources?.ordens.label ?? "")
            }
          />
          <AssetUploader
            label={discipline.resources.croquis.label}
            href={discipline.resources.croquis.href}
            filename={discipline.resources.croquis.filename}
            disabled={busy}
            hint="Croqui: PDF, desenho (imagem) ou PPT"
            onUpload={(file) =>
              onUpload(disciplineSlot(discipline.id, "croquis"), file, discipline.resources?.croquis.label ?? "")
            }
            onClear={() =>
              onClear(disciplineSlot(discipline.id, "croquis"), discipline.resources?.croquis.label ?? "")
            }
          />
          <AssetUploader
            label={discipline.resources.resultados.label}
            href={discipline.resources.resultados.href}
            filename={discipline.resources.resultados.filename}
            disabled={busy}
            onUpload={(file) =>
              onUpload(
                disciplineSlot(discipline.id, "resultados"),
                file,
                discipline.resources?.resultados.label ?? "",
              )
            }
            onClear={() =>
              onClear(disciplineSlot(discipline.id, "resultados"), discipline.resources?.resultados.label ?? "")
            }
          />
        </div>
      ) : null}

      <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
        Guardar prova
      </button>
    </form>
  );
}

function UsefulEditor({
  item,
  busy,
  canMoveUp,
  canMoveDown,
  onSave,
  onDelete,
  onMove,
  onUpload,
  onClear,
}: {
  item: CncUsefulInfoItem;
  busy: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSave: (item: CncUsefulInfoItem, title: string, description: string) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");

  useEffect(() => {
    setTitle(item.title);
    setDescription(item.description ?? "");
  }, [item.title, item.description]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(item, title, description);
      }}
      className="card-tactical space-y-4 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg text-foreground">{item.title}</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onMove("up")} disabled={busy || !canMoveUp} className="btn-outline px-3 py-1.5 text-xs">
            Subir
          </button>
          <button type="button" onClick={() => onMove("down")} disabled={busy || !canMoveDown} className="btn-outline px-3 py-1.5 text-xs">
            Descer
          </button>
          <button type="button" onClick={onDelete} disabled={busy} className="btn-outline px-3 py-1.5 text-xs">
            Eliminar
          </button>
        </div>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <AssetUploader
        label={item.pdf.label}
        href={item.pdf.href}
        filename={item.pdf.filename}
        disabled={busy}
        onUpload={onUpload}
        onClear={onClear}
      />
      <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
        Guardar item
      </button>
    </form>
  );
}

function SponsorEditor({
  sponsor,
  busy,
  canMoveUp,
  canMoveDown,
  onSave,
  onDelete,
  onMove,
  onUpload,
  onClear,
}: {
  sponsor: CncSponsor;
  busy: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSave: (sponsor: CncSponsor, name: string, url: string) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const [name, setName] = useState(sponsor.name);
  const [url, setUrl] = useState(sponsor.url);

  useEffect(() => {
    setName(sponsor.name);
    setUrl(sponsor.url);
  }, [sponsor.name, sponsor.url]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(sponsor, name, url);
      }}
      className="card-tactical space-y-4 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg text-foreground">{sponsor.name}</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onMove("up")} disabled={busy || !canMoveUp} className="btn-outline px-3 py-1.5 text-xs">
            Subir
          </button>
          <button type="button" onClick={() => onMove("down")} disabled={busy || !canMoveDown} className="btn-outline px-3 py-1.5 text-xs">
            Descer
          </button>
          <button type="button" onClick={onDelete} disabled={busy} className="btn-outline px-3 py-1.5 text-xs">
            Eliminar
          </button>
        </div>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
        required
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.exemplo.pt (opcional)"
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <AssetUploader
        label="Logótipo"
        href={sponsor.logo || null}
        filename={sponsor.logo ? "Logótipo actual" : null}
        disabled={busy}
        accept={CNC_IMAGE_ACCEPT}
        hint="PNG, JPG, WebP ou SVG"
        onUpload={onUpload}
        onClear={onClear}
      />
      <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
        Guardar patrocinador
      </button>
    </form>
  );
}

function GalleryEditor({
  photo,
  busy,
  canMoveUp,
  canMoveDown,
  onSave,
  onDelete,
  onMove,
}: {
  photo: CncGalleryPhoto;
  busy: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSave: (photo: CncGalleryPhoto, caption: string) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}) {
  const [caption, setCaption] = useState(photo.alt === "Fotografia do CNC" ? "" : photo.alt);

  useEffect(() => {
    setCaption(photo.alt === "Fotografia do CNC" ? "" : photo.alt);
  }, [photo.alt]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(photo, caption);
      }}
      className="card-tactical space-y-4 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg text-foreground">Fotografia</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onMove("up")} disabled={busy || !canMoveUp} className="btn-outline px-3 py-1.5 text-xs">
            Subir
          </button>
          <button type="button" onClick={() => onMove("down")} disabled={busy || !canMoveDown} className="btn-outline px-3 py-1.5 text-xs">
            Descer
          </button>
          <button type="button" onClick={onDelete} disabled={busy} className="btn-outline px-3 py-1.5 text-xs">
            Eliminar
          </button>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt="" className="max-h-56 w-auto border border-gold/20 object-contain" />
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Legenda"
        className="w-full border border-gold/20 bg-background/80 px-4 py-3 text-sm"
      />
      <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
        Guardar legenda
      </button>
    </form>
  );
}
