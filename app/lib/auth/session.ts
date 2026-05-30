import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  role?: "admin" | "user";
  memberId?: string;
  email?: string;
  name?: string;
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "dev-only-change-in-production-min-32-chars!!",
  cookieName: "ocarrista_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export { sessionOptions };
