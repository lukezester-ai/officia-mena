import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = 'https://officia-mena.com';

  const robotsTxt = `# robots.txt - Officia MENA
User-agent: *
Allow: /
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Disallow: /api/
Disallow: /dashboard/
Disallow: /login
Disallow: /auth/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-Delay: 10
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
