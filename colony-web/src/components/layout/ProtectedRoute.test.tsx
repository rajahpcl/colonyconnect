import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../../lib/auth/authStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      csrfToken: null,
      isBootstrapping: false,
    });
  });

  it('redirects anonymous users to the login page', () => {
    render(
      <MemoryRouter initialEntries={['/app/masters/vendors']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/app/masters/vendors"
            element={
              <ProtectedRoute>
                <div>Vendor Master</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders protected content when a session user is available', () => {
    useAuthStore.setState({
      user: {
        empNo: '31982600',
        name: 'Colony Admin',
        role: 'ADMIN',
        roles: ['ADMIN', 'COMPLEX_ADMIN'],
        complexCode: 'MUMBAI',
        vehicleRegistered: false,
        redirectUrl: '/app/admin/dashboard',
      },
      csrfToken: null,
      isBootstrapping: false,
    });

    render(
      <MemoryRouter initialEntries={['/app/masters/vendors']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/app/masters/vendors"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'COMPLEX_ADMIN']}>
                <div>Vendor Master</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Vendor Master')).toBeInTheDocument();
  });
});
