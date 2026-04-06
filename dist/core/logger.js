const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
export class Logger {
    config;
    entries;
    entryIndex = 0;
    entryCount = 0;
    maxEntries;
    minLevel;
    constructor(config) {
        this.config = config;
        this.minLevel = LOG_LEVELS[config.logLevel];
        this.maxEntries = 10000;
        this.entries = new Array(this.maxEntries);
    }
    shouldLog(level) {
        return LOG_LEVELS[level] >= this.minLevel;
    }
    addEntry(entry) {
        this.entries[this.entryIndex] = entry;
        this.entryIndex = (this.entryIndex + 1) % this.maxEntries;
        if (this.entryCount < this.maxEntries)
            this.entryCount++;
        const prefix = `[${new Date(entry.timestamp).toISOString()}] [${entry.level.toUpperCase()}] [${entry.module}]`;
        const msg = `${prefix} ${entry.message}`;
        if (entry.level === 'error') {
            console.error(msg, entry.error ?? '', entry.data ?? '');
        }
        else if (entry.level === 'warn') {
            console.warn(msg, entry.data ?? '');
        }
        else {
            console.log(msg, entry.data ?? '');
        }
    }
    debug(module, message, data) {
        if (this.shouldLog('debug')) {
            this.addEntry({ timestamp: Date.now(), level: 'debug', module, message, data });
        }
    }
    info(module, message, data) {
        if (this.shouldLog('info')) {
            this.addEntry({ timestamp: Date.now(), level: 'info', module, message, data });
        }
    }
    warn(module, message, data) {
        if (this.shouldLog('warn')) {
            this.addEntry({ timestamp: Date.now(), level: 'warn', module, message, data });
        }
    }
    error(module, message, error, data) {
        if (this.shouldLog('error')) {
            this.addEntry({ timestamp: Date.now(), level: 'error', module, message, error, data });
        }
    }
    getEntries(level, limit) {
        const all = this.getAllEntries();
        let filtered = level ? all.filter(e => e.level === level) : all;
        if (limit)
            filtered = filtered.slice(-limit);
        return filtered;
    }
    getEntriesSince(timestamp) {
        return this.getAllEntries().filter(e => e.timestamp >= timestamp);
    }
    getAllEntries() {
        if (this.entryCount === 0)
            return [];
        if (this.entryCount < this.maxEntries)
            return this.entries.slice(0, this.entryCount);
        return [
            ...this.entries.slice(this.entryIndex),
            ...this.entries.slice(0, this.entryIndex),
        ];
    }
    clear() {
        this.entryIndex = 0;
        this.entryCount = 0;
    }
    getStats() {
        const byLevel = { debug: 0, info: 0, warn: 0, error: 0 };
        const all = this.getAllEntries();
        for (const entry of all) {
            byLevel[entry.level]++;
        }
        return { total: all.length, byLevel };
    }
}
//# sourceMappingURL=logger.js.map