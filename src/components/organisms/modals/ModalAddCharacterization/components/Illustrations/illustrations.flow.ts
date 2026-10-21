import { v4 as uuid } from 'uuid';
import {
  asIllustrationError,
  Generation,
  Illustration,
  IllustrationApi,
  Scope,
} from './illustrations.api';
export function browserSessionStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}
export type Pending = { key: string; generationId?: string };
export type FlowState = {
  pending: Pending | null;
  generation: Generation | null;
  busy: boolean;
  error: string;
  approved: Illustration | null;
};
const validUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
export const sessionKey = (s: Scope) =>
  'simplesst:illustration:v1:' +
  JSON.stringify([s.userId, s.companyId, s.workspaceId, s.characterizationId]);
export function readPending(
  storage: Storage | undefined,
  scope: Scope,
): Pending | null {
  try {
    const text = storage?.getItem(sessionKey(scope));
    if (!text || text.length > 256) return null;
    const p = JSON.parse(text);
    return validUuid(p.key) && (!p.generationId || validUuid(p.generationId))
      ? {
          key: p.key,
          ...(p.generationId ? { generationId: p.generationId } : {}),
        }
      : null;
  } catch {
    return null;
  }
}
/** Shared UI state machine. Never retries generation automatically. Stores IDs only. */
export class IllustrationFlow {
  private state: FlowState = {
    pending: null,
    generation: null,
    busy: false,
    error: '',
    approved: null,
  };
  private listeners = new Set<() => void>();
  constructor(
    private api: IllustrationApi,
    private scope: Scope,
    private storage?: Storage,
  ) {
    this.state = { ...this.state, pending: readPending(storage, scope) };
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.state;
  private set(change: Partial<FlowState>) {
    this.state = { ...this.state, ...change };
    this.listeners.forEach((fn) => fn());
  }
  private pending(value: Pending | null) {
    try {
      if (value)
        this.storage?.setItem(sessionKey(this.scope), JSON.stringify(value));
      else this.storage?.removeItem(sessionKey(this.scope));
    } catch {
      /* Recovery remains available in memory. */
    }
    this.set({ pending: value });
  }
  private result(generation: Generation) {
    this.pending(
      ['DISCARDED', 'EXPIRED', 'FAILED', 'APPROVED'].includes(generation.status)
        ? null
        : {
            key: this.state.pending!.key,
            generationId: generation.generationId,
          },
    );
    this.set({ generation, error: '' });
  }
  private async failure(e: unknown, initial = false) {
    const error = await asIllustrationError(e);
    if (error.generationId && this.state.pending)
      this.pending({ ...this.state.pending, generationId: error.generationId });
    if (initial && [400, 401, 403, 404, 410, 429].includes(error.status))
      this.pending(null);
    this.set({ error: error.message });
  }
  async generate(dirty: boolean) {
    if (this.state.busy || this.state.pending) return;
    if (dirty) {
      this.set({
        error: 'Salve as alterações da caracterização antes de gerar.',
      });
      return;
    }
    this.pending({ key: uuid() });
    this.set({ busy: true, error: '', generation: null, approved: null });
    try {
      this.result(await this.api.generate(this.scope, this.state.pending!.key));
    } catch (e) {
      await this.failure(e, true);
    } finally {
      this.set({ busy: false });
    }
  }
  async recover() {
    const p = this.state.pending;
    if (!p || this.state.busy) return;
    this.set({ busy: true, error: '' });
    try {
      this.result(
        p.generationId
          ? await this.api.status(this.scope, p.generationId)
          : await this.api.generate(this.scope, p.key),
      );
    } catch (e) {
      await this.failure(e);
    } finally {
      this.set({ busy: false });
    }
  }
  async approve() {
    const g = this.state.generation;
    if (this.state.busy || g?.status !== 'READY' || !this.state.pending)
      return false;
    this.set({ busy: true, error: '' });
    try {
      const approved = await this.api.approve(this.scope, g.generationId);
      this.pending(null);
      this.set({ approved, generation: null });
      return true;
    } catch (e) {
      await this.failure(e);
      return false;
    } finally {
      this.set({ busy: false });
    }
  }
  async discard() {
    const g = this.state.generation;
    if (this.state.busy || g?.status !== 'READY') return false;
    this.set({ busy: true, error: '' });
    try {
      this.result(await this.api.discard(this.scope, g.generationId));
      return true;
    } catch (e) {
      await this.failure(e);
      return false;
    } finally {
      this.set({ busy: false });
    }
  }
  async regenerate(dirty: boolean) {
    if (dirty) {
      this.set({ error: 'Salve as alterações antes de gerar outra imagem.' });
      return;
    }
    if (await this.discard()) await this.generate(false);
  }
}
