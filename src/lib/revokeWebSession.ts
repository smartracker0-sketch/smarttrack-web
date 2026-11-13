import 'server-only';
import { serverBackendUrl } from './serverBackendUrl';

export async function revokeWebRefreshToken(refreshToken: string | undefined): Promise<boolean> {
  if (!refreshToken) return true;
  try {
    const response = await fetch(`${serverBackendUrl()}/api/v1/auth/logout`, {
      method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({refreshToken}),
      cache: 'no-store', signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch { return false; }
}
