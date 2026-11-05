import "server-only"
import * as cookieSignature from "cookie-signature"
import { cookies } from "next/headers"

const KAMRA_SESSION_SECRET = process.env.KAMRA_SESSION_SECRET || "default_mock_secret_for_tests"
const COOKIE_NAME = "kamra_pass"

export function signPassCookie(value: string): string {
  return "s:" + cookieSignature.sign(value, KAMRA_SESSION_SECRET)
}

export function verifyPassCookie(signedValue: string): string | false {
  if (!signedValue.startsWith("s:")) return false
  const value = signedValue.slice(2)
  return cookieSignature.unsign(value, KAMRA_SESSION_SECRET)
}

export async function setKamraPassCookie() {
  const cookieStore = await cookies()
  const signed = signPassCookie("valid")
  cookieStore.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export async function hasKamraPass(): Promise<boolean> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  if (!cookie) return false
  return verifyPassCookie(cookie.value) === "valid"
}
