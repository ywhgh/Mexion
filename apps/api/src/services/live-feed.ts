export type LiveEvent = {
  type: "request";
  ts: string;
  model: string;
  provider: string;
  status: number;
  durationMs: number;
  cost: number;
  keyPrefix: string | null;
};

type LiveEventInput = LiveEvent & { userId?: number | null };
type LiveClient = {
  controller: ReadableStreamDefaultController<Uint8Array>;
  userId: number | null;
  role: string;
};

const encoder = new TextEncoder();
const clients = new Map<string, LiveClient>();

function clientKey(userId: number | null, role: string): string {
  return `${role}:${userId ?? "anon"}`;
}

function publicEvent(event: LiveEventInput): LiveEvent {
  return {
    type: event.type,
    ts: event.ts,
    model: event.model,
    provider: event.provider,
    status: event.status,
    durationMs: event.durationMs,
    cost: event.cost,
    keyPrefix: event.keyPrefix,
  };
}

function enqueue(client: LiveClient, chunk: Uint8Array): boolean {
  try {
    client.controller.enqueue(chunk);
    return true;
  } catch {
    clients.delete(clientKey(client.userId, client.role));
    return false;
  }
}

export function registerLiveClient(
  controller: ReadableStreamDefaultController<Uint8Array>,
  opts: { userId?: number | null; role?: string | null } = {},
): () => void {
  const userId = opts.userId ?? null;
  const role = opts.role || "user";
  const key = clientKey(userId, role);
  const existing = clients.get(key);
  if (existing) {
    try {
      existing.controller.close();
    } catch {
      // The previous tab may already be gone.
    }
    clients.delete(key);
  }
  clients.set(key, { controller, userId, role });
  return () => {
    const current = clients.get(key);
    if (current?.controller === controller) clients.delete(key);
  };
}

export function broadcastLiveEvent(event: LiveEventInput): void {
  const payload = publicEvent(event);
  const chunk = encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
  for (const client of clients.values()) {
    if (client.role !== "admin" && event.userId !== undefined && event.userId !== null && client.userId !== event.userId) {
      continue;
    }
    enqueue(client, chunk);
  }
}

export function liveClientCount(): number {
  return clients.size;
}
