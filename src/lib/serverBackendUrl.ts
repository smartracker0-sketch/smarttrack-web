import 'server-only';

export function serverBackendUrl() {
  const configured = process.env.TRACKPRO_API_BASE_URL || 'http://localhost:8080';
  try {
    const url = new URL(configured);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash)
      throw new Error('invalid');
    return url.href.replace(/\/$/, '');
  } catch {
    throw new Error('TRACKPRO_API_BASE_URL must be an HTTP(S) server URL without embedded credentials');
  }
}
