import type { ServerWebSocket } from "bun";

/**
 * M1: manual Set + ws.send. For multi-channel live updates, prefer Bun pub/sub:
 * `ws.subscribe("live")` in websocket.open and `server.publish("live", payload)` in fetch.
 */

export type LiveHub = {
  add(ws: ServerWebSocket): void;
  remove(ws: ServerWebSocket): void;
  publishAsync(payload: unknown): Promise<void>;
};

export function createLiveHub(): LiveHub {
  const clients = new Set<ServerWebSocket>();

  return {
    add(ws) {
      clients.add(ws);
    },
    remove(ws) {
      clients.delete(ws);
    },
    async publishAsync(payload) {
      const text = JSON.stringify(payload);
      for (const ws of clients) {
        ws.send(text);
      }
    },
  };
}
