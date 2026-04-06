import { randomBytes } from 'node:crypto';
export function v4() {
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString('hex');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join('-');
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function average(values) {
    if (values.length === 0)
        return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}
export function stddev(values) {
    if (values.length < 2)
        return 0;
    const avg = average(values);
    const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
    return Math.sqrt(variance);
}
//# sourceMappingURL=utils.js.map