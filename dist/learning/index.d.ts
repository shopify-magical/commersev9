import type { Experience, KnowledgeEntry, LearningModel } from '../types/index.js';
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
export declare class KnowledgeBase {
    private retentionDays;
    private entries;
    private index;
    constructor(retentionDays?: number);
    set(category: string, key: string, value: unknown, confidence?: number, source?: string): KnowledgeEntry;
    get(category: string, key: string): KnowledgeEntry | null;
    query(category?: string, tag?: string): KnowledgeEntry[];
    delete(category: string, key: string): boolean;
    prune(): number;
    size(): number;
    clear(): void;
}
export declare class LearningModule {
    private knowledge;
    private events;
    private logger;
    private config;
    private experiences;
    private experienceIndex;
    private experienceCount;
    private readonly maxExperiences;
    private model;
    private explorationRate;
    constructor(knowledge: KnowledgeBase, events: EventBus, logger: Logger, config: {
        learningRate: number;
        explorationRate: number;
        decayRate: number;
    });
    recordExperience(experience: Experience): void;
    train(): void;
    private getRecentExperiences;
    shouldExplore(): boolean;
    getExplorationRate(): number;
    getModel(): LearningModel;
    getExperiences(limit?: number): Experience[];
    getExperienceCount(): number;
    getStats(): {
        total: number;
        successRate: number;
        avgReward: number;
    };
    clear(): void;
}
