/** The one notice shown while the hub's sign-in gateway turns this browser away. */
export function SignInExpiredNotice({ className }: { className?: string }) {
  return (
    <div className={className ? `error-banner ${className}` : 'error-banner'} role="alert">
      <span>Your sign-in has expired. Sign in again to reconnect; drafts stay on this device.</span>
      {/* A navigation, which the gateway's login can answer and a fetch cannot. */}
      <a className="error-banner__retry" href="/">Sign in again</a>
    </div>
  )
}
