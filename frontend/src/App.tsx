import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import PageTransition from './components/common/PageTransition';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { PublicHomePage } from './pages/PublicHomePage';
import { PublicCoursesPage } from './pages/PublicCoursesPage';
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
import { PaymentSuccessPage } from './pages/student/PaymentSuccessPage';
import { PaymentCancelPage } from './pages/student/PaymentCancelPage';
import { ProfileSettingsPage } from './pages/student/ProfileSettingsPage';
import { QuizToLearnRedirect } from './pages/student/QuizToLearnRedirect';
import { QuizResultsPage } from './pages/student/QuizResultsPage';
import { AttemptedQuizzesPage } from './pages/student/AttemptedQuizzesPage';
import { UsersListPage } from './pages/admin/UsersListPage';
import { AdminUserDetailsPage } from './pages/admin/AdminUserDetailsPage';
import { PaymentManagementPage } from './pages/admin/PaymentManagementPage';
import { CategoriesManagementPage } from './pages/admin/CategoriesManagementPage';
import { TagsManagementPage } from './pages/admin/TagsManagementPage';
import { EnrollmentManagement } from './pages/admin/EnrollmentManagement';
import { VoucherManagementPage } from './pages/admin/VoucherManagementPage';
import { CourseContentManager } from './components/layout/CourseContentManager';
import { ModuleLessonsManager } from './components/layout/ModuleLessonsManager';
import { QuizzesListPage } from './pages/admin/QuizzesListPage';
import { QuizDetailPage } from './pages/admin/QuizDetailPage';
import { CreateQuizPage } from './pages/admin/CreateQuizPage';
import { CreateQuestionPage } from './pages/admin/CreateQuestionPage';
import { EditQuestionPage } from './pages/admin/EditQuestionPage';
import HeroSlidersPage from './pages/admin/HeroSlidersPage';
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
import { EnhancedPDFViewer } from './pages/EnhancedPDFViewer';
import BlogsListPage from './pages/admin/blog/BlogsListPage';
import CreateBlogPage from './pages/admin/blog/CreateBlogPage';
import EditBlogPage from './pages/admin/blog/EditBlogPage';
import BlogListingPage from './pages/blog/BlogListingPage';
import BlogDetailPage from './pages/blog/BlogDetailPage';
import NewBlogPage from './pages/blog/NewBlogPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import WhatsappConversationsPage from './pages/admin/WhatsappConversationsPage';
import PublicAIChatConversationsPage from './pages/admin/PublicAIChatConversationsPage';
import { StudentPolicyConsentGate } from './components/policy/StudentPolicyConsentGate';
import { UserRole } from './types/auth';
import { COURSE_MANAGER_ROLES } from './utils/roles';

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
const ProtectedRoute = ({
  children,
  adminOnly = false,
  allowedRoles,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: UserRole[];
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <StudentPolicyConsentGate>
          <PageTransition autoDetect={true}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<AuthPage />} />
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
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />

              {/* Public Blog Routes */}
              <Route path="/blogs" element={<BlogListingPage />} />
              <Route path="/blogs/:slug" element={<BlogDetailPage />} />
              <Route path="/newBlog" element={
                <ProtectedRoute adminOnly>
                  <NewBlogPage />
                </ProtectedRoute>
              } />
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
              <Route path="/pdf-enhanced" element={
                <ProtectedRoute>
                  <EnhancedPDFViewer />
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

              {/* Student Quiz Routes */}
              <Route path="/student/quiz/:quizId" element={
                <ProtectedRoute>
                  <QuizToLearnRedirect />
                </ProtectedRoute>
              } />

              <Route path="/student/quiz-results/:attemptId" element={
                <ProtectedRoute>
                  <QuizResultsPage />
                </ProtectedRoute>
              } />

              <Route path="/student/quiz-attempts" element={
                <ProtectedRoute>
                  <AttemptedQuizzesPage />
                </ProtectedRoute>
              } />

              <Route path="/payments" element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              } />

              <Route path="/student/profile" element={
                <ProtectedRoute>
                  <ProfileSettingsPage />
                </ProtectedRoute>
              } />

              <Route path="/cardPayment" element={
                <ProtectedRoute>
                  <CardPaymentPage />
                </ProtectedRoute>
              } />

              <Route path="/payment/success" element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              } />

              <Route path="/payment/cancel" element={
                <ProtectedRoute>
                  <PaymentCancelPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <UsersListPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/users/:userId" element={
                <ProtectedRoute adminOnly>
                  <AdminUserDetailsPage />
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

              <Route path="/students" element={
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
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
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
                  <CoursesListPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/courses/new" element={
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
                  <AddCoursePage />
                </ProtectedRoute>
              } />

              <Route path="/admin/courses/:courseId" element={
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
                  <AdminCourseDetailPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/courses/:courseId/edit" element={
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
                  <EditCoursePage />
                </ProtectedRoute>
              } />

              <Route path="/admin/courses/:courseId/content" element={
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
                  <CourseContentManager />
                </ProtectedRoute>
              } />

              <Route path="/admin/courses/:courseId/modules/:moduleId/lessons" element={
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
                  <ModuleLessonsManager />
                </ProtectedRoute>
              } />

              <Route path="/admin/courses/:courseId/content/:moduleId" element={
                <ProtectedRoute allowedRoles={COURSE_MANAGER_ROLES}>
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

              <Route path="/admin/hero-sliders" element={
                <ProtectedRoute adminOnly>
                  <HeroSlidersPage />
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

              {/* Admin Voucher Management */}
              <Route path="/admin/vouchers" element={
                <ProtectedRoute adminOnly>
                  <VoucherManagementPage />
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

              {/* Admin Quiz Management */}
              <Route path="/admin/quizzes" element={
                <ProtectedRoute adminOnly>
                  <QuizzesListPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/quizzes/new" element={
                <ProtectedRoute adminOnly>
                  <CreateQuizPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/quizzes/:quizId" element={
                <ProtectedRoute adminOnly>
                  <QuizDetailPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/quizzes/:quizId/edit" element={
                <ProtectedRoute adminOnly>
                  <CreateQuizPage />
                </ProtectedRoute>
              } />

              {/* Question Management Routes */}
              <Route path="/admin/quizzes/:quizId/questions/new" element={
                <ProtectedRoute adminOnly>
                  <CreateQuestionPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/questions/:questionId/edit" element={
                <ProtectedRoute adminOnly>
                  <EditQuestionPage />
                </ProtectedRoute>
              } />

              {/* Fallback route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageTransition>
          <ToastContainer position="bottom-right" />
          {/* <PublicMedicalAIBot /> */}
          </StudentPolicyConsentGate>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
