import { vi } from "vitest";
import { testDatabaseUrl } from "./env";

process.env.DATABASE_URL = testDatabaseUrl();
process.env.SESSION_SECRET ??= "test-secret-test-secret-test-secret-0123";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

// A tiny cookie jar so getCurrentUser() reads whatever cookie the test sets.
const jar = new Map<string, string>();
export const testCookies = jar;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
    has: (name: string) => jar.has(name),
  }),
  headers: async () => new Headers({ "user-agent": "vitest" }),
}));
