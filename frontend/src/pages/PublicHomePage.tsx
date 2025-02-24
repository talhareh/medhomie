import { Header } from '../components/common/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faChalkboardTeacher, 
  faGraduationCap, 
  faCalendarAlt,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export const PublicHomePage = () => {
  const navigate = useNavigate();
  const featuredCourses = [
    { id: 1, title: 'FCPS Medicine Part-I', specialty: 'Internal Medicine', progress: 0 },
    { id: 2, title: 'MRCP PACES', specialty: 'Internal Medicine', progress: 0 },
    { id: 3, title: 'MCPS Surgery', specialty: 'Surgery', progress: 0 },
    { id: 4, title: 'FCPS Pediatrics', specialty: 'Pediatrics', progress: 0 },
  ];

  const specializations = [
    { title: 'Internal Medicine', icon: faStethoscope, count: 12 },
    { title: 'Surgery', icon: faStethoscope, count: 8 },
    { title: 'Pediatrics', icon: faStethoscope, count: 6 },
    { title: 'Gynecology', icon: faStethoscope, count: 5 },
    { title: 'Radiology', icon: faStethoscope, count: 4 },
    { title: 'Psychiatry', icon: faStethoscope, count: 3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="card bg-gradient-to-r from-primary to-primary/80 text-white">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to MedHome Learning
          </h1>
          <p className="text-lg opacity-90">
            Your gateway to advanced medical education and specialization
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-blue-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faBook} className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">Courses</h3>
                <p className="text-sm text-neutral-600">38 Available</p>
              </div>
            </div>
          </div>
          <div className="card bg-green-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">Instructors</h3>
                <p className="text-sm text-neutral-600">45 Experts</p>
              </div>
            </div>
          </div>
          <div className="card bg-purple-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faGraduationCap} className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">Students</h3>
                <p className="text-sm text-neutral-600">1200+ Enrolled</p>
              </div>
            </div>
          </div>
          <div className="card bg-orange-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">Live Sessions</h3>
                <p className="text-sm text-neutral-600">8 Upcoming</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-800">Featured Courses</h2>
              <button
                onClick={() => navigate('/courses')}
                className="mt-8 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                View All Courses
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredCourses.map(course => (
                <div key={course.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <span className="text-sm text-primary font-medium">{course.specialty}</span>
                      <h3 className="text-lg font-semibold text-neutral-800 mt-1">{course.title}</h3>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-neutral-600">{course.progress}%</span>
                      </div>
                    </div>
                    <button className="btn-outline w-full mt-4">Enroll Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-800">Specializations</h2>
            <div className="card divide-y">
              {specializations.map((spec, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0">
                  <button className="w-full flex items-center justify-between hover:text-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={spec.icon} className="text-primary" />
                      <span className="font-medium">{spec.title}</span>
                    </div>
                    <span className="text-sm text-neutral-500">{spec.count} courses</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
