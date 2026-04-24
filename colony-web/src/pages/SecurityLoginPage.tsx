import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { securityLogin } from '../lib/api/auth';
import { useAuthStore } from '../lib/auth/authStore';

export function SecurityLoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setCsrfToken = useAuthStore((state) => state.setCsrfToken);
  const [pin, setPin] = useState('');

  const securityLoginMutation = useMutation({
    mutationFn: securityLogin,
    onSuccess: (user) => {
      setUser(user);
      setCsrfToken(null);
      navigate(user.redirectUrl || '/app/security/home', { replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    securityLoginMutation.mutate(pin);
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-panel--intro">
        <p className="auth-panel__eyebrow">Security desk</p>
        <h1>PIN-based access for colony security users.</h1>
        <p>
          This screen keeps the legacy security entry point available while the real credential model is finalized.
        </p>
      </section>

      <section className="auth-panel auth-panel--form">
        <form className="stacked-form" onSubmit={handleSubmit}>
          <div>
            <span className="field-label">Security PIN</span>
            <input
              className="text-input"
              onChange={(event) => setPin(event.target.value)}
              placeholder="Enter PIN"
              required
              type="password"
              value={pin}
            />
          </div>

          {securityLoginMutation.error ? <p className="error-banner">{securityLoginMutation.error.message}</p> : null}

          <button className="primary-button" disabled={securityLoginMutation.isPending} type="submit">
            {securityLoginMutation.isPending ? 'Checking PIN...' : 'Open security workspace'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to main login</Link>
        </div>
      </section>
    </div>
  );
}
