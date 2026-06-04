import {
  AUTH_PROVIDER,
  SUPABASE_AUTH_REDIRECT_URL,
  isSupabaseConfigured,
} from "../config/env";
import { supabase } from "./supabaseClient";

export const AUTH_SESSION_STORAGE_KEY = "tic-tac-toe-auth-session";
export const PROFILE_STORAGE_KEY = "tic-tac-toe-profile-map";
const LOCAL_PROVIDER = "local";
const SUPABASE_PROVIDER = "supabase";

function getStorage(storage) {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function getProfileKey(authUserOrEmail) {
  if (!authUserOrEmail) {
    return "";
  }

  if (typeof authUserOrEmail === "string") {
    return normalizeEmail(authUserOrEmail);
  }

  return normalizeEmail(authUserOrEmail.email);
}

function normalizeProfileName(name) {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24);
}

function normalizeAuthUser(authUser, fallbackProvider = LOCAL_PROVIDER) {
  if (!authUser || typeof authUser !== "object") {
    return null;
  }

  const email = normalizeEmail(authUser.email);

  if (!email) {
    return null;
  }

  return {
    id:
      typeof authUser.id === "string" && authUser.id.trim()
        ? authUser.id.trim()
        : `local-${email}`,
    email,
    provider:
      typeof authUser.provider === "string" && authUser.provider.trim()
        ? authUser.provider.trim()
        : fallbackProvider,
  };
}

function normalizeSupabaseUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const provider =
    user.app_metadata?.provider ||
    user.identities?.[0]?.provider ||
    SUPABASE_PROVIDER;

  return normalizeAuthUser(
    {
      id: user.id,
      email: user.email,
      provider,
    },
    SUPABASE_PROVIDER
  );
}

function getSupabaseProfileName(user) {
  return normalizeProfileName(user?.user_metadata?.profile_name);
}

function createAuthState(authUser, profileName) {
  return {
    authUser,
    profileName: normalizeProfileName(profileName),
  };
}

function createSupabaseAuthState(session) {
  const authUser = normalizeSupabaseUser(session?.user);

  return createAuthState(authUser, getSupabaseProfileName(session?.user));
}

function getAuthRedirectUrl() {
  if (SUPABASE_AUTH_REDIRECT_URL) {
    return SUPABASE_AUTH_REDIRECT_URL;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return undefined;
}

export function isUsingSupabaseAuth() {
  return AUTH_PROVIDER === SUPABASE_PROVIDER && isSupabaseConfigured() && Boolean(supabase);
}

function loadProfileMap(storage) {
  const safeStorage = getStorage(storage);

  if (!safeStorage) {
    return {};
  }

  try {
    const storedValue = safeStorage.getItem(PROFILE_STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    return Object.entries(parsedValue).reduce((profileMap, [email, name]) => {
      const normalizedEmail = normalizeEmail(email);
      const normalizedName = normalizeProfileName(name);

      if (normalizedEmail && normalizedName) {
        profileMap[normalizedEmail] = normalizedName;
      }

      return profileMap;
    }, {});
  } catch {
    return {};
  }
}

function saveProfileMap(profileMap, storage) {
  const safeStorage = getStorage(storage);

  if (!safeStorage) {
    return profileMap;
  }

  try {
    safeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileMap));
  } catch {
    return profileMap;
  }

  return profileMap;
}

export function loadAuthSession(storage) {
  const safeStorage = getStorage(storage);

  if (!safeStorage) {
    return null;
  }

  try {
    return normalizeAuthUser(
      JSON.parse(safeStorage.getItem(AUTH_SESSION_STORAGE_KEY) ?? "null")
    );
  } catch {
    return null;
  }
}

export function saveAuthSession(authUser, storage) {
  const normalizedUser = normalizeAuthUser(authUser);
  const safeStorage = getStorage(storage);

  if (!safeStorage || !normalizedUser) {
    return normalizedUser;
  }

  try {
    safeStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify(normalizedUser)
    );
  } catch {
    return normalizedUser;
  }

  return normalizedUser;
}

export function clearAuthSession(storage) {
  const safeStorage = getStorage(storage);

  if (!safeStorage) {
    return;
  }

  try {
    safeStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // Ignore unavailable storage so guest play always works.
  }
}

export function getInitialAuthState(storage) {
  if (isUsingSupabaseAuth()) {
    return createAuthState(null, "");
  }

  const authUser = loadAuthSession(storage);

  return createAuthState(authUser, loadProfileName(authUser, storage));
}

export async function loadAuthState(storage) {
  if (!isUsingSupabaseAuth()) {
    return getInitialAuthState(storage);
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return createSupabaseAuthState(data.session);
}

export function subscribeToAuthState(onAuthStateChange) {
  if (!isUsingSupabaseAuth()) {
    return () => {};
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    onAuthStateChange(createSupabaseAuthState(session), event);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signInWithEmail(email, storage) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  if (isUsingSupabaseAuth()) {
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) {
      throw error;
    }

    return {
      message: `Magic link sent to ${normalizedEmail}. Open the email to finish signing in.`,
    };
  }

  const authUser = saveAuthSession(
    {
      id: `local-${normalizedEmail}`,
      email: normalizedEmail,
      provider: LOCAL_PROVIDER,
    },
    storage
  );

  return {
    ...createAuthState(authUser, loadProfileName(authUser, storage)),
    message: `Signed in locally as ${normalizedEmail}.`,
  };
}

export function loadProfileName(authUserOrEmail, storage) {
  if (
    authUserOrEmail &&
    typeof authUserOrEmail === "object" &&
    authUserOrEmail.provider !== LOCAL_PROVIDER
  ) {
    return normalizeProfileName(authUserOrEmail.profileName);
  }

  const profileKey = getProfileKey(authUserOrEmail);

  if (!profileKey) {
    return "";
  }

  return loadProfileMap(storage)[profileKey] ?? "";
}

export function saveProfileName(authUserOrEmail, profileName, storage) {
  if (
    isUsingSupabaseAuth() &&
    authUserOrEmail &&
    typeof authUserOrEmail === "object" &&
    authUserOrEmail.provider !== LOCAL_PROVIDER
  ) {
    throw new Error("Supabase profile updates must use saveProfileNameAsync.");
  }

  const profileKey = getProfileKey(authUserOrEmail);

  if (!profileKey) {
    return "";
  }

  const normalizedName = normalizeProfileName(profileName);
  const nextProfileMap = loadProfileMap(storage);

  if (normalizedName) {
    nextProfileMap[profileKey] = normalizedName;
  } else {
    delete nextProfileMap[profileKey];
  }

  saveProfileMap(nextProfileMap, storage);

  return normalizedName;
}

export function clearProfileName(authUserOrEmail, storage) {
  return saveProfileName(authUserOrEmail, "", storage);
}

export async function saveProfileNameAsync(authUser, profileName, storage) {
  if (
    isUsingSupabaseAuth() &&
    authUser &&
    typeof authUser === "object" &&
    authUser.provider !== LOCAL_PROVIDER
  ) {
    const normalizedName = normalizeProfileName(profileName);
    const { data, error } = await supabase.auth.updateUser({
      data: {
        profile_name: normalizedName,
      },
    });

    if (error) {
      throw error;
    }

    return {
      ...createAuthState(
        normalizeSupabaseUser(data.user),
        getSupabaseProfileName(data.user)
      ),
      message: normalizedName ? "Profile name saved." : "Profile name cleared.",
    };
  }

  const nextProfileName = saveProfileName(authUser, profileName, storage);

  return {
    ...createAuthState(normalizeAuthUser(authUser), nextProfileName),
    message: nextProfileName ? "Profile name saved." : "Profile name cleared.",
  };
}

export async function signOutAsync(storage) {
  if (isUsingSupabaseAuth()) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return {
      ...createAuthState(null, ""),
      message: "Signed out. Guest play is still available.",
    };
  }

  clearAuthSession(storage);

  return {
    ...createAuthState(null, ""),
    message: "Signed out. Guest play is still available.",
  };
}
