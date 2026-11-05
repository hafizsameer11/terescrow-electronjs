import { createHash, createHmac, randomBytes } from 'crypto'

export type StaffSigningMaterial = {
  requestSigningKey: string
  requestSigningKid: string
  requestSigningExpiresAt: string
}

export type StaffHmacHeaders = {
  'X-Staff-Kid': string
  'X-Staff-Ts': string
  'X-Staff-Nonce': string
  'X-Staff-Sig': string
}

let material: StaffSigningMaterial | null = null

function base64UrlToBuffer(b64url: string): Buffer {
  const pad = b64url.length % 4 === 0 ? '' : '='.repeat(4 - (b64url.length % 4))
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

export function setStaffSigningMaterial(next: StaffSigningMaterial | null): void {
  if (!next?.requestSigningKey || !next?.requestSigningKid) {
    material = null
    return
  }
  material = {
    requestSigningKey: String(next.requestSigningKey),
    requestSigningKid: String(next.requestSigningKid),
    requestSigningExpiresAt: String(next.requestSigningExpiresAt || ''),
  }
}

export function clearStaffSigningMaterial(): void {
  material = null
}

export function hasStaffSigningMaterial(): boolean {
  return !!material?.requestSigningKey && !!material?.requestSigningKid
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

function buildCanonical(parts: {
  ts: string
  nonce: string
  method: string
  pathWithQuery: string
  rawBody: string
}): string {
  return [
    parts.ts,
    parts.nonce,
    parts.method.toUpperCase(),
    parts.pathWithQuery,
    sha256Hex(parts.rawBody ?? ''),
  ].join('\n')
}

/**
 * Sign a staff API request. Returns null when no session key is loaded
 * (enforce-off rollout still works; enforce-on server will 403).
 */
export function signStaffRequest(input: {
  method: string
  pathWithQuery: string
  rawBody?: string
}): StaffHmacHeaders | null {
  if (!material) return null

  if (material.requestSigningExpiresAt) {
    const exp = Date.parse(material.requestSigningExpiresAt)
    if (Number.isFinite(exp) && exp <= Date.now()) {
      material = null
      return null
    }
  }

  const ts = String(Date.now())
  const nonce = randomBytes(16).toString('hex')
  const canonical = buildCanonical({
    ts,
    nonce,
    method: input.method,
    pathWithQuery: input.pathWithQuery,
    rawBody: input.rawBody ?? '',
  })
  const keyBytes = base64UrlToBuffer(material.requestSigningKey)
  const sig = createHmac('sha256', keyBytes).update(canonical, 'utf8').digest('base64url')

  return {
    'X-Staff-Kid': material.requestSigningKid,
    'X-Staff-Ts': ts,
    'X-Staff-Nonce': nonce,
    'X-Staff-Sig': sig,
  }
}

/** Extract `/api/...` path + query from absolute or relative URL. */
export function pathWithQueryFromUrl(url: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const u = new URL(url)
      return `${u.pathname}${u.search}`
    }
  } catch {
    // fall through
  }
  const raw = String(url || '')
  if (raw.startsWith('/')) return raw
  // relative path without leading slash
  return `/${raw}`
}
