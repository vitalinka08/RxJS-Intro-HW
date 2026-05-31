# Type-Safe API Client Generator

A small, dependency-free **type-safe API client** built entirely on advanced
TypeScript type-level programming. You describe your API once as a schema
object, and TypeScript infers — *before any code runs* — which paths exist,
which HTTP methods are allowed, what `params` / `query` / `body` each call
needs, and what response type comes back.

> Invalid calls don't fail at runtime — they fail to **compile**.

## Why it's interesting

Almost all of the safety lives in the type system. The runtime is a thin
shell (URL building, query serialisation, middleware, validation); the
*correctness* is enforced by `tsc` using template literal types, conditional
types, `infer`, mapped types, indexed access types and generic constraints.

No `any`. No `as unknown as`. Compiles in `strict` mode with
`noUncheckedIndexedAccess`.

## Project structure

```
src/
  api-schema.ts   # example API schema (single source of truth)
  types.ts        # type-level core: ExtractRouteParams, RequestConfig, ResponseOf, ...
  api-client.ts   # createApiClient, request(), buildUrl, buildQuery, middleware
  demo.ts         # runnable demonstration (offline, with a mock transport)
  type-tests.ts   # compile-time tests, incl. @ts-expect-error negative cases
```

## Getting started

```bash
npm install
npm run build      # tsc — also runs the compile-time type tests
npm run demo       # executes src/demo.ts via tsx
npm run type-check # tsc --noEmit
```

## Usage

```ts
import { createApiClient } from "./api-client";
import type { ApiSchema } from "./api-schema";

const client = createApiClient<ApiSchema>({ baseUrl: "https://api.example.com" });

// ✅ response inferred as { id: number; name: string; email: string }[]
const users = await client.request("/users", "GET", { query: { page: 1 } });

// ✅ params required by the ":id" route
const user = await client.request("/users/:id", "GET", { params: { id: "123" } });

// ✅ body required for POST
const created = await client.request("/users", "POST", {
  body: { name: "John", email: "john@example.com" },
});
```

These all **fail to compile**:

```ts
client.request("/unknown", "GET", {});                 // unknown path
client.request("/users", "DELETE", {});                // method not on this path
client.request("/users/:id", "GET", {});               // missing required params
client.request("/users", "POST", {});                  // missing required body
client.request("/users", "GET", { body: { name: "" }});// body not allowed here
client.request("/users/:id", "GET", { params: { userId: "1" } }); // wrong param name
```

## Type-level building blocks (in `types.ts`)

| Type | Purpose |
| --- | --- |
| `ExtractRouteParams<Path>` | Pulls `:params` from a route string into an object: `"/users/:id/posts/:postId"` → `{ id: string; postId: string }`. |
| `RequestConfig<S, P, M>` | Assembles the exact config object for an endpoint (params if the route needs them, optional query if declared, required body if declared). |
| `ResponseOf<S, P, M>` | The response type for a `path` + `method`. |
| `MethodsOf<S, P>` | Methods available on a path, e.g. `MethodsOf<ApiSchema, "/users">` → `"GET" \| "POST"`. |
| `PathsWithMethod<S, M>` | Paths that support a method, e.g. `PathsWithMethod<ApiSchema, "POST">` → `"/users"`. |

## Extra features

- **URL builder** — `buildUrl("/users/:id/posts/:postId", { id: "1", postId: "10" })` → `/users/1/posts/10`
- **Query builder** — `buildQuery({ page: 1, limit: 10, search: "angular" })` → `?page=1&limit=10&search=angular`
- **Typed middleware** — `before` / `after` / `onError` hooks
- **Runtime validation** — verifies every route param is supplied before the request is sent

## Screenshots

See [`screenshots/`](./screenshots):

- `01-demo-run.png` — successful `npm run demo`
- `02-build-success.png` — clean `tsc` build / type-check
- `03-type-errors.png` — the `@ts-expect-error` cases surfacing as real compiler errors
