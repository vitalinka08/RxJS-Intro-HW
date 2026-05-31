import { createApiClient, buildUrl, buildQuery } from "./api-client";
import type { Middleware, Transport } from "./api-client";
import type { ApiSchema } from "./api-schema";

// ---------------------------------------------------------------------------
// A fake in-memory backend so the demo runs offline. It returns canned JSON
// based on the method + URL — exactly what a real transport would receive.
// ---------------------------------------------------------------------------

const mockTransport: Transport = async ({ url, method, body }) => {
  const path = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0] ?? "";

  if (path === "/users" && method === "GET") {
    return [
      { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
      { id: 2, name: "Alan Turing", email: "alan@example.com" },
    ];
  }
  if (path === "/users" && method === "POST") {
    const input = body as { name: string; email: string };
    return { id: 99, name: input.name, email: input.email };
  }
  if (/^\/users\/\d+$/.test(path) && method === "GET") {
    return { id: 123, name: "Grace Hopper", email: "grace@example.com" };
  }
  if (/^\/users\/\d+$/.test(path) && method === "PATCH") {
    const patch = body as { name?: string; email?: string };
    return { id: 123, name: patch.name ?? "Grace Hopper", email: patch.email ?? "grace@example.com" };
  }
  if (/^\/users\/\d+$/.test(path) && method === "DELETE") {
    return { success: true };
  }
  if (/^\/users\/\d+\/posts\/\d+$/.test(path) && method === "GET") {
    return { id: 10, title: "Type-level programming", body: "infer all the things" };
  }
  throw new Error(`No mock for ${method} ${path}`);
};

// Typed logging middleware (advanced part 3).
const logging: Middleware = {
  before: (ctx) => console.log(`  → ${ctx.method} ${ctx.url}`),
  after: (_ctx, response) =>
    console.log(`  ← ${JSON.stringify(response)}`),
  onError: (ctx, error) =>
    console.error(`  ✗ ${ctx.method} ${ctx.url}: ${String(error)}`),
};

const client = createApiClient<ApiSchema>({
  baseUrl: "https://api.example.com",
  transport: mockTransport,
  middleware: [logging],
});

async function main(): Promise<void> {
  console.log("=== URL & query builders ===");
  console.log(buildUrl("/users/:id/posts/:postId", { id: "1", postId: "10" }));
  console.log(buildQuery({ page: 1, limit: 10, search: "angular" }));
  console.log();

  console.log("=== GET /users (query) ===");
  const users = await client.request("/users", "GET", {
    query: { page: 1, limit: 10 },
  });
  // `users` is inferred as { id: number; name: string; email: string }[]
  console.log(`  total: ${users.length}, first: ${users[0]?.name}\n`);

  console.log("=== GET /users/:id (params) ===");
  const user = await client.request("/users/:id", "GET", {
    params: { id: "123" },
  });
  // `user` is inferred as { id: number; name: string; email: string }
  console.log(`  user #${user.id}: ${user.name} <${user.email}>\n`);

  console.log("=== POST /users (body) ===");
  const created = await client.request("/users", "POST", {
    body: { name: "John Doe", email: "john@example.com" },
  });
  console.log(`  created #${created.id}: ${created.name}\n`);

  console.log("=== PATCH /users/:id (params + body) ===");
  const patched = await client.request("/users/:id", "PATCH", {
    params: { id: "123" },
    body: { name: "Grace M. Hopper" },
  });
  console.log(`  patched #${patched.id}: ${patched.name}\n`);

  console.log("=== DELETE /users/:id ===");
  const deleted = await client.request("/users/:id", "DELETE", {
    params: { id: "123" },
  });
  // `deleted` is inferred as { success: boolean }
  console.log(`  deleted: ${deleted.success}\n`);

  console.log("=== GET /users/:id/posts/:postId (nested params) ===");
  const post = await client.request("/users/:id/posts/:postId", "GET", {
    params: { id: "1", postId: "10" },
  });
  console.log(`  post #${post.id}: "${post.title}"\n`);

  console.log("=== runtime validation ===");
  try {
    // Bypass the type layer to show the runtime guard still fires.
    await client.request("/users/:id", "GET", {
      params: {} as { id: string },
    });
  } catch (error) {
    console.log(`  caught: ${String(error)}`);
  }

  console.log("\n✅ demo finished");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
