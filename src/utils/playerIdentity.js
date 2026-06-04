export const DISPLAY_NAME_LIMIT = 24;
export const GUEST_PLAYER_NAME = "Guest";
export const CPU_PLAYER_NAME = "CPU";
export const LOCAL_PLAYER_X_NAME = "Player X";
export const LOCAL_PLAYER_O_NAME = "Player O";

function toTitleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeDisplayName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, DISPLAY_NAME_LIMIT);
}

export function getAuthFallbackName(authUser) {
  const email = String(authUser?.email ?? "").trim().toLowerCase();

  if (!email.includes("@")) {
    return "";
  }

  const localPart = email
    .split("@")[0]
    .replace(/[^a-z0-9._-]+/g, " ")
    .replace(/[._-]+/g, " ");
  const normalizedLocalPart = normalizeDisplayName(localPart);

  return normalizedLocalPart ? toTitleCase(normalizedLocalPart) : "";
}

export function getProfileDefaultName({ authUser, profileName }) {
  const normalizedProfileName = normalizeDisplayName(profileName);

  if (normalizedProfileName) {
    return normalizedProfileName;
  }

  return getAuthFallbackName(authUser) || GUEST_PLAYER_NAME;
}

export function createDefaultMatchDisplayNames({ authUser, profileName }) {
  const signedInDefaultName = getProfileDefaultName({ authUser, profileName });
  const isSignedIn = Boolean(authUser);

  return {
    cpu: {
      X: isSignedIn ? signedInDefaultName : GUEST_PLAYER_NAME,
      O: CPU_PLAYER_NAME,
    },
    human: {
      X: isSignedIn ? signedInDefaultName : LOCAL_PLAYER_X_NAME,
      O: LOCAL_PLAYER_O_NAME,
    },
  };
}

export function formatPlayerLabel(name, marker) {
  return `${name} (${marker})`;
}
