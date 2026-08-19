/**
 * /api/sticker-proxy
 * 
 * Fetches sticker images from knightwolfshop.netlify.app server-side and
 * returns them as same-origin responses with explicit CORS headers.
 * 
 * This solves the canvas taint problem: the browser draws images loaded
 * through this proxy as same-origin, so getImageData() never throws a
 * SecurityError and Three.js can upload the UV canvas as a GPU texture.
 * 
 * Usage: /api/sticker-proxy?file=anime_back_afb1.webp
 */

const ALLOWED_ORIGIN = 'https://knightwolfshop.netlify.app/stickers/';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    // Basic validation — only allow files that look like sticker assets
    if (!file || !/^[\w_-]+\.(webp|png|jpg|jpeg)$/i.test(file)) {
        return new Response('Bad request', { status: 400 });
    }

    const targetUrl = `${ALLOWED_ORIGIN}${file}`;

    let upstream;
    try {
        upstream = await fetch(targetUrl, {
            // Server-side fetch; no CORS restrictions here
            headers: { 'User-Agent': 'KnightWolfConfigurator/1.0' }
        });
    } catch (err) {
        console.error('[sticker-proxy] fetch error:', err);
        return new Response('Upstream error', { status: 502 });
    }

    if (!upstream.ok) {
        return new Response(`Upstream returned ${upstream.status}`, {
            status: upstream.status
        });
    }

    const contentType = upstream.headers.get('content-type') || 'image/webp';
    const body = await upstream.arrayBuffer();

    return new Response(body, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            'Access-Control-Allow-Origin': '*',
        }
    });
}
