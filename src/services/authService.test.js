jest.mock("../config/env", () => ({
  AUTH_PROVIDER: "local",
  SUPABASE_AUTH_REDIRECT_URL: "http://localhost:3000",
  isSupabaseConfigured: () => false,
}));

jest.mock("./supabaseClient", () => ({
  supabase: null,
}));

import {
  AUTH_SESSION_STORAGE_KEY,
  clearPostLoginRedirectPath,
  PROFILE_STORAGE_KEY,
  POST_LOGIN_REDIRECT_STORAGE_KEY,
  clearAuthSession,
  clearProfileName,
  getInitialAuthState,
  loadAuthSession,
  loadPostLoginRedirectPath,
  loadProfileName,
  saveAuthSession,
  savePostLoginRedirectPath,
  saveProfileName,
  saveProfileNameAsync,
  signOutAsync,
  signInWithEmail,
} from "./authService";

function createMemoryStorage(initialEntries = {}) {
  const storage = { ...initialEntries };

  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storage, key)
        ? storage[key]
        : null;
    },
    setItem(key, value) {
      storage[key] = String(value);
    },
    removeItem(key) {
      delete storage[key];
    },
  };
}

describe("authService", () => {
  test("signs in with a normalized local session and can load it later", async () => {
    const storage = createMemoryStorage();

    const result = await signInWithEmail(" Player@One.Example ", storage);
    const authUser = result.authUser;

    expect(authUser).toEqual({
      id: "local-player@one.example",
      email: "player@one.example",
      provider: "local",
    });
    expect(result.profileName).toBe("");
    expect(loadAuthSession(storage)).toEqual(authUser);
  });

  test("clears the saved auth session without touching stored profiles", () => {
    const storage = createMemoryStorage();
    const authUser = saveAuthSession(
      { id: "abc", email: "player@example.com" },
      storage
    );

    saveProfileName(authUser, "Alex", storage);
    clearAuthSession(storage);

    expect(loadAuthSession(storage)).toBeNull();
    expect(loadProfileName(authUser, storage)).toBe("Alex");
  });

  test("stores profile names per signed-in email and normalizes whitespace", async () => {
    const storage = createMemoryStorage();

    const alpha = (await signInWithEmail("alpha@example.com", storage)).authUser;
    const beta = (await signInWithEmail("beta@example.com", storage)).authUser;

    expect(
      (await saveProfileNameAsync(alpha, "  Alex   Rivers  ", storage))
        .profileName
    ).toBe("Alex Rivers");
    expect(
      (await saveProfileNameAsync(beta, "Bailey", storage)).profileName
    ).toBe("Bailey");
    expect(loadProfileName(beta, storage)).toBe("Bailey");

    expect(loadProfileName(alpha, storage)).toBe("Alex Rivers");
  });

  test("clears a single saved profile name without removing other profiles", () => {
    const storage = createMemoryStorage({
      [PROFILE_STORAGE_KEY]: JSON.stringify({
        "alpha@example.com": "Alex",
        "beta@example.com": "Bailey",
      }),
    });

    clearProfileName("alpha@example.com", storage);

    expect(loadProfileName("alpha@example.com", storage)).toBe("");
    expect(loadProfileName("beta@example.com", storage)).toBe("Bailey");
  });

  test("returns safe defaults when stored auth data is malformed", () => {
    const storage = createMemoryStorage({
      [AUTH_SESSION_STORAGE_KEY]: "{bad-json",
      [PROFILE_STORAGE_KEY]: JSON.stringify({
        "player@example.com": "  Pat  ",
        invalid: "",
      }),
    });

    expect(loadAuthSession(storage)).toBeNull();
    expect(loadProfileName("player@example.com", storage)).toBe("Pat");
  });

  test("creates a guest-first initial auth state when no local session exists", () => {
    expect(getInitialAuthState(createMemoryStorage())).toEqual({
      authUser: null,
      profileName: "",
    });
  });

  test("signs out locally without removing saved profile names", async () => {
    const storage = createMemoryStorage();
    const authUser = (await signInWithEmail("player@example.com", storage)).authUser;

    await saveProfileNameAsync(authUser, "Alex", storage);

    const result = await signOutAsync(storage);

    expect(result).toEqual({
      authUser: null,
      profileName: "",
      message: "Signed out. Guest play is still available.",
    });
    expect(loadProfileName(authUser, storage)).toBe("Alex");
  });

  test("stores and clears a pending post-login redirect path", () => {
    const storage = createMemoryStorage();

    expect(savePostLoginRedirectPath("/play/invite/room-1", storage)).toBe(
      "/play/invite/room-1"
    );
    expect(storage.getItem(POST_LOGIN_REDIRECT_STORAGE_KEY)).toBe(
      "/play/invite/room-1"
    );
    expect(loadPostLoginRedirectPath(storage)).toBe("/play/invite/room-1");

    clearPostLoginRedirectPath(storage);

    expect(loadPostLoginRedirectPath(storage)).toBe("");
  });
});
