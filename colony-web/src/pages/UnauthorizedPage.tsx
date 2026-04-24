import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <section className="status-panel">
      <span className="status-panel__eyebrow">Access limited</span>
      <h2>This route is outside the current role scope.</h2>
      <p>
        The shell is working as designed, but the signed-in role does not have permission to open this page.
      </p>
      <Link className="primary-button primary-button--inline" to="/app/home">
        Return to home
      </Link>
    </section>
  );
}
