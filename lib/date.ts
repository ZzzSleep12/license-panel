// lib/date.ts
import { NO_EXPIRY_EPOCH } from "./supabaseAdmin";

/** Recibe epoch seconds y devuelve string legible en zona local */
export function fmtEpochLocal(epochSec: number) {
  if (!epochSec) return "—";
  if (epochSec >= NO_EXPIRY_EPOCH) return "Sin caducidad";
  const d = new Date(epochSec * 1000);
  // dd/mm/yyyy, HH:MM:ss (local)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Calcula expires_at a partir de issued_at y days (0 = sin caducidad) */
export function calcExpiry(issuedAt: number, days: number, sentinel: number) {
  if (!days || days <= 0) return sentinel;
  return issuedAt + days * 86400;
}
