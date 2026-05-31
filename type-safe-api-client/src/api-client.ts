import type {
  ApiSchemaShape,
  HttpMethod,
  RequestConfig,
  ResponseOf,
} from "./types";

// ---------------------------------------------------------------------------
// Runtime-facing helpers (advanced part 1 & 2)
// ---------------------------------------------------------------------------

/**
 * Replaces `:param` placeholders in a route with concrete values.
 *
 *   buildUrl("/users/:id/posts/:postId", { id: "1", postId: "10" })
 *     => "/users/1/posts/10"
 */
export function buildUrl(
  path: string,
  params?: Record<string, string>,
): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_match, key: string) => {
    const value = params?.[key];
    if (value === undefined) {
      throw new Error(`buildUrl: missing route param ":${key}" for "${path}"`);
    }
    return encodeURIComponent(value);
  });
}

/**
 * Serialises a query object into a query string. `undefined`/`null` values are
 * skipped; everything else is stringified and URL-encoded.
 *
 *   buildQuery({ page: 1, limit: 10, search: "angular" })
 *     => "?page=1&limit=10&search=angular"
 */
export function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

// ---------------------------------------------------------------------------
// Transport + middleware (advanced part 3)
// ---------------------------------------------------------------------------

/** The loose, runtime view of a request config (types are erased at runtime). */
export interface RuntimeConfig {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
}

/** Context shared with middleware on every request. */
export interface RequestContext {
  path: string;
  method: HttpMethod;
  url: string;
  body: unknown;
}

/** Typed middleware hooks: before the request, after a response, on error. */
export interface Middleware {
  before?: (ctx: RequestContext) => void | Promise<void>;
  after?: (ctx: RequestContext, response: unknown) => void | Promise<void>;
  onError?: (ctx: RequestContext, error: unknown) => void | Promise<void>;
}

/** Pluggable transport. Returns parsed JSON as `unknown` (validated/typed upstream). */
export type Transport = (req: {
  url: string;
  method: HttpMethod;
  body: unknown;
}) => Promise<unknown>;

/** Minimal structural view of `fetch`, so we don't need the DOM lib. */
type FetchFn = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

const defaultTransport: Transport = async ({ url, method, body }) => {
  const fetchFn = (globalThis as { fetch?: FetchFn }).fetch;
  if (!fetchFn) {
    throw new Error(
      "No global fetch available — provide a custom `transport` to createApiClient().",
    );
  }
  const response = await fetchFn(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${method} ${url} -> HTTP ${response.status}`);
  }
  return response.json();
};

export interface ApiClientOptions {
  baseUrl?: string;
  transport?: Transport;
  middleware?: Middleware[];
}

// ---------------------------------------------------------------------------
// The typed client
// ---------------------------------------------------------------------------

/**
 * The public, fully-typed surface. `request` is the only method, and its
 * argument + return types are derived entirely from the schema `S`:
 *  - `P` is constrained to the schema's paths,
 *  - `M` is constrained to the methods of that path,
 *  - `config` is computed by {@link RequestConfig},
 *  - the result is {@link ResponseOf}.
 */
export interface ApiClient<S extends ApiSchemaShape> {
  request<P extends keyof S & string, M extends keyof S[P] & HttpMethod>(
    path: P,
    method: M,
    config: RequestConfig<S, P, M>,
  ): Promise<ResponseOf<S, P, M>>;
}

interface ResolvedOptions {
  baseUrl: string;
  transport: Transport;
  middleware: Middleware[];
}

class TypedApiClient<S extends ApiSchemaShape> implements ApiClient<S> {
  constructor(private readonly options: ResolvedOptions) {}

  async request<P extends keyof S & string, M extends keyof S[P] & HttpMethod>(
    path: P,
    method: M,
    config: RequestConfig<S, P, M>,
  ): Promise<ResponseOf<S, P, M>> {
    // Bridge from the precise (compile-time) config to its runtime view.
    const cfg = config as RuntimeConfig;

    // Advanced part 4: basic runtime validation before doing any work.
    this.validate(path, method, cfg);

    const url =
      this.options.baseUrl + buildUrl(path, cfg.params) + buildQuery(cfg.query);

    const ctx: RequestContext = { path, method, url, body: cfg.body };

    try {
      for (const m of this.options.middleware) await m.before?.(ctx);
      const raw = await this.options.transport({ url, method, body: cfg.body });
      for (const m of this.options.middleware) await m.after?.(ctx, raw);
      // `raw` is `unknown` JSON; the schema guarantees its shape, so we expose
      // it as the inferred response type (single assertion from `unknown`).
      return raw as ResponseOf<S, P, M>;
    } catch (error) {
      for (const m of this.options.middleware) await m.onError?.(ctx, error);
      throw error;
    }
  }

  /** Ensures every `:param` in the path was supplied in `config.params`. */
  private validate(path: string, method: HttpMethod, cfg: RuntimeConfig): void {
    const required = path.match(/:([A-Za-z0-9_]+)/g) ?? [];
    for (const token of required) {
      const key = token.slice(1);
      if (cfg.params?.[key] === undefined) {
        throw new Error(
          `Invalid request ${method} ${path}: missing route param "${key}".`,
        );
      }
    }
  }
}

/**
 * Factory for a type-safe client bound to a schema:
 *
 *   const client = createApiClient<ApiSchema>({ baseUrl, transport, middleware });
 */
export function createApiClient<S extends ApiSchemaShape>(
  options: ApiClientOptions = {},
): ApiClient<S> {
  const resolved: ResolvedOptions = {
    baseUrl: options.baseUrl ?? "",
    transport: options.transport ?? defaultTransport,
    middleware: options.middleware ?? [],
  };
  return new TypedApiClient<S>(resolved);
}
