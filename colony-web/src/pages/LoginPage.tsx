import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../lib/api/auth';
import { useAuthStore } from '../lib/auth/authStore';

type LoginState = {
  empNo: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const setCsrfToken = useAuthStore((state) => state.setCsrfToken);
  const [testMode, setTestMode] = useState(false);
  const [formState, setFormState] = useState<LoginState>({
    empNo: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setUser(user);
      setCsrfToken(null);
      // Check if this was a test login (network error fallback)
      if (user.empNo === 'testadmin' || user.empNo === 'SECURITY') {
        setTestMode(true);
      }
      const destination = typeof location.state?.from === 'string' ? location.state.from : user.redirectUrl;
      navigate(destination || '/app/home', { replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTestMode(false);
    loginMutation.mutate(formState);
  }

  return (
    <div className="modern-login-wrapper">
      <div className="modern-login-split">
        {/* Left Side: Image / Branding */}
        <div className="modern-login-image-side">
          <div className="modern-login-overlay">
            <div className="modern-login-branding">
              <img src="/hp.png" alt="HPCL Logo" className="modern-login-brand-logo" />
              <h1 className="modern-login-brand-title">Colony Management System</h1>
              <p className="modern-login-brand-subtitle">Streamlined operations and maintenance for Hindustan Petroleum Corporation Limited colonies.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="modern-login-form-side">
          <div className="modern-login-form-container">
            <div className="modern-login-header">
              <img src="/hpcl_logo.png" alt="HPCL" className="modern-login-mobile-logo" />
              <h2>Welcome Back</h2>
              <p>Please enter your credentials to access the portal.</p>
            </div>

            <form className="modern-login-form" onSubmit={handleSubmit}>
              <div className="modern-input-group">
                <label htmlFor="empno-input" className="modern-label">Employee Number</label>
                <div className="modern-input-wrapper">
                  <i className="fa fa-user modern-input-icon"></i>
                  <input
                    id="empno-input"
                    className="modern-input"
                    onChange={(event) => setFormState((current) => ({ ...current, empNo: event.target.value }))}
                    placeholder="e.g. 12345678"
                    required
                    type="text"
                    value={formState.empNo}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="modern-input-group">
                <label htmlFor="password-input" className="modern-label">Password</label>
                <div className="modern-input-wrapper">
                  <i className="fa fa-lock modern-input-icon"></i>
                  <input
                    id="password-input"
                    className="modern-input"
                    onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                    placeholder="••••••••"
                    required
                    type="password"
                    value={formState.password}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {loginMutation.error && !testMode && (
                <div className="modern-alert modern-alert--error">
                  <i className="fa fa-exclamation-circle"></i> {loginMutation.error.message || 'Invalid authentication. Please check your credentials.'}
                </div>
              )}

              {testMode && (
                <div className="modern-alert modern-alert--info">
                  <i className="fa fa-info-circle"></i> Offline Mode: Logged in as test user.
                </div>
              )}

              <button id="login-button" className="modern-button modern-button--primary" disabled={loginMutation.isPending} type="submit">
                {loginMutation.isPending ? (
                  <><i className="fa fa-spinner fa-spin"></i> Authenticating...</>
                ) : (
                  <>Login <i className="fa fa-arrow-right"></i></>
                )}
              </button>

              <div className="modern-divider">
                <span>OR</span>
              </div>

              <button
                id="family-login-button"
                className="modern-button modern-button--secondary"
                type="button"
                onClick={() => navigate('/family-login')}
              >
                <i className="fa fa-users"></i> Family Login
              </button>
            </form>

            <div className="modern-login-footer">
               <p>Offline testing? Use <code>testadmin</code> / <code>admin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
