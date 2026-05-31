import type { ApiSchemaShape } from "./types";

/**
 * Example API description. This is the single source of truth: the client
 * derives every allowed path, method, config shape and response type from it.
 *
 * The `satisfies ApiSchemaShape` check guarantees the schema is well-formed
 * while keeping the precise literal types (so `keyof` etc. stay narrow).
 */
export const apiSchema = {
  "/users": {
    GET: {
      query: {} as {
        page?: number;
        limit?: number;
      },
      response: [] as {
        id: number;
        name: string;
        email: string;
      }[],
    },
    POST: {
      body: {} as {
        name: string;
        email: string;
      },
      response: {} as {
        id: number;
        name: string;
        email: string;
      },
    },
  },

  "/users/:id": {
    GET: {
      params: {} as { id: string },
      response: {} as {
        id: number;
        name: string;
        email: string;
      },
    },
    PATCH: {
      params: {} as { id: string },
      body: {} as {
        name?: string;
        email?: string;
      },
      response: {} as {
        id: number;
        name: string;
        email: string;
      },
    },
    DELETE: {
      params: {} as { id: string },
      response: {} as { success: boolean },
    },
  },

  "/users/:id/posts/:postId": {
    GET: {
      params: {} as { id: string; postId: string },
      response: {} as {
        id: number;
        title: string;
        body: string;
      },
    },
  },
} satisfies ApiSchemaShape;

/** The schema *type*, used as the generic argument to `createApiClient`. */
export type ApiSchema = typeof apiSchema;
