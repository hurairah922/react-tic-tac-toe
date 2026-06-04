describe("authService in Supabase mode", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("sends a Supabase magic link when email sign-in is requested", async () => {
    const signInWithOtp = jest.fn().mockResolvedValue({ error: null });

    jest.doMock("../config/env", () => ({
      AUTH_PROVIDER: "supabase",
      SUPABASE_AUTH_REDIRECT_URL: "http://localhost:3000",
      isSupabaseConfigured: () => true,
    }));

    jest.doMock("./supabaseClient", () => ({
      supabase: {
        auth: {
          signInWithOtp,
          getSession: jest.fn(),
          onAuthStateChange: jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } },
          })),
          updateUser: jest.fn(),
          signOut: jest.fn(),
        },
      },
    }));

    const { signInWithEmail } = await import("./authService");
    const result = await signInWithEmail("player@example.com");

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "player@example.com",
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });
    expect(result.message).toMatch(/Magic link sent/);
  });

  test("saves profile names through Supabase user metadata", async () => {
    const updateUser = jest.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "player@example.com",
          app_metadata: { provider: "email" },
          user_metadata: { profile_name: "Morgan" },
        },
      },
      error: null,
    });

    jest.doMock("../config/env", () => ({
      AUTH_PROVIDER: "supabase",
      SUPABASE_AUTH_REDIRECT_URL: "http://localhost:3000",
      isSupabaseConfigured: () => true,
    }));

    jest.doMock("./supabaseClient", () => ({
      supabase: {
        auth: {
          signInWithOtp: jest.fn(),
          getSession: jest.fn(),
          onAuthStateChange: jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } },
          })),
          updateUser,
          signOut: jest.fn(),
        },
      },
    }));

    const { saveProfileNameAsync } = await import("./authService");
    const result = await saveProfileNameAsync(
      {
        id: "user-1",
        email: "player@example.com",
        provider: "email",
      },
      "Morgan"
    );

    expect(updateUser).toHaveBeenCalledWith({
      data: {
        profile_name: "Morgan",
      },
    });
    expect(result).toMatchObject({
      authUser: {
        id: "user-1",
        email: "player@example.com",
        provider: "email",
      },
      profileName: "Morgan",
    });
  });
});
