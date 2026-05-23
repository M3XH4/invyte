export type ParsedQrValue = {
  slug: string;
  type: 'public-rsvp';
  raw: string;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/i;

export function parseQrValue(value: string): ParsedQrValue | null {
  const raw = value.trim();
  if (!raw) return null;

  const jsonValue = parseJsonQr(raw);
  if (jsonValue) return jsonValue;

  const urlValue = parseUrlQr(raw);
  if (urlValue) return urlValue;

  const slug = sanitizeSlug(raw);
  return slug ? { slug, type: 'public-rsvp', raw } : null;
}

function parseJsonQr(raw: string): ParsedQrValue | null {
  if (!raw.startsWith('{')) return null;

  try {
    const payload = JSON.parse(raw) as { slug?: unknown; url?: unknown; public_url?: unknown; qr_value?: unknown };
    const directSlug = typeof payload.slug === 'string' ? sanitizeSlug(payload.slug) : null;
    if (directSlug) return { slug: directSlug, type: 'public-rsvp', raw };

    const nestedUrl = payload.public_url || payload.qr_value || payload.url;
    return typeof nestedUrl === 'string' ? parseQrValue(nestedUrl) : null;
  } catch {
    return null;
  }
}

function parseUrlQr(raw: string): ParsedQrValue | null {
  try {
    const url = new URL(raw);
    const segments = url.pathname.split('/').filter(Boolean);
    const markerIndex = segments.findIndex((segment) =>
      ['public-rsvp', 'e', 'event', 'invite'].includes(segment.toLowerCase()),
    );
    const candidate =
      markerIndex >= 0
        ? segments[markerIndex + 1]
        : ['public-rsvp', 'e', 'event', 'invite'].includes(url.hostname.toLowerCase())
          ? segments[0]
          : null;
    const slug = sanitizeSlug(candidate);

    if (!slug) return null;

    return {
      slug,
      type: 'public-rsvp',
      raw,
    };
  } catch {
    return null;
  }
}

function sanitizeSlug(value?: string | null) {
  if (!value) return null;
  const slug = decodeURIComponent(value).trim().replace(/^\/+|\/+$/g, '');
  return SLUG_PATTERN.test(slug) ? slug : null;
}
