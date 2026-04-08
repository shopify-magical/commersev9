import { v4, clamp, average } from './utils.js';
export class KnowledgeBase {
    retentionDays;
    entries = new Map();
    index = new Map(); // category:key -> id
    constructor(retentionDays = 30) {
        this.retentionDays = retentionDays;
    }
    set(category, key, value, confidence = 1.0, source = 'engine') {
        const indexKey = `${category}:${key}`;
        const existingId = this.index.get(indexKey);
        if (existingId) {
            const existing = this.entries.get(existingId);
            existing.value = value;
            existing.confidence = confidence;
            existing.updatedAt = Date.now();
            existing.accessCount++;
            return existing;
        }
        const entry = {
            id: v4(),
            category,
            key,
            value,
            confidence,
            source,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            accessCount: 0,
            tags: [],
        };
        this.entries.set(entry.id, entry);
        this.index.set(indexKey, entry.id);
        return entry;
    }
    get(category, key) {
        const indexKey = `${category}:${key}`;
        const id = this.index.get(indexKey);
        if (!id)
            return null;
        const entry = this.entries.get(id);
        entry.accessCount++;
        return entry;
    }
    query(category, tag) {
        let results = [...this.entries.values()];
        if (category)
            results = results.filter(e => e.category === category);
        if (tag)
            results = results.filter(e => e.tags.includes(tag));
        return results.sort((a, b) => b.confidence - a.confidence);
    }
    delete(category, key) {
        const indexKey = `${category}:${key}`;
        const id = this.index.get(indexKey);
        if (!id)
            return false;
        this.entries.delete(id);
        this.index.delete(indexKey);
        return true;
    }
    prune() {
        const cutoff = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
        let pruned = 0;
        for (const [id, entry] of this.entries) {
            if (entry.updatedAt < cutoff && entry.accessCount < 3) {
                const indexKey = `${entry.category}:${entry.key}`;
                this.entries.delete(id);
                this.index.delete(indexKey);
                pruned++;
            }
        }
        return pruned;
    }
    size() {
        return this.entries.size;
    }
    clear() {
        this.entries.clear();
        this.index.clear();
    }
}
export class LearningModule {
    knowledge;
    events;
    logger;
    config;
    experiences;
    experienceIndex = 0;
    experienceCount = 0;
    maxExperiences = 5000;
    model;
    explorationRate;
    constructor(knowledge, events, logger, config) {
        this.knowledge = knowledge;
        this.events = events;
        this.logger = logger;
        this.config = config;
        this.experiences = new Array(this.maxExperiences);
        this.explorationRate = config.explorationRate;
        this.model = {
            name: 'default',
            version: 0,
            parameters: {
                bias_success: 0.5,
                bias_speed: 0.3,
                bias_cost: 0.2,
                exploration_weight: config.explorationRate,
            },
            accuracy: 0.5,
            trainedAt: Date.now(),
            sampleCount: 0,
        };
    }
    recordExperience(experience) {
        this.experiences[this.experienceIndex] = experience;
        this.experienceIndex = (this.experienceIndex + 1) % this.maxExperiences;
        if (this.experienceCount < this.maxExperiences)
            this.experienceCount++;
        // Update knowledge from experience
        if (experience.result.success) {
            const action = experience.decision.options.find(o => o.id === experience.decision.selected);
            if (action) {
                this.knowledge.set('actions', action.description, {
                    avgDuration: experience.result.metrics.duration,
                    successRate: 1.0,
                    lastUsed: Date.now(),
                }, experience.reward / 3, 'learning');
            }
        }
        this.events.emit('experience:recorded', experience);
        this.logger.debug('Learning', `Experience recorded, reward: ${experience.reward.toFixed(2)}`);
    }
    train() {
        if (this.experienceCount < 10) {
            this.logger.debug('Learning', 'Not enough experiences to train');
            return;
        }
        const start = Date.now();
        const recent = this.getRecentExperiences(100);
        // Calculate success rate
        const successes = recent.filter(e => e.result.success).length;
        const successRate = successes / recent.length;
        // Calculate average reward
        const avgReward = average(recent.map(e => e.reward));
        // Update model parameters
        this.model.parameters.bias_success = clamp(this.model.parameters.bias_success + this.config.learningRate * (successRate - 0.5), 0.1, 1.0);
        this.model.parameters.bias_speed = clamp(this.model.parameters.bias_speed + this.config.learningRate * (avgReward > 0 ? 0.01 : -0.01), 0.1, 1.0);
        // Decay exploration rate
        this.explorationRate = Math.max(0.01, this.explorationRate * this.config.decayRate);
        this.model.parameters.exploration_weight = this.explorationRate;
        // Update accuracy estimate
        this.model.accuracy = clamp(successRate * 0.7 + this.model.accuracy * 0.3, 0, 1);
        this.model.version++;
        this.model.sampleCount = this.experienceCount;
        this.model.trainedAt = Date.now();
        const duration = Date.now() - start;
        this.logger.info('Learning', `Model trained v${this.model.version} in ${duration}ms`, {
            accuracy: this.model.accuracy.toFixed(3),
            explorationRate: this.explorationRate.toFixed(3),
            samples: this.experienceCount,
        });
        this.events.emit('model:trained', this.model);
    }
    getRecentExperiences(limit) {
        if (this.experienceCount === 0)
            return [];
        const count = Math.min(limit, this.experienceCount);
        if (this.experienceCount < this.maxExperiences) {
            return this.experiences.slice(this.experienceCount - count, this.experienceCount);
        }
        const result = [];
        for (let i = 0; i < count; i++) {
            const idx = (this.experienceIndex - count + i + this.maxExperiences) % this.maxExperiences;
            result.push(this.experiences[idx]);
        }
        return result;
    }
    shouldExplore() {
        return Math.random() < this.explorationRate;
    }
    getExplorationRate() {
        return this.explorationRate;
    }
    getModel() {
        return { ...this.model };
    }
    getExperiences(limit) {
        if (!limit)
            return this.getRecentExperiences(this.experienceCount);
        return this.getRecentExperiences(limit);
    }
    getExperienceCount() {
        return this.experienceCount;
    }
    getStats() {
        if (this.experienceCount === 0)
            return { total: 0, successRate: 0, avgReward: 0 };
        const recent = this.getRecentExperiences(100);
        return {
            total: this.experienceCount,
            successRate: recent.filter(e => e.result.success).length / recent.length,
            avgReward: average(recent.map(e => e.reward)),
        };
    }
    clear() {
        this.experienceIndex = 0;
        this.experienceCount = 0;
        this.explorationRate = this.config.explorationRate;
        this.model.version = 0;
        this.model.accuracy = 0.5;
        this.model.sampleCount = 0;
    }
}
//# sourceMappingURL=learning.js.map