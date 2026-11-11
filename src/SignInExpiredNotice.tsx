/**
 * The one notice shown while the hub's sign-in gateway turns this browser away.
 * It floats above every pane, since any of them can hide or cover the others,
 * except while a modal is open: that keeps focus inside itself, so it carries
 * the notice instead.
 */
export function SignInExpiredNotice({ placement }: { placement: 'floating' | 'inline' }) {
  return (
    <div className={`error-banner sign-in-notice sign-in-notice--${placement}`} role="alert">
      <span>Your sign-in has expired. Sign in again to reconnect; drafts stay on this device.</span>
      {/* A navigation, which the gateway's login can answer and a fetch cannot. */}
      <a className="error-banner__retry" href="/">Sign in again</a>
    </div>
  )
}
