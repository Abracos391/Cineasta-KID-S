import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("story.list", () => {
  it("should return empty array for user with no stories", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.story.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should require authentication", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.story.list()).rejects.toThrow();
  });
});

describe("story.getById", () => {
  it("should return null for non-existent story", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.story.getById({ id: 999999 });
    
    expect(result).toBe(null);
  });

  it("should require authentication", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.story.getById({ id: 1 })).rejects.toThrow();
  });
});

describe("subscription.getStatus", () => {
  it("should return subscription status for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscription.getStatus();

    expect(result).toHaveProperty('plan');
    expect(result).toHaveProperty('isActive');
    expect(['free', 'premium']).toContain(result.plan);
    expect(typeof result.isActive).toBe('boolean');
  });

  it("should require authentication", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscription.getStatus()).rejects.toThrow();
  });
});
