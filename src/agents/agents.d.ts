/**
 * Type declarations for Cloudflare Agents SDK
 */

export type Env = {
  [key: string]: unknown;
};

export type AgentState = Record<string, unknown>;

export interface Agent<T extends Env = Env, S extends AgentState = AgentState> {
  env: T;
  state: S;
  initialState: S;
  setState(state: Partial<S>): void;
  fetch(request: Request): Promise<Response>;
}

export interface CallableOptions {
  name?: string;
  retries?: number;
}

export type MethodDecorator = (
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => PropertyDescriptor;

export function callable(options?: CallableOptions): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    return descriptor;
  };
}

export function agent(options?: { name?: string; trace?: boolean }): ClassDecorator {
  return function (target) {
    return target;
  };
}

export interface Request {
  url: string;
  method: string;
  headers: Headers;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export interface Response {
  status: number;
  statusText: string;
  headers: Headers;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

export interface Headers {
  get(name: string): string | null;
  set(name: string, value: string): void;
  entries(): IterableIterator<[string, string]>;
}

export interface DurableObject {
  fetch(request: Request): Promise<Response>;
}

export interface DurableObjectConstructor {
  new (state: DurableObjectState, env: Env): DurableObject;
}

export interface DurableObjectState {
  id: DurableObjectId;
  storage: DurableObjectStorage;
}

export interface DurableObjectId {
  toString(): string;
}

export interface DurableObjectStorage {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
  list<T>(options?: { prefix?: string; limit?: number }): Promise<Map<string, T>>;
}

export class Agent<T extends Env = Env, S extends AgentState = AgentState> {
  env: T;
  state: S;
  initialState: S;

  constructor(env: T) {
    this.env = env;
    this.state = this.initialState;
  }

  setState(state: Partial<S>): void {
    this.state = { ...this.state, ...state };
  }

  async fetch(request: Request): Promise<Response> {
    return new Response('Not implemented', { status: 404 });
  }
}