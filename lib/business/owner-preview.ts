import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
export const previewCookie = "uniq-owner-preview";
export function localPreviewAllowed(request: Request) {
  const host = new URL("http://" + (request.headers.get("host") || new URL(request.url).host)).hostname;
  return process.env.NODE_ENV === "development" && ["localhost","127.0.0.1","[::1]"].includes(host)
    && !!process.env.OWNER_PREVIEW_PIN && !!process.env.OWNER_PREVIEW_SECRET;
}
export function samePreviewOrigin(request: Request) {
  try { return new URL(request.headers.get("origin") || "").host === (request.headers.get("host") || new URL(request.url).host); }
  catch { return false; }
}
function signature(value: string) { return createHmac("sha256", process.env.OWNER_PREVIEW_SECRET || "").update(value).digest("hex"); }
export function previewToken() {
  const expires = String(Date.now() + 2 * 60 * 60 * 1000);
  return expires + "." + signature(expires);
}
export function validPreviewToken(value?: string) {
  if (!value || !process.env.OWNER_PREVIEW_SECRET) return false;
  const [expires, supplied] = value.split(".");
  if (!/^[0-9]{13}$/.test(expires || "") || !/^[a-f0-9]{64}$/.test(supplied || "") || Number(expires) < Date.now()) return false;
  return timingSafeEqual(Buffer.from(signature(expires)), Buffer.from(supplied));
}
export function validPin(pin: unknown) {
  if (typeof pin !== "string" || !/^[0-9]{4}$/.test(pin)) return false;
  const expected=process.env.OWNER_PREVIEW_PIN || "";
  return expected.length===pin.length && timingSafeEqual(Buffer.from(pin),Buffer.from(expected));
}
