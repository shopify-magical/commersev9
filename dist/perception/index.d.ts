import type { Observation } from '../types/index.js';
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
export interface SensorConfig {
    id: string;
    type: string;
    intervalMs: number;
    enabled: boolean;
    params: Record<string, unknown>;
}
export declare abstract class Sensor {
    abstract readonly id: string;
    abstract readonly type: string;
    protected lastReading: Observation | null;
    protected enabled: boolean;
    abstract read(): Promise<Observation>;
    abstract validate(data: unknown): boolean;
    getLastReading(): Observation | null;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
}
export declare class PerceptionModule {
    private events;
    private logger;
    private sensors;
    private observations;
    private maxObservations;
    private timers;
    constructor(events: EventBus, logger: Logger);
    registerSensor(sensor: Sensor): void;
    unregisterSensor(id: string): void;
    startSensor(id: string, intervalMs: number): void;
    stopSensor(id: string): void;
    startAll(): void;
    stopAll(): void;
    private addObservation;
    getObservations(limit?: number, type?: string): Observation[];
    getLatestObservation(type?: string): Observation | null;
    getSensorCount(): number;
    getActiveSensorCount(): number;
    clear(): void;
}
export declare class TimerSensor extends Sensor {
    readonly id = "timer";
    readonly type = "temporal";
    private tickCount;
    read(): Promise<Observation>;
    validate(data: unknown): boolean;
}
export declare class MetricSensor extends Sensor {
    readonly id = "metrics";
    readonly type = "system";
    private getMetrics;
    constructor(getMetrics: () => Record<string, number>);
    read(): Promise<Observation>;
    validate(data: unknown): boolean;
}
