import { memo, useEffect, useState } from "react";
import {
  getConfiguredAuthProviderLabel,
  isSupabaseConfigured,
  AUTH_PROVIDER,
} from "../config/env";

function AccountPanel({
  authUser,
  profileName,
  onSignIn,
  onSignOut,
  onSaveProfileName,
  authStatusMessage,
  authErrorMessage,
  isAuthBusy,
}) {
  const [email, setEmail] = useState("");
  const [signInError, setSignInError] = useState("");
  const [profileDraft, setProfileDraft] = useState(profileName);
  const authProviderLabel = getConfiguredAuthProviderLabel();
  const supabaseReady = isSupabaseConfigured();
  const isSupabaseAuth = AUTH_PROVIDER === "supabase" && supabaseReady;

  useEffect(() => {
    setProfileDraft(profileName);
  }, [profileName]);

  const handleSignInSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setSignInError(
        isSupabaseAuth
          ? "Enter an email address to send a magic sign-in link."
          : "Enter an email address to sign in locally."
      );
      return;
    }

    setSignInError("");
    onSignIn(normalizedEmail);
    setEmail("");
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    onSaveProfileName(profileDraft);
  };

  return (
    <section className="account-panel" aria-labelledby="account-panel-title">
      <div className="account-panel-header">
        <div>
          <p className="eyebrow">Account</p>
          <h2 id="account-panel-title">
            {authUser ? "Signed in" : "Guest mode active"}
          </h2>
        </div>
        <span className={`account-badge${authUser ? " account-badge-active" : ""}`}>
          {authUser
            ? `${authProviderLabel} profile`
            : supabaseReady
            ? "Supabase ready"
            : "No sign-in required"}
        </span>
      </div>

      {authUser ? (
        <>
          <p className="account-copy">
            Playing with <strong>{authUser.email}</strong>. Your profile name can
            prefill match names, and guest play remains available at any time.
          </p>

          <form className="account-form" onSubmit={handleProfileSubmit}>
            <label className="account-field" htmlFor="profile-name">
              <span>Profile name</span>
              <input
                id="profile-name"
                type="text"
                value={profileDraft}
                maxLength={24}
                disabled={isAuthBusy}
                onChange={(event) => setProfileDraft(event.target.value)}
                placeholder="Choose a profile name"
              />
            </label>

            <div className="account-actions">
              <button
                type="submit"
                className="history-sort-button"
                disabled={isAuthBusy}
              >
                Save profile
              </button>
              <button
                type="button"
                className="account-sign-out-button"
                disabled={isAuthBusy}
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <p className="account-copy">
            {isSupabaseAuth
              ? "Send yourself a Supabase magic link when you want an account, or keep playing as a guest right away."
              : supabaseReady
              ? "Supabase environment values are loaded. The app will keep using local auth until the provider is switched."
              : "Start every round as a guest, or sign in with a lightweight local profile for Phase 7 identity testing."}
          </p>

          <form className="account-form" onSubmit={handleSignInSubmit}>
            <label className="account-field" htmlFor="sign-in-email">
              <span>Email</span>
              <input
                id="sign-in-email"
                type="email"
                value={email}
                disabled={isAuthBusy}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </label>

            <div className="account-actions">
              <button
                type="submit"
                className="history-sort-button"
                disabled={isAuthBusy}
              >
                {isSupabaseAuth ? "Send magic link" : "Sign in"}
              </button>
            </div>

            {signInError ? <p className="account-error">{signInError}</p> : null}
          </form>
        </>
      )}

      {authStatusMessage ? (
        <p className="account-status" role="status">
          {authStatusMessage}
        </p>
      ) : null}
      {authErrorMessage ? <p className="account-error">{authErrorMessage}</p> : null}
    </section>
  );
}

export default memo(AccountPanel);
