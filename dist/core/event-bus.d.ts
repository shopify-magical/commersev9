import type { EventBus as IEventBus } from '../types/index.js';
type EventHandler = (...args: unknown[]) => void;
export declare class EventBus implements IEventBus {
    private handlers;
    private onceHandlers;
    on(event: string, handler: EventHandler): () => void;
    emit(event: string, ...args: unknown[]): void;
    off(event: string, handler: EventHandler): void;
    once(event: string, handler: EventHandler): void;
    removeAllListeners(event?: string): void;
    listenerCount(event: string): number;
}
export {};
