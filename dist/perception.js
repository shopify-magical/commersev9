export class Sensor {
    lastReading = null;
    enabled = true;
    getLastReading() {
        return this.lastReading;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
}
export class PerceptionModule {
    events;
    logger;
    sensors = new Map();
    observations = [];
    maxObservations = 1000;
    timers = new Map();
    constructor(events, logger) {
        this.events = events;
        this.logger = logger;
    }
    registerSensor(sensor) {
        this.sensors.set(sensor.id, sensor);
        this.logger.info('Perception', `Sensor registered: ${sensor.id} (${sensor.type})`);
        this.events.emit('sensor:registered', { id: sensor.id, type: sensor.type });
    }
    unregisterSensor(id) {
        this.stopSensor(id);
        this.sensors.delete(id);
        this.logger.info('Perception', `Sensor unregistered: ${id}`);
    }
    startSensor(id, intervalMs) {
        const sensor = this.sensors.get(id);
        if (!sensor || !sensor.isEnabled())
            return;
        this.stopSensor(id);
        const timer = setInterval(async () => {
            try {
                const observation = await sensor.read();
                if (sensor.validate(observation.data)) {
                    this.addObservation(observation);
                    this.events.emit('observation', observation);
                }
            }
            catch (err) {
                this.logger.error('Perception', `Sensor ${id} read failed`, err);
            }
        }, intervalMs);
        this.timers.set(id, timer);
        this.logger.info('Perception', `Sensor started: ${id} @ ${intervalMs}ms`);
    }
    stopSensor(id) {
        const timer = this.timers.get(id);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(id);
            this.logger.info('Perception', `Sensor stopped: ${id}`);
        }
    }
    startAll() {
        for (const [id, sensor] of this.sensors) {
            if (sensor.isEnabled()) {
                this.startSensor(id, 5000);
            }
        }
    }
    stopAll() {
        for (const id of this.timers.keys()) {
            this.stopSensor(id);
        }
    }
    addObservation(obs) {
        this.observations.push(obs);
        if (this.observations.length > this.maxObservations) {
            this.observations = this.observations.slice(-this.maxObservations);
        }
    }
    getObservations(limit, type) {
        let filtered = type ? this.observations.filter(o => o.type === type) : this.observations;
        if (limit)
            filtered = filtered.slice(-limit);
        return [...filtered];
    }
    getLatestObservation(type) {
        if (type) {
            for (let i = this.observations.length - 1; i >= 0; i--) {
                if (this.observations[i].type === type)
                    return this.observations[i];
            }
            return null;
        }
        return this.observations.length > 0 ? this.observations[this.observations.length - 1] : null;
    }
    getSensorCount() {
        return this.sensors.size;
    }
    getActiveSensorCount() {
        return this.timers.size;
    }
    clear() {
        this.stopAll();
        this.observations = [];
    }
}
// Built-in sensors
export class TimerSensor extends Sensor {
    id = 'timer';
    type = 'temporal';
    tickCount = 0;
    async read() {
        this.tickCount++;
        const now = Date.now();
        this.lastReading = {
            id: `obs_${now}_${this.tickCount}`,
            timestamp: now,
            source: this.id,
            type: this.type,
            data: { tick: this.tickCount, time: now },
            confidence: 1.0,
            metadata: {},
        };
        return this.lastReading;
    }
    validate(data) {
        return typeof data === 'object' && data !== null && 'tick' in data;
    }
}
export class MetricSensor extends Sensor {
    id = 'metrics';
    type = 'system';
    getMetrics;
    constructor(getMetrics) {
        super();
        this.getMetrics = getMetrics;
    }
    async read() {
        const metrics = this.getMetrics();
        this.lastReading = {
            id: `obs_metrics_${Date.now()}`,
            timestamp: Date.now(),
            source: this.id,
            type: this.type,
            data: metrics,
            confidence: 1.0,
            metadata: { source: 'internal' },
        };
        return this.lastReading;
    }
    validate(data) {
        return typeof data === 'object' && data !== null;
    }
}
//# sourceMappingURL=perception.js.map