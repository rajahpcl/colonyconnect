import { useEffect, startTransition } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { fetchCurrentUser } from './lib/api/auth';
import { useAuthStore } from './lib/auth/authStore';
import { masterPageConfigs } from './lib/masters/config';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { SecurityLoginPage } from './pages/SecurityLoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { MasterDataPage } from './pages/masters/MasterDataPage';

const adminRoles = ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'];

function AuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);

  useEffect(() => {
    let active = true;

    startTransition(() => {
      setBootstrapping(true);
    });

    fetchCurrentUser()
      .then((user) => {
        if (active) {
          setUser(user);
        }
      })
      .catch(() => {
        if (active) {
          clearSession();
        }
      })
      .finally(() => {
        if (active) {
          startTransition(() => {
            setBootstrapping(false);
          });
        }
      });

    return () => {
      active = false;
    };
  }, [clearSession, setBootstrapping, setUser]);

  return null;
}

function App() {
  return (
    <>
      <AuthBootstrap />

      <Routes>
        <Route element={<Navigate replace to="/login" />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SecurityLoginPage />} path="/security-login" />
        <Route element={<UnauthorizedPage />} path="/unauthorized" />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
          path="/app"
        >
          <Route element={<Navigate replace to="/app/home" />} index />
          <Route element={<DashboardPage />} path="home" />
          <Route
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <DashboardPage />
              </ProtectedRoute>
            }
            path="admin/dashboard"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['IFMS', ...adminRoles]}>
                <PlaceholderPage
                  description="The IFMS queue and complaint workbench are queued for the next implementation phase, but the route and role shell are ready."
                  eyebrow="Phase 3 preview"
                  title="IFMS queue scaffold"
                />
              </ProtectedRoute>
            }
            path="ifms/pending"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['SECURITY']}>
                <PlaceholderPage
                  description="Security-specific workflows like electricity readings remain in the later roadmap, but the dedicated entry path is now in place."
                  eyebrow="Security shell"
                  title="Security workspace scaffold"
                />
              </ProtectedRoute>
            }
            path="security/home"
          />
          <Route
            element={
              <PlaceholderPage
                description="Resident complaint creation and listing will land in the complaint MVP phase, after this master-data shell."
                eyebrow="Phase 2 preview"
                title="Resident complaint area"
              />
            }
            path="complaints/my"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={masterPageConfigs.vendors.allowedRoles}>
                <MasterDataPage config={masterPageConfigs.vendors} />
              </ProtectedRoute>
            }
            path="masters/vendors"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={masterPageConfigs['vendor-mappings'].allowedRoles}>
                <MasterDataPage config={masterPageConfigs['vendor-mappings']} />
              </ProtectedRoute>
            }
            path="masters/vendor-mappings"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={masterPageConfigs['complaint-categories'].allowedRoles}>
                <MasterDataPage config={masterPageConfigs['complaint-categories']} />
              </ProtectedRoute>
            }
            path="masters/complaint-categories"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={masterPageConfigs['complaint-subcategories'].allowedRoles}>
                <MasterDataPage config={masterPageConfigs['complaint-subcategories']} />
              </ProtectedRoute>
            }
            path="masters/complaint-subcategories"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={masterPageConfigs['po-items'].allowedRoles}>
                <MasterDataPage config={masterPageConfigs['po-items']} />
              </ProtectedRoute>
            }
            path="masters/po-items"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={masterPageConfigs['ifms-members'].allowedRoles}>
                <MasterDataPage config={masterPageConfigs['ifms-members']} />
              </ProtectedRoute>
            }
            path="masters/ifms-members"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={masterPageConfigs.statuses.allowedRoles}>
                <MasterDataPage config={masterPageConfigs.statuses} />
              </ProtectedRoute>
            }
            path="masters/statuses"
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
