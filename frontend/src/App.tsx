import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { PublicHomePage } from './pages/PublicHomePage';
import { PublicCoursesPage } from './pages/PublicCoursesPage';
import { LandingFirst } from './pages/LandingFirst';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { RequestPasswordResetPage } from './pages/RequestPasswordResetPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdDash } from './pages/admin/AdDash';
import { AddCourseContentPage } from './pages/admin/AddCourseContentPage';
import { AddCoursePage } from './pages/admin/AddCoursePage';
import { CoursesListPage } from './pages/admin/CoursesListPage';
import { EditCoursePage } from './pages/admin/EditCoursePage';
import { CourseDetailPage as AdminCourseDetailPage } from './pages/admin/CourseDetailPage';
import { CourseDetailPage as PublicCourseDetailPage } from './pages/CourseDetailPage';
import { CourseContentPage } from './pages/CourseContentPage';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { PaymentsPage } from './pages/student/PaymentsPage';
import { UsersListPage } from './pages/admin/UsersListPage';
import { PaymentManagementPage } from './pages/admin/PaymentManagementPage';
import { CategoriesManagementPage } from './pages/admin/CategoriesManagementPage';
import { TagsManagementPage } from './pages/admin/TagsManagementPage';
import { EnrollmentManagement } from './pages/admin/EnrollmentManagement';
import { CourseContentManager } from './components/layout/CourseContentManager';
import { ModuleLessonsManager } from './components/layout/ModuleLessonsManager';
import MedicHomePage from './pages/medicMaterial/MedicHomePage';
import MedicAboutPage from './pages/medicMaterial/MedicAboutPage';
import MedicScholarshipPage from './pages/medicMaterial/MedicScholarshipPage';
import MedicAccreditationsPage from './pages/medicMaterial/MedicAccreditationsPage';
import MedicPartnersPage from './pages/medicMaterial/MedicPartnersPage';
import MedicClinicalProgramsPage from './pages/medicMaterial/MedicClinicalProgramsPage';
import MedicAdvancedUKProgramPage from './pages/medicMaterial/MedicAdvancedUKProgramPage';
import MedicLMSPage from './pages/medicMaterial/MedicLMSPage';
import MedicOSCEAppPage from './pages/medicMaterial/MedicOSCEAppPage';
import MedicBlogsPage from './pages/medicMaterial/MedicBlogsPage';
import MedicContactPage from './pages/medicMaterial/MedicContactPage';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingFirst />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/home" element={<PublicHomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
            <Route path="/auth/request-password-reset" element={<RequestPasswordResetPage />} />
            <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/courses" element={<PublicCoursesPage />} />
            <Route path="/courses/:courseId" element={<PublicCourseDetailPage />} />
            <Route path="/medicHomePage" element={<MedicHomePage />} />
            <Route path="/medicAbout" element={<MedicAboutPage />} />
            <Route path="/medicScholarship" element={<MedicScholarshipPage />} />
            <Route path="/medicAccreditations" element={<MedicAccreditationsPage />} />
            <Route path="/medicPartners" element={<MedicPartnersPage />} />
            <Route path="/medicClinicalPrograms" element={<MedicClinicalProgramsPage />} />
            <Route path="/medicAdvancedUKProgram" element={<MedicAdvancedUKProgramPage />} />
            <Route path="/medicLMS" element={<MedicLMSPage />} />
            <Route path="/medicOSCEApp" element={<MedicOSCEAppPage />} />
            <Route path="/medicBlogs" element={<MedicBlogsPage />} />
            <Route path="/medicContact" element={<MedicContactPage />} />
            <Route path="/courses/:courseId/learn" element={
              <ProtectedRoute>
                <CourseContentPage />
              </ProtectedRoute>
            } />
            <Route path="/courses/:courseId/learn/:sectionId/:lessonId" element={
              <ProtectedRoute>
                <CourseContentPage />
              </ProtectedRoute>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            
            <Route path="/my-courses" element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            } />

            <Route path="/student/courses" element={
              <ProtectedRoute>
                <StudentCoursesPage />
              </ProtectedRoute>
            } />

            <Route path="/payments" element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            } />

            {/* Admin Users Route */}
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <UsersListPage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdDash />
              </ProtectedRoute>
            } />
            
            <Route path="/enrolled" element={
              <ProtectedRoute adminOnly>
                <EnrollmentManagement />
              </ProtectedRoute>
            } />
            
            {/* Keep the original dashboard accessible at /admin/old-dashboard if needed */}
            <Route path="/admin/old-dashboard" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/courses" element={
              <ProtectedRoute adminOnly>
                <CoursesListPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/courses/new" element={
              <ProtectedRoute adminOnly>
                <AddCoursePage />
              </ProtectedRoute>
            } />

            <Route path="/admin/courses/:courseId" element={
              <ProtectedRoute adminOnly>
                <AdminCourseDetailPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/courses/:courseId/edit" element={
              <ProtectedRoute adminOnly>
                <EditCoursePage />
              </ProtectedRoute>
            } />

            <Route path="/admin/courses/:courseId/content" element={
              <ProtectedRoute adminOnly>
                <CourseContentManager />
              </ProtectedRoute>
            } />

            <Route path="/admin/courses/:courseId/modules/:moduleId/lessons" element={
              <ProtectedRoute adminOnly>
                <ModuleLessonsManager />
              </ProtectedRoute>
            } />

            <Route path="/admin/courses/:courseId/content/new" element={
              <ProtectedRoute adminOnly>
                <AddCourseContentPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/payments" element={
              <ProtectedRoute adminOnly>
                <PaymentManagementPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/categories" element={
              <ProtectedRoute adminOnly>
                <CategoriesManagementPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/tags" element={
              <ProtectedRoute adminOnly>
                <TagsManagementPage />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="bottom-right" />
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
