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
// import { AddCourseContentPage } from './pages/admin/AddCourseContentPage';
import { AddCoursePage } from './pages/admin/AddCoursePage';
import { CoursesListPage } from './pages/admin/CoursesListPage';
import { EditCoursePage } from './pages/admin/EditCoursePage';
import { CourseDetailPage as AdminCourseDetailPage } from './pages/admin/CourseDetailPage';
import { CourseDetailPage as PublicCourseDetailPage } from './pages/CourseDetailPage';
import { CourseContentPage } from './pages/CourseContentPage';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { PaymentsPage } from './pages/student/PaymentsPage';
import { CardPaymentPage } from './pages/student/CardPaymentPage';
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
import { PDFViewerPage } from './pages/PDFViewerPage';
import BlogsListPage from './pages/admin/blog/BlogsListPage';
import CreateBlogPage from './pages/admin/blog/CreateBlogPage';
import EditBlogPage from './pages/admin/blog/EditBlogPage';
import BlogListingPage from './pages/blog/BlogListingPage';
import BlogDetailPage from './pages/blog/BlogDetailPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import WhatsappConversationsPage from './pages/admin/WhatsappConversationsPage';
import MedicalAIBot from './components/common/MedicalAIBot';
import PublicAIChatConversationsPage from './pages/admin/PublicAIChatConversationsPage';

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

function PublicMedicalAIBot() {
  const { user, isLoading } = useAuth();
  if (isLoading || user) return null;
  return <MedicalAIBot />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MedicHomePage />} />
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
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            
            {/* Public Blog Routes */}
            <Route path="/blogs" element={<BlogListingPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
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
            
            {/* PDF Viewer Routes */}
            <Route path="/pdf/:courseId/modules/:moduleId/lessons/:lessonId/attachments/:attachmentIndex" element={
              <ProtectedRoute>
                <PDFViewerPage />
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

            <Route path="/cardPayment" element={
              <ProtectedRoute>
                <CardPaymentPage />
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

            <Route path="/admin/courses/:courseId/content/:moduleId" element={
              <ProtectedRoute adminOnly>
                <ModuleLessonsManager />
              </ProtectedRoute>
            } />
            
            {/* Admin Blog Management */}
            <Route path="/admin/blogs" element={
              <ProtectedRoute adminOnly>
                <BlogsListPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/blogs/new" element={
              <ProtectedRoute adminOnly>
                <CreateBlogPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/blogs/:id" element={
              <ProtectedRoute adminOnly>
                <EditBlogPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Payment Management */}
            <Route path="/admin/payments" element={
              <ProtectedRoute adminOnly>
                <PaymentManagementPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Categories Management */}
            <Route path="/admin/categories" element={
              <ProtectedRoute adminOnly>
                <CategoriesManagementPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Tags Management */}
            <Route path="/admin/tags" element={
              <ProtectedRoute adminOnly>
                <TagsManagementPage />
              </ProtectedRoute>
            } />
            
            {/* Admin WhatsApp Conversations */}
            <Route path="/admin/whatsapp-conversations" element={
              <ProtectedRoute adminOnly>
                <WhatsappConversationsPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Public AI Chat Conversations */}
            <Route path="/admin/public-ai-chat-conversations" element={
              <ProtectedRoute adminOnly>
                <PublicAIChatConversationsPage />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="bottom-right" />
          <PublicMedicalAIBot />
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
