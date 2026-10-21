export function httpBaseToLiveWs(httpBase: string): string {
  const u = new URL(httpBase);
  return `ws://${u.host}/live`;
}

export function broadcastWithTimeout(ws: WebSocket, timeoutMs = 500): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`broadcast timeout after ${timeoutMs}ms`)),
      timeoutMs,
    );
    ws.addEventListener(
      "message",
      (e) => {
        clearTimeout(timer);
        resolve(JSON.parse(e.data as string));
      },
      { once: true },
    );
  });
}

export function wsOpened(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve(), { once: true });
    ws.addEventListener("error", () => reject(new Error("WebSocket connection error")), {
      once: true,
    });
  });
}
