/**
 * Compile-time test suite. This file never runs — its whole job is to make
 * `tsc` succeed only when the type layer behaves correctly:
 *   - positive cases must type-check,
 *   - negative cases are marked with `@ts-expect-error` and MUST error
 *     (an unused `@ts-expect-error` is itself a compile error),
 *   - type-level assertions use `Expect<Equal<...>>`.
 */

import { createApiClient } from "./api-client";
import type { ApiSchema } from "./api-schema";
import type {
  ExtractRouteParams,
  MethodsOf,
  PathsWithMethod,
  ResponseOf,
  Prettify,
} from "./types";

// --- assertion helpers -----------------------------------------------------

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

// ===========================================================================
// Type-level tests for the building-block types
// ===========================================================================

// ExtractRouteParams
type _Params0 = Expect<Equal<Prettify<ExtractRouteParams<"/users">>, {}>>;
type _Params1 = Expect<
  Equal<Prettify<ExtractRouteParams<"/users/:id">>, { id: string }>
>;
type _Params2 = Expect<
  Equal<
    Prettify<ExtractRouteParams<"/users/:id/posts/:postId">>,
    { id: string; postId: string }
  >
>;

// MethodsOf
type _Methods = Expect<Equal<MethodsOf<ApiSchema, "/users">, "GET" | "POST">>;
type _Methods2 = Expect<
  Equal<MethodsOf<ApiSchema, "/users/:id">, "GET" | "PATCH" | "DELETE">
>;

// PathsWithMethod
type _PostPaths = Expect<Equal<PathsWithMethod<ApiSchema, "POST">, "/users">>;
type _DeletePaths = Expect<
  Equal<PathsWithMethod<ApiSchema, "DELETE">, "/users/:id">
>;

// ResponseOf
type _Resp = Expect<
  Equal<
    ResponseOf<ApiSchema, "/users/:id", "GET">,
    { id: number; name: string; email: string }
  >
>;
type _RespList = Expect<
  Equal<
    ResponseOf<ApiSchema, "/users", "GET">,
    { id: number; name: string; email: string }[]
  >
>;
type _RespDelete = Expect<
  Equal<ResponseOf<ApiSchema, "/users/:id", "DELETE">, { success: boolean }>
>;

// ===========================================================================
// Runtime-surface tests (type-checked only, never executed)
// ===========================================================================

const client = createApiClient<ApiSchema>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function positiveCases(): Promise<void> {
  // OK: known path + method, optional query
  await client.request("/users", "GET", { query: { page: 1 } });
  await client.request("/users", "GET", {});

  // OK: POST with body
  await client.request("/users", "POST", {
    body: { name: "Ann", email: "ann@mail.com" },
  });

  // OK: params required and supplied
  await client.request("/users/:id", "GET", { params: { id: "123" } });

  // OK: nested params
  await client.request("/users/:id/posts/:postId", "GET", {
    params: { id: "1", postId: "10" },
  });

  // OK: PATCH with params + partial body
  await client.request("/users/:id", "PATCH", {
    params: { id: "1" },
    body: { name: "Neo" },
  });

  // Response inference flows through:
  const users = await client.request("/users", "GET", {});
  type _Inferred = Expect<
    Equal<typeof users, { id: number; name: string; email: string }[]>
  >;

  const result = await client.request("/users/:id", "DELETE", {
    params: { id: "1" },
  });
  type _InferredDelete = Expect<Equal<typeof result, { success: boolean }>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function negativeCases(): Promise<void> {
  // @ts-expect-error unknown path is rejected
  await client.request("/unknown", "GET", {});

  // @ts-expect-error DELETE is not declared for /users
  await client.request("/users", "DELETE", {});

  // @ts-expect-error params are required for /users/:id
  await client.request("/users/:id", "GET", {});

  // @ts-expect-error body is required for POST /users
  await client.request("/users", "POST", {});

  // @ts-expect-error body is not allowed for GET /users
  await client.request("/users", "GET", { body: { name: "John" } });

  // @ts-expect-error query is not allowed for GET /users/:id
  await client.request("/users/:id", "GET", { params: { id: "1" }, query: { page: 1 } });

  // @ts-expect-error wrong param name (path expects ":id", not "userId")
  await client.request("/users/:id", "GET", { params: { userId: "1" } });

  // @ts-expect-error wrong query field type
  await client.request("/users", "GET", { query: { page: "first" } });

  // @ts-expect-error wrong body field type
  await client.request("/users", "POST", { body: { name: 1, email: "x" } });
}
