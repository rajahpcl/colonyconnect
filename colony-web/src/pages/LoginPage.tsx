import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const [formState, setFormState] = useState<LoginState>({
    empNo: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setUser(user);
      setCsrfToken(null);
      const destination = typeof location.state?.from === 'string' ? location.state.from : user.redirectUrl;
      navigate(destination || '/app/home', { replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate(formState);
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-split-container">
        {/* Left Side - Image */}
        <div className="login-image-side">
          <div className="login-image-card">
            <img 
              src="/housing_complex_illustration.png" 
              alt="Housing Complex" 
              className="login-hero-image"
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-side">
          <div className="login-form-container">
            <h1 className="login-title">COLONYCONNECT</h1>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <input
                  className="login-input"
                  onChange={(event) => setFormState((current) => ({ ...current, empNo: event.target.value }))}
                  placeholder="Employee Number"
                  required
                  type="text"
                  value={formState.empNo}
                />
              </div>

              <div className="login-field">
                <input
                  className="login-input"
                  onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Password"
                  required
                  type="password"
                  value={formState.password}
                />
              </div>

              {loginMutation.error && (
                <div className="login-alert">
                  {loginMutation.error.message || 'Session expired. Please login again.'}
                </div>
              )}

              <button className="login-button" disabled={loginMutation.isPending} type="submit">
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
