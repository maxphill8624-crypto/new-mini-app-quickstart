const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Claude's Shopping List",
    subtitle: "Smart Shopping List Manager",
    description: "Keep track of your shopping items with categories, quantities, and purchase status",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#0a0a0a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "lifestyle",
    tags: ["shopping", "productivity", "list", "organizer"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Never forget what to buy",
    ogTitle: "Claude's Shopping List - Smart Shopping Manager",
    ogDescription: "Keep track of your shopping items with ease",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

