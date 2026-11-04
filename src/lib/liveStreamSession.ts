/** Serializes camera commands so a late stop cannot terminate a newly opened stream. */
export class LiveStreamSession {
  private tail: Promise<void> = Promise.resolve();
  private readonly request: (url: string, init: RequestInit) => Promise<Response>;

  constructor(request: (url: string, init: RequestInit) => Promise<Response> = fetch) {
    this.request = request;
  }

  open(cameraId: string, channel: number, onStarted: () => void, onError: (error: Error) => void): () => void {
    let closed = false;
    let issued = false;
    const base = `/api/dashcams/${encodeURIComponent(cameraId)}/stream`;
    this.enqueue(async () => {
      if (closed) return;
      issued = true;
      try {
        const response = await this.request(`${base}/start?channel=${channel}`, { method: "POST" });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.message ?? (response.status === 401 ? "Your session expired. Sign in again." : "Could not start live video. Please retry."));
        }
        if (!closed) onStarted();
      } catch (cause) {
        if (!closed) onError(cause instanceof Error ? cause : new Error("Unable to connect to the camera."));
      }
    });
    return () => {
      if (closed) return;
      closed = true;
      this.enqueue(async () => {
        if (issued) await this.request(`${base}/stop?channel=${channel}`, { method: "POST", keepalive: true });
      });
    };
  }

  private enqueue(operation: () => Promise<void>): void {
    this.tail = this.tail.then(operation, operation).catch(() => undefined);
  }
}
