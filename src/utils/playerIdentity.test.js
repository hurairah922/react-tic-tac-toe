import {
  CPU_PLAYER_NAME,
  GUEST_PLAYER_NAME,
  LOCAL_PLAYER_O_NAME,
  LOCAL_PLAYER_X_NAME,
  createDefaultMatchDisplayNames,
  formatPlayerLabel,
  getAuthFallbackName,
  getProfileDefaultName,
  normalizeDisplayName,
} from "./playerIdentity";

describe("playerIdentity", () => {
  test("normalizes display names to a trimmed, compact label", () => {
    expect(normalizeDisplayName("  Alex   Rivers  ")).toBe("Alex Rivers");
  });

  test("builds a readable fallback name from the auth email", () => {
    expect(
      getAuthFallbackName({ email: "sam-taylor.dev@example.com" })
    ).toBe("Sam Taylor Dev");
  });

  test("prefers the saved profile name over the auth fallback", () => {
    expect(
      getProfileDefaultName({
        authUser: { email: "player@example.com" },
        profileName: "  Morgan  ",
      })
    ).toBe("Morgan");
  });

  test("creates guest and signed-in defaults for both match modes", () => {
    expect(
      createDefaultMatchDisplayNames({ authUser: null, profileName: "" })
    ).toEqual({
      cpu: {
        X: GUEST_PLAYER_NAME,
        O: CPU_PLAYER_NAME,
      },
      human: {
        X: LOCAL_PLAYER_X_NAME,
        O: LOCAL_PLAYER_O_NAME,
      },
    });

    expect(
      createDefaultMatchDisplayNames({
        authUser: { email: "riley@example.com" },
        profileName: "Riley",
      })
    ).toEqual({
      cpu: {
        X: "Riley",
        O: CPU_PLAYER_NAME,
      },
      human: {
        X: "Riley",
        O: LOCAL_PLAYER_O_NAME,
      },
    });
  });

  test("formats labels with both display name and board marker", () => {
    expect(formatPlayerLabel("Guest", "X")).toBe("Guest (X)");
  });
});
