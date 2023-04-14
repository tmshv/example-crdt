export function lerp(ratio: number, a: number, b: number): number {
    return a + ratio * (b - a);
}

export function uniform(min: number, max: number): number {
    return lerp(Math.random(), min, max);
}

export function choose<T>(items: T[]): T | null {
    if (items.length === 0) {
        return null
    }

    const i = Math.floor(Math.random() * items.length)
    return items[i]
}

export function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min
    }
    if (value > max) {
        return max
    }
    return value
}
