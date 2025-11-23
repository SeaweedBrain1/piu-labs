import { randomHsl } from './helpers.js';

export class ShapeStore {
    #state = {
        shapes: [],
    };

    #subscribers = new Map();

    constructor() {
        const stored = localStorage.getItem('shapes');
        this.#state.shapes = stored ? JSON.parse(stored) : [];
    }

    getShapes() {
        return [...this.#state.shapes];
    }

    addShape(type) {
        const id = crypto.randomUUID();
        const color = randomHsl();
        this.#state.shapes.push({ id, type, color });
        this.#saveAndNotify();
    }

    removeShape(id) {
        this.#state.shapes = this.#state.shapes.filter((s) => s.id !== id);
        this.#saveAndNotify();
    }

    recolor(type) {
        this.#state.shapes = this.#state.shapes.map((s) =>
            s.type === type ? { ...s, color: randomHsl() } : s
        );
        this.#saveAndNotify();
    }

    count(type) {
        return this.#state.shapes.filter((s) => s.type === type).length;
    }

    subscribe(prop, callback) {
        if (!this.#subscribers.has(prop)) {
            this.#subscribers.set(prop, new Set());
        }
        this.#subscribers.get(prop).add(callback);
        callback(this.#state[prop]);
        return () => this.#subscribers.get(prop).delete(callback);
    }

    #notify(prop) {
        const subs = this.#subscribers.get(prop);
        if (subs) {
            for (const cb of subs) cb(this.#state[prop]);
        }
    }

    #saveAndNotify() {
        localStorage.setItem('shapes', JSON.stringify(this.#state.shapes));
        this.#notify('shapes');
    }
}

export const store = new ShapeStore();
