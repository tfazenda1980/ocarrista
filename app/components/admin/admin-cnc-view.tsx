"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CncDiscipline, CncEventData, CncUsefulInfoItem } from "@/app/lib/events/cnc-types";
import { CNC_FILE_ACCEPT } from "@/app/lib/cnc/upload";
import { disciplineSlot, generalProgramSlot, openingNoteSlot, usefulSlot } from "@/app/lib/cnc/slots";

type Tab = "conteudo" | "provas" | "info" | "contactos";

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
  const [organizer, setOrganizer] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [newProvaTitle, setNewProvaTitle] = useState("");
  const [newProvaDescription, setNewProvaDescription] = useState("");
  const [newProvaKind, setNewProvaKind] = useState<"resources" | "gallery">("resources");
  const [newInfoTitle, setNewInfoTitle] = useState("");
  const [newInfoDescription, setNewInfoDescription] = useState("");

  const applyEvent = useCallback((next: CncEventData) => {
    setEvent(next);
    setOpeningTitle(next.openingNote.title);
    setOpeningBody(next.openingNote.body);
    setProgramTitle(next.generalProgram.title);
    setProgramBody(next.generalProgram.body);
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
        }),
      });
      if (await handleJson(res)) setFeedback("Nota de abertura e programa guardados.");
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "conteudo", label: "Nota e programa" },
    { id: "provas", label: "Provas e croquis" },
    { id: "info", label: "Informação útil" },
    { id: "contactos", label: "Contactos" },
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
          Tudo o que guardar ou carregar aqui (textos, PDFs, croquis em desenho, PPT e informação
          útil) passa a ser o que o público e os concorrentes vêem em{" "}
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

          <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-xs">
            Guardar textos
          </button>
        </form>
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
