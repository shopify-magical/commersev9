export class EventBus {
    handlers = new Map();
    onceHandlers = new Map();
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
        return () => this.off(event, handler);
    }
    emit(event, ...args) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(...args);
                }
                catch (err) {
                    console.error(`[EventBus] Error in handler for "${event}":`, err);
                }
            }
        }
    }
    off(event, handler) {
        this.handlers.get(event)?.delete(handler);
        const onceWrapper = this.onceHandlers.get(handler);
        if (onceWrapper) {
            this.handlers.get(event)?.delete(onceWrapper);
            this.onceHandlers.delete(handler);
        }
    }
    once(event, handler) {
        const wrapper = (...args) => {
            this.off(event, handler);
            handler(...args);
        };
        this.onceHandlers.set(handler, wrapper);
        this.on(event, wrapper);
    }
    removeAllListeners(event) {
        if (event) {
            this.handlers.delete(event);
        }
        else {
            this.handlers.clear();
            this.onceHandlers.clear();
        }
    }
    listenerCount(event) {
        return this.handlers.get(event)?.size ?? 0;
    }
}
//# sourceMappingURL=event-bus.js.map