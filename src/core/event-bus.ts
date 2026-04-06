import type { EventBus as IEventBus } from '../types/index.js';

type EventHandler = (...args: unknown[]) => void;

export class EventBus implements IEventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private onceHandlers = new Map<EventHandler, EventHandler>();

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      }
    }
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
    const onceWrapper = this.onceHandlers.get(handler);
    if (onceWrapper) {
      this.handlers.get(event)?.delete(onceWrapper);
      this.onceHandlers.delete(handler);
    }
  }

  once(event: string, handler: EventHandler): void {
    const wrapper: EventHandler = (...args) => {
      this.off(event, handler);
      handler(...args);
    };
    this.onceHandlers.set(handler, wrapper);
    this.on(event, wrapper);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
      this.onceHandlers.clear();
    }
  }

  listenerCount(event: string): number {
    return this.handlers.get(event)?.size ?? 0;
  }
}
