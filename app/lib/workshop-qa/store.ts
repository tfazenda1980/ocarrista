import { Redis } from "@upstash/redis";
import type { QaQuestion, QaRoomId } from "./types";

const TTL_SECONDS = 60 * 60 * 48;

function storageKey(year: string, room: QaRoomId): string {
  return `workshop-qa:${year}:${room}`;
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Em produção (Vercel) é obrigatório; em local usa memória do servidor de dev. */
export function hasPersistentStorage(): boolean {
  return getRedis() !== null;
}

export function storageMode(): "redis" | "local" | "unavailable" {
  if (getRedis()) return "redis";
  if (process.env.VERCEL) return "unavailable";
  return "local";
}

type DevGlobal = typeof globalThis & {
  __workshopQaStore?: Map<string, QaQuestion[]>;
  __workshopQaRate?: Map<string, number>;
};

function devStore(): Map<string, QaQuestion[]> {
  const g = globalThis as DevGlobal;
  if (!g.__workshopQaStore) g.__workshopQaStore = new Map();
  return g.__workshopQaStore;
}

function devRateStore(): Map<string, number> {
  const g = globalThis as DevGlobal;
  if (!g.__workshopQaRate) g.__workshopQaRate = new Map();
  return g.__workshopQaRate;
}

export async function listQuestions(
  year: string,
  room: QaRoomId,
): Promise<QaQuestion[]> {
  const key = storageKey(year, room);
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<QaQuestion[]>(key);
    return Array.isArray(data) ? data : [];
  }
  return devStore().get(key) ?? [];
}

export async function addQuestion(
  year: string,
  question: QaQuestion,
): Promise<void> {
  const key = storageKey(year, question.room);
  const list = await listQuestions(year, question.room);
  list.push(question);
  const redis = getRedis();
  if (redis) {
    await redis.set(key, list, { ex: TTL_SECONDS });
    return;
  }
  devStore().set(key, list);
}

export async function deleteQuestion(
  year: string,
  room: QaRoomId,
  id: string,
): Promise<boolean> {
  const list = await listQuestions(year, room);
  const next = list.filter((q) => q.id !== id);
  if (next.length === list.length) return false;
  const key = storageKey(year, room);
  const redis = getRedis();
  if (redis) {
    await redis.set(key, next, { ex: TTL_SECONDS });
  } else {
    devStore().set(key, next);
  }
  return true;
}

export async function updateQuestionStatus(
  year: string,
  room: QaRoomId,
  id: string,
  status: QaQuestion["status"],
): Promise<QaQuestion | null> {
  const list = await listQuestions(year, room);
  const index = list.findIndex((q) => q.id === id);
  if (index < 0) return null;
  list[index] = { ...list[index], status };
  const key = storageKey(year, room);
  const redis = getRedis();
  if (redis) {
    await redis.set(key, list, { ex: TTL_SECONDS });
  } else {
    devStore().set(key, list);
  }
  return list[index];
}

function rateKey(year: string, room: QaRoomId, ip: string): string {
  return `workshop-qa-rate:${year}:${room}:${ip}`;
}

export async function countRecentByIp(
  year: string,
  room: QaRoomId,
  ip: string,
): Promise<number> {
  const key = rateKey(year, room, ip);
  const redis = getRedis();
  if (redis) {
    const n = await redis.get<number>(key);
    return typeof n === "number" ? n : 0;
  }
  return devRateStore().get(key) ?? 0;
}

export async function incrementRate(
  year: string,
  room: QaRoomId,
  ip: string,
): Promise<void> {
  const key = rateKey(year, room, ip);
  const redis = getRedis();
  if (redis) {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, 3600);
    return;
  }
  const prev = devRateStore().get(key) ?? 0;
  devRateStore().set(key, prev + 1);
}
