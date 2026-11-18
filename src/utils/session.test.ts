/**
 * @jest-environment node
 */
import type { SessionPayload } from "@/types/session";
import { createSession, deleteSession, getSession } from "./session";

// An in-memory stand-in for the request's cookie store.
const store = new Map<string, { value: string; options?: unknown }>();

jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const cookie = store.get(name);
      return cookie && { name, value: cookie.value };
    },
    set: (name: string, value: string, options?: unknown) => {
      store.set(name, { value, options });
    },
    delete: (name: string) => {
      store.delete(name);
    },
  }),
}));

const payload: SessionPayload = {
  token: "jwt",
  uuid: "user-1",
  email: "ana@example.com",
  role: "admin",
};

const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = env.NODE_ENV;

beforeEach(() => store.clear());
afterEach(() => {
  // Assigning undefined to process.env stores the string "undefined".
  if (originalNodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = originalNodeEnv;
});

describe("createSession", () => {
  it("stores the payload as JSON in an httpOnly cookie that lasts 24 hours", async () => {
    await createSession(payload);

    const cookie = store.get("auth-token");
    expect(JSON.parse(cookie!.value)).toEqual(payload);
    expect(cookie!.options).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });
  });

  it("marks the cookie secure in production", async () => {
    env.NODE_ENV = "production";

    await createSession(payload);

    expect(store.get("auth-token")!.options).toMatchObject({ secure: true });
  });
});

describe("getSession", () => {
  it("reads back the payload a session was created with", async () => {
    await createSession(payload);

    await expect(getSession()).resolves.toEqual(payload);
  });

  it("returns undefined when there is no cookie", async () => {
    await expect(getSession()).resolves.toBeUndefined();
  });

  it("returns undefined when the cookie is not valid JSON", async () => {
    store.set("auth-token", { value: "{not json" });

    await expect(getSession()).resolves.toBeUndefined();
  });
});

describe("deleteSession", () => {
  it("removes the session cookie", async () => {
    await createSession(payload);

    await deleteSession();

    await expect(getSession()).resolves.toBeUndefined();
  });
});
