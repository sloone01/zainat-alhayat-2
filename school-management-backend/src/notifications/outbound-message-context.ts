import { AsyncLocalStorage } from 'async_hooks';

export type OutboundMessageContext = {
  schoolId?: string | null;
  templateKey?: string | null;
  recipientUserId?: string | null;
  source?: string | null;
  resentFromId?: string | null;
};

const storage = new AsyncLocalStorage<OutboundMessageContext>();

export function runWithOutboundContext<T>(
  ctx: OutboundMessageContext,
  fn: () => Promise<T>,
): Promise<T> {
  const parent = storage.getStore();
  return storage.run({ ...(parent ?? {}), ...ctx }, fn);
}

export function getOutboundContext(): OutboundMessageContext | undefined {
  return storage.getStore();
}
