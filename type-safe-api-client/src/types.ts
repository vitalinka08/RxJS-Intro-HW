/**
 * Type-level core of the API client.
 *
 * Every check in this file runs purely in the TypeScript type system — before
 * any code executes. We use: template literal types, conditional types,
 * `infer`, mapped types, indexed access types, `keyof`, generics with
 * constraints and a few utility types. No `any`, no `as unknown as`.
 */

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/**
 * Flattens an intersection (`A & B & C`) into a single object type so that
 * editor tooltips and excess-property checks operate on one clean shape.
 * Homomorphic mapping (`[K in keyof T]`) preserves optional modifiers.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Tuple-wrap trick to test "is this union exactly `never`?" without distributing. */
type IsNever<T> = [T] extends [never] ? true : false;

// ---------------------------------------------------------------------------
// 1. Base types: HTTP methods, endpoints and the schema shape
// ---------------------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * The contract a single endpoint (one path + one method) must satisfy.
 * `params`, `query` and `body` are optional — their *presence* is what later
 * drives whether the caller must / may provide them.
 */
export interface EndpointDef {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  response: unknown;
}

/**
 * Generic constraint for any user-supplied schema: a map of
 * `path -> (method -> EndpointDef)`. Concrete schemas (with literal paths)
 * are structurally assignable to this.
 */
export type ApiSchemaShape = {
  [path: string]: {
    [method in HttpMethod]?: EndpointDef;
  };
};

// ---------------------------------------------------------------------------
// 2. ExtractRouteParams — pull `:params` out of a route string
//    ExtractRouteParams<"/users/:id/posts/:postId"> => { id: string; postId: string }
// ---------------------------------------------------------------------------

export type ExtractRouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

// ---------------------------------------------------------------------------
// 3. Per-endpoint config pieces. Each piece is `{}` when not applicable, so
//    intersecting them yields exactly the fields the endpoint needs.
// ---------------------------------------------------------------------------

/** Route params are derived from the *path string*, so `:id` must map to `params.id`. */
type ParamsPart<Path extends string> =
  IsNever<keyof ExtractRouteParams<Path>> extends true
    ? {}
    : { params: ExtractRouteParams<Path> };

/** Query is allowed (and optional) only when the endpoint declares it. */
type QueryPart<E> = E extends { query: infer Q } ? { query?: Q } : {};

/** Body is required exactly where the endpoint declares it. */
type BodyPart<E> = E extends { body: infer B } ? { body: B } : {};

/**
 * Assembles the full config object for `path` + `method`:
 *  - adds `params` when the path has route params,
 *  - adds optional `query` when declared,
 *  - adds required `body` when declared,
 *  - collapses to `{}` (empty object allowed) when nothing is needed.
 */
export type RequestConfig<
  S extends ApiSchemaShape,
  P extends keyof S & string,
  M extends keyof S[P],
> = Prettify<ParamsPart<P> & QueryPart<S[P][M]> & BodyPart<S[P][M]>>;

// ---------------------------------------------------------------------------
// 4. ResponseOf — the response type for a given path + method
// ---------------------------------------------------------------------------

export type ResponseOf<
  S extends ApiSchemaShape,
  P extends keyof S,
  M extends keyof S[P],
> = S[P][M] extends { response: infer R } ? R : never;

// ---------------------------------------------------------------------------
// 5. MethodsOf — the methods available on a given path
//    MethodsOf<ApiSchema, "/users"> => "GET" | "POST"
// ---------------------------------------------------------------------------

export type MethodsOf<S extends ApiSchemaShape, P extends keyof S> = Extract<
  keyof S[P],
  HttpMethod
>;

// ---------------------------------------------------------------------------
// 6. PathsWithMethod — only the paths that support a given method
//    PathsWithMethod<ApiSchema, "POST"> => "/users"
// ---------------------------------------------------------------------------

export type PathsWithMethod<S extends ApiSchemaShape, M extends HttpMethod> = {
  [P in keyof S]: M extends keyof S[P] ? P : never;
}[keyof S];
