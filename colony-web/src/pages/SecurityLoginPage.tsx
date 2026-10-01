import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { securityLogin } from '../lib/api/auth';
import { useAuthStore } from '../lib/auth/authStore';

export function SecurityLoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [pin, setPin] = useState('');

  const securityLoginMutation = useMutation({
    mutationFn: securityLogin,
    onSuccess: (user) => {
      setUser(user);
      navigate(user.redirectUrl || '/app/security/home', { replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    securityLoginMutation.mutate(pin);
  }

  return (
    <div className="auth-layout">
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <section className="auth-panel auth-panel--intro">
          <img
            src={`${import.meta.env.BASE_URL}new_logo_light.svg`}
            alt="HPCL"
            style={{ height: '48px', margin: '0 auto 1rem', display: 'block' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}hp.png`;
            }}
          />
          <p className="auth-panel__eyebrow">Security Desk Portal</p>
          <h1>Colony Gate & Security Desk</h1>
          <p>
            Fast PIN-based authentication for security personnel and entry desk attendants.
          </p>
        </section>

        <section className="auth-panel auth-panel--form">
          <form className="stacked-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="security-pin-input" className="field-label">Security PIN</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="security-pin-input"
                  className="form-control"
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="Enter 4 or 6 digit PIN"
                  required
                  type="password"
                  value={pin}
                  style={{ minHeight: '48px', fontSize: '1.1rem', letterSpacing: '0.15em', paddingLeft: '2.5rem' }}
                  autoComplete="current-password"
                />
                <i
                  className="fa fa-shield"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '1.1rem',
                  }}
                />
              </div>
            </div>

            {securityLoginMutation.error ? (
              <p className="error-banner">
                <i className="fa fa-exclamation-circle" aria-hidden="true" style={{ marginRight: '6px' }} />
                {securityLoginMutation.error.message}
              </p>
            ) : null}

            <button
              className="btn btn-primary"
              disabled={securityLoginMutation.isPending}
              type="submit"
              style={{ width: '100%', minHeight: '48px', fontSize: '1rem' }}
            >
              <i className="fa fa-unlock-alt" aria-hidden="true" style={{ marginRight: '8px' }} />
              {securityLoginMutation.isPending ? 'Verifying PIN...' : 'Access Security Desk'}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
              <i className="fa fa-arrow-left" aria-hidden="true" />
              <span>Back to Employee Login</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
