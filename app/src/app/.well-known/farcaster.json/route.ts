function withValidProperties(
  properties: Record<string, undefined | string | string[] | boolean>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return true; // keep both true and false
      return !!value;
    })
  );
}

function parseAllowedAddresses(input: unknown): string[] | undefined {
  if (!input) return undefined;
  if (Array.isArray(input)) return input as string[];
  if (typeof input === 'string') {
    try {
      const asJson = JSON.parse(input);
      if (Array.isArray(asJson)) return asJson as string[];
    } catch {
      return input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return undefined;
}

function parseTags(input: unknown): string[] | undefined {
  const normalize = (s: string) => s.toLowerCase().trim();
  const valid = (s: string) => /^[a-z0-9-]{1,20}$/.test(s);
  let tags: string[] = [];
  if (!input) return undefined;
  if (Array.isArray(input)) tags = input as string[];
  else if (typeof input === 'string') {
    try {
      const asJson = JSON.parse(input);
      if (Array.isArray(asJson)) tags = asJson as string[];
      else tags = input.split(',');
    } catch {
      tags = input.split(',');
    }
  }
  const cleaned = Array.from(new Set(tags.map(normalize).filter(valid))).slice(0, 5);
  return cleaned.length > 0 ? cleaned : undefined;
}

function parseRequiredChains(input: unknown): string[] | undefined {
  if (!input) return undefined;
  if (Array.isArray(input)) return input as string[];
  if (typeof input === 'string') {
    try {
      const asJson = JSON.parse(input);
      if (Array.isArray(asJson)) return asJson as string[];
    } catch {
      return input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return undefined;
}

function parseScreenshotUrls(input: unknown): string[] | undefined {
  const toArray = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val as string[];
    if (typeof val === 'string') {
      try {
        const asJson = JSON.parse(val);
        if (Array.isArray(asJson)) return asJson as string[];
      } catch {
        return val.split(',');
      }
    }
    return [];
  };
  const urls = toArray(input)
    .map((u) => u.trim())
    .filter((u) => /^https:\/\//i.test(u))
    .slice(0, 3);
  return urls.length ? urls : undefined;
}

export async function GET(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_URL;
  const inferredOrigin = (() => {
    try {
      return new URL(req.url).origin;
    } catch {
      return undefined;
    }
  })();
  const rawBase = envUrl || inferredOrigin;
  if (!rawBase) {
    return new Response(JSON.stringify({ error: 'Base URL missing. Set NEXT_PUBLIC_URL or ensure request has a valid origin.' }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  }
  const BASE = rawBase.replace(/\/$/, '');

  const tags =
  parseTags(process.env.NEXT_PUBLIC_APP_TAGS)  
  const requiredChains =
    parseRequiredChains(process.env.NEXT_PUBLIC_REQUIRED_CHAINS)

  const payload = {
    accountAssociation: {
      header: process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION_HEADER,
      payload: process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION_PAYLOAD,
      signature: process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION_SIGNATURE,
    },
    frame: withValidProperties({
      version: '1',
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
      buttonTitle: process.env.NEXT_PUBLIC_APP_BUTTON_TITLE,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: BASE,
      canonicalDomain: new URL(BASE).host,
      webhookUrl: `${BASE}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      tags,
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
      requiredChains,
      noindex: false,
    }),
    baseBuilder: {
      allowedAddresses:
        parseAllowedAddresses(process.env.NEXT_PUBLIC_BASE_BUILDER_ALLOWED_ADDRESSES)
    },
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
