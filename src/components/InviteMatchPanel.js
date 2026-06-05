import { memo } from "react";
import { buildInviteRoomUrl } from "../utils/inviteRoutes";

function InviteMatchPanel({
  authUser,
  canUseInviteMultiplayer,
  inviteDisplayName,
  onInviteDisplayNameChange,
  onCreateRoom,
  onJoinRoom,
  onCopyLink,
  onBackHome,
  onOpenInviteLobby,
  inviteRoom,
  inviteEntryState,
  isLoading,
  isCreating,
  isJoining,
  isPlaying,
  errorMessage,
  statusMessage,
  copyStatus,
  participantSymbol,
}) {
  const shareUrl = inviteRoom?.id ? buildInviteRoomUrl(inviteRoom.id) : "";
  const isBusy = isLoading || isCreating || isJoining || isPlaying;
  const hasSecondPlayer = Boolean(inviteRoom?.players?.O);

  return (
    <section className="sidebar-card invite-panel" aria-labelledby="invite-panel-title">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Invite multiplayer</p>
          <h2 id="invite-panel-title">
            {inviteRoom ? "Private match room" : "Create a shareable room"}
          </h2>
        </div>
      </div>

      <p className="local-records-copy">
        Invite links use signed-in Supabase accounts so both players can share the
        same live board safely.
      </p>

      <label className="account-field" htmlFor="invite-display-name">
        <span>Your display name</span>
        <input
          id="invite-display-name"
          type="text"
          value={inviteDisplayName}
          maxLength={24}
          disabled={isBusy || !canUseInviteMultiplayer}
          onChange={(event) => onInviteDisplayNameChange(event.target.value)}
          placeholder="Choose the name shown in the room"
        />
      </label>

      {!authUser || !canUseInviteMultiplayer ? (
        <p className="account-error">
          Sign in with a Supabase-backed account before creating or joining an
          invite match.
        </p>
      ) : null}

      {inviteRoom ? (
        <div className="invite-room-summary">
          <div className="invite-share-row">
            <label className="account-field invite-share-field" htmlFor="invite-share-link">
              <span>Share link</span>
              <input
                id="invite-share-link"
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Invite room share link"
              />
            </label>

            <button
              type="button"
              className="history-sort-button"
              onClick={onCopyLink}
              disabled={!shareUrl || isBusy}
            >
              Copy link
            </button>
          </div>

          <dl className="invite-player-list" aria-label="Invite room players">
            <div>
              <dt>Player X</dt>
              <dd>{inviteRoom.players?.X?.displayName || "Player X"}</dd>
            </div>
            <div>
              <dt>Player O</dt>
              <dd>
                {inviteRoom.players?.O?.displayName || "Waiting for opponent"}
              </dd>
            </div>
          </dl>

          {participantSymbol === "X" && !hasSecondPlayer ? (
            <p className="account-status" role="status">
              This is your room. Copy the link and send it to another signed-in
              player so they can join the O side.
            </p>
          ) : null}

          {inviteEntryState?.state === "joinable" ? (
            <button
              type="button"
              className="new-game-button"
              onClick={onJoinRoom}
              disabled={isBusy || !inviteDisplayName.trim()}
            >
              Join as Player O
            </button>
          ) : null}

          <div className="sidebar-action-buttons">
            <button
              type="button"
              className="display-name-reset-button"
              onClick={onOpenInviteLobby}
              disabled={isBusy}
            >
              New invite room
            </button>
            <button
              type="button"
              className="display-name-reset-button"
              onClick={onBackHome}
              disabled={isBusy}
            >
              Back to main game
            </button>
          </div>
        </div>
      ) : (
        <div className="sidebar-action-buttons">
          <button
            type="button"
            className="new-game-button"
            onClick={onCreateRoom}
            disabled={isBusy || !canUseInviteMultiplayer || !inviteDisplayName.trim()}
          >
            Create invite room
          </button>
          <button
            type="button"
            className="display-name-reset-button"
            onClick={onBackHome}
            disabled={isBusy}
          >
            Back to main game
          </button>
        </div>
      )}

      {copyStatus ? (
        <p className="account-status" role="status">
          {copyStatus}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="account-status" role="status">
          {statusMessage}
        </p>
      ) : null}

      {errorMessage ? <p className="account-error">{errorMessage}</p> : null}
    </section>
  );
}

export default memo(InviteMatchPanel);
