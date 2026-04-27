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
import { NewComplaintPage } from './pages/complaints/NewComplaintPage';
import { MyComplaintsPage } from './pages/complaints/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/complaints/ComplaintDetailPage';
import { InventoryListPage } from './pages/inventory/InventoryListPage';
import { InventoryFormPage } from './pages/inventory/InventoryFormPage';
import { VehicleListPage } from './pages/vehicles/VehicleListPage';
import { VehicleFormPage } from './pages/vehicles/VehicleFormPage';
import { ReadingsPage } from './pages/readings/ReadingsPage';
import { POListPage } from './pages/po/POListPage';
import { ReportsPage, DashboardReportPage, AllReportsPage } from './pages/reports';
import { PendingTasksPage, RequestListPage, ProxyRequestPage } from './pages/ifms';
import {
  AdminDashboardPage,
  AdminComplaintListPage,
  ElectricRatePage,
  AdminRolesPage,
  ElectricReadingFormPage,
  IFMSMasterPage,
  AssignFlatsPage,
} from './pages/admin';

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
                <AdminDashboardPage />
              </ProtectedRoute>
            }
            path="admin/dashboard"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <AdminComplaintListPage />
              </ProtectedRoute>
            }
            path="admin/complaints"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <ElectricRatePage />
              </ProtectedRoute>
            }
            path="admin/electric-rates"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <AdminRolesPage />
              </ProtectedRoute>
            }
            path="admin/roles"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <ElectricReadingFormPage />
              </ProtectedRoute>
            }
            path="admin/electric-reading"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <IFMSMasterPage />
              </ProtectedRoute>
            }
            path="admin/ifms-master"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <AssignFlatsPage />
              </ProtectedRoute>
            }
            path="admin/assign-flats"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['IFMS', ...adminRoles]}>
                <PendingTasksPage />
              </ProtectedRoute>
            }
            path="ifms/pending"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['IFMS', ...adminRoles]}>
                <RequestListPage />
              </ProtectedRoute>
            }
            path="ifms/requests"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['IFMS', ...adminRoles]}>
                <ProxyRequestPage />
              </ProtectedRoute>
            }
            path="ifms/proxy"
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
            element={<NewComplaintPage />}
            path="complaints/new"
          />
          <Route
            element={<MyComplaintsPage />}
            path="complaints/my"
          />
          <Route
            element={<ComplaintDetailPage />}
            path="complaints/:id"
          />
          <Route
            element={<InventoryListPage />}
            path="inventory/list"
          />
          <Route
            element={<InventoryFormPage />}
            path="inventory/new"
          />
          <Route
            element={<InventoryFormPage />}
            path="inventory/edit/:id"
          />
          <Route
            element={<VehicleListPage />}
            path="vehicles/list"
          />
          <Route
            element={<VehicleFormPage />}
            path="vehicles/new"
          />
          <Route
            element={<VehicleFormPage />}
            path="vehicles/edit/:id"
          />
          <Route
            element={<ReadingsPage />}
            path="readings/electric"
          />
          <Route
            element={<POListPage />}
            path="po/list"
          />
          <Route
            element={<ReportsPage />}
            path="reports"
          />
          <Route
            element={<DashboardReportPage />}
            path="reports/dashboard"
          />
          <Route
            element={<AllReportsPage />}
            path="reports/all"
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
