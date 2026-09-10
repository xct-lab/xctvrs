const COOKIE = 'xctvrs_language';
const LANGUAGES = new Set(['fr', 'en']);

function preferredLanguage(request) {
  const match = (request.headers.get('cookie') || '').match(/(?:^|;\s*)xctvrs_language=(fr|en)(?:;|$)/);
  if (match) return match[1];
  return request.cf?.country === 'CA' && request.cf?.regionCode === 'QC' ? 'fr' : 'en';
}

function redirect(url, language) {
  const headers = new Headers({
    Location: url.toString(),
    'Cache-Control': 'private, no-store',
    Vary: 'Cookie',
  });
  if (language) headers.set('Set-Cookie', `${COOKIE}=${language}; Path=/; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax`);
  return new Response(null, { status: 302, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/assets/')) return env.ASSETS.fetch(request);
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    const prefix = url.pathname.match(/^\/(fr|en)(?=\/|$)/);
    const choice = url.searchParams.get('lang');
    if (LANGUAGES.has(choice)) {
      const pagePath = prefix ? url.pathname.slice(prefix[0].length) || '/' : url.pathname;
      url.pathname = '/' + choice + pagePath;
      url.searchParams.delete('lang');
      return redirect(url, choice);
    }
    if (!prefix) {
      url.pathname = '/' + preferredLanguage(request) + url.pathname;
      return redirect(url);
    }
    const language = prefix[1];
    if (url.pathname === '/' + language) {
      url.pathname += '/';
      return redirect(url);
    }
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const notFound = new URL('/' + language + '/404', url.origin);
      const page = await env.ASSETS.fetch(new Request(notFound, request));
      response = new Response(request.method === 'HEAD' ? null : page.body, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
    const headers = new Headers(response.headers);
    headers.set('Content-Language', language === 'fr' ? 'fr-CA' : 'en-CA');
    return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
  },
};
