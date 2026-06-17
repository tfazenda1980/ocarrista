/** Converte serial Excel (fração de 24h) para duração legível. */
export function excelSerialToDuration(value: unknown): string | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) {
    const text = String(value).trim();
    return text || null;
  }
  const seconds = Math.round(Math.abs(n) * 24 * 3600);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Converte serial Excel para hora do dia (HH:MM). */
export function excelSerialToClock(value: unknown): string | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) {
    const text = String(value).trim();
    return text || null;
  }
  const totalMinutes = Math.round(Math.abs(n) * 24 * 60);
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatMinutes(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/** Serial Excel (fração de 24h) → minutos decimais (coluna «Tempo de Penalização»). */
export function excelSerialToMinutes(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  if (n > 0 && n < 1) {
    return Math.round(n * 24 * 60 * 100) / 100;
  }
  return n;
}

/** Segundos para ordenar tempos «H:MM» ou «H:MM:SS». */
export function parseTimeToSeconds(time: string | null | undefined): number | null {
  if (!time) return null;
  const parts = time.split(":").map((p) => Number(p.trim()));
  if (parts.some((p) => Number.isNaN(p))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}
