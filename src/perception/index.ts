import type { Observation, UUID } from '../types/index.js';
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';

export interface SensorConfig {
  id: string;
  type: string;
  intervalMs: number;
  enabled: boolean;
  params: Record<string, unknown>;
}

export abstract class Sensor {
  abstract readonly id: string;
  abstract readonly type: string;
  protected lastReading: Observation | null = null;
  protected enabled = true;

  abstract read(): Promise<Observation>;
  abstract validate(data: unknown): boolean;

  getLastReading(): Observation | null {
    return this.lastReading;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export class PerceptionModule {
  private sensors = new Map<string, Sensor>();
  private observations: Observation[] = [];
  private maxObservations = 1000;
  private timers = new Map<string, ReturnType<typeof setInterval>>();

  constructor(
    private events: EventBus,
    private logger: Logger,
  ) {}

  registerSensor(sensor: Sensor): void {
    this.sensors.set(sensor.id, sensor);
    this.logger.info('Perception', `Sensor registered: ${sensor.id} (${sensor.type})`);
    this.events.emit('sensor:registered', { id: sensor.id, type: sensor.type });
  }

  unregisterSensor(id: string): void {
    this.stopSensor(id);
    this.sensors.delete(id);
    this.logger.info('Perception', `Sensor unregistered: ${id}`);
  }

  startSensor(id: string, intervalMs: number): void {
    const sensor = this.sensors.get(id);
    if (!sensor || !sensor.isEnabled()) return;

    this.stopSensor(id);
    const timer = setInterval(async () => {
      try {
        const observation = await sensor.read();
        if (sensor.validate(observation.data)) {
          this.addObservation(observation);
          this.events.emit('observation', observation);
        }
      } catch (err) {
        this.logger.error('Perception', `Sensor ${id} read failed`, err as Error);
      }
    }, intervalMs);

    this.timers.set(id, timer);
    this.logger.info('Perception', `Sensor started: ${id} @ ${intervalMs}ms`);
  }

  stopSensor(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
      this.logger.info('Perception', `Sensor stopped: ${id}`);
    }
  }

  startAll(): void {
    for (const [id, sensor] of this.sensors) {
      if (sensor.isEnabled()) {
        this.startSensor(id, 5000);
      }
    }
  }

  stopAll(): void {
    for (const id of this.timers.keys()) {
      this.stopSensor(id);
    }
  }

  private addObservation(obs: Observation): void {
    this.observations.push(obs);
    if (this.observations.length > this.maxObservations) {
      this.observations = this.observations.slice(-this.maxObservations);
    }
  }

  getObservations(limit?: number, type?: string): Observation[] {
    let filtered = type ? this.observations.filter(o => o.type === type) : this.observations;
    if (limit) filtered = filtered.slice(-limit);
    return [...filtered];
  }

  getLatestObservation(type?: string): Observation | null {
    if (type) {
      for (let i = this.observations.length - 1; i >= 0; i--) {
        if (this.observations[i].type === type) return this.observations[i];
      }
      return null;
    }
    return this.observations.length > 0 ? this.observations[this.observations.length - 1] : null;
  }

  getSensorCount(): number {
    return this.sensors.size;
  }

  getActiveSensorCount(): number {
    return this.timers.size;
  }

  clear(): void {
    this.stopAll();
    this.observations = [];
  }
}

// Built-in sensors
export class TimerSensor extends Sensor {
  readonly id = 'timer';
  readonly type = 'temporal';
  private tickCount = 0;

  async read(): Promise<Observation> {
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

  validate(data: unknown): boolean {
    return typeof data === 'object' && data !== null && 'tick' in data;
  }
}

export class MetricSensor extends Sensor {
  readonly id = 'metrics';
  readonly type = 'system';
  private getMetrics: () => Record<string, number>;

  constructor(getMetrics: () => Record<string, number>) {
    super();
    this.getMetrics = getMetrics;
  }

  async read(): Promise<Observation> {
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

  validate(data: unknown): boolean {
    return typeof data === 'object' && data !== null;
  }
}
