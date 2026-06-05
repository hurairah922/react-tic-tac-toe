const INVITE_ROOT_PATH = "/play/invite";

function getLocation(locationOverride) {
  if (locationOverride) {
    return locationOverride;
  }

  if (typeof window === "undefined") {
    return {
      origin: "",
      pathname: "/",
      search: "",
      hash: "",
    };
  }

  return window.location;
}

function normalizePathname(pathname = "/") {
  const normalizedPathname = String(pathname || "/").replace(/\/+$/, "");

  return normalizedPathname || "/";
}

export function parseInviteRoute(locationOverride) {
  const { pathname } = getLocation(locationOverride);
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === INVITE_ROOT_PATH) {
    return {
      kind: "invite-lobby",
      roomId: "",
    };
  }

  if (normalizedPathname.startsWith(`${INVITE_ROOT_PATH}/`)) {
    const roomId = normalizedPathname.slice(INVITE_ROOT_PATH.length + 1).trim();

    return {
      kind: roomId ? "invite-room" : "invite-lobby",
      roomId,
    };
  }

  return {
    kind: "home",
    roomId: "",
  };
}

export function buildInviteRoomPath(roomId) {
  const normalizedRoomId = String(roomId ?? "").trim();

  return normalizedRoomId
    ? `${INVITE_ROOT_PATH}/${normalizedRoomId}`
    : INVITE_ROOT_PATH;
}

export function buildInviteRoomUrl(roomId, locationOverride) {
  const location = getLocation(locationOverride);
  const path = buildInviteRoomPath(roomId);

  return `${location.origin}${path}`;
}

export function getCurrentPath(locationOverride) {
  const location = getLocation(locationOverride);

  return `${normalizePathname(location.pathname)}${location.search || ""}${
    location.hash || ""
  }`;
}

export function navigateToPath(path, { replace = false } = {}) {
  if (typeof window === "undefined" || !window.history?.pushState) {
    return;
  }

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function navigateToInviteLobby(options) {
  navigateToPath(INVITE_ROOT_PATH, options);
}

export function navigateToInviteRoom(roomId, options) {
  navigateToPath(buildInviteRoomPath(roomId), options);
}

export function navigateHome(options) {
  navigateToPath("/", options);
}
