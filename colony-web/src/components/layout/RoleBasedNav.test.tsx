import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoleBasedNav } from './RoleBasedNav';

describe('RoleBasedNav', () => {
  it('shows master-data navigation for admin users', () => {
    render(
      <MemoryRouter>
        <RoleBasedNav
          user={{
            empNo: '31982600',
            name: 'Colony Admin',
            role: 'ADMIN',
            roles: ['ADMIN', 'COMPLEX_ADMIN'],
            complexCode: 'MUMBAI',
            vehicleRegistered: false,
            redirectUrl: '/app/admin/dashboard',
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /vendors/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vendor mapping/i })).toBeInTheDocument();
  });

  it('hides admin-only links from resident users', () => {
    render(
      <MemoryRouter>
        <RoleBasedNav
          user={{
            empNo: '31982601',
            name: 'Resident User',
            role: 'RESIDENT',
            roles: ['RESIDENT'],
            complexCode: 'MUMBAI',
            vehicleRegistered: true,
            redirectUrl: '/app/home',
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /my complaints/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /vendors/i })).not.toBeInTheDocument();
  });
});
