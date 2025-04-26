import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faChalkboardTeacher, 
  faBook, 
  faUsers,
  faCheck,
  faArrowRight,
  faUser,
  faSignOutAlt,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

export const LandingFirst: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Sample data for instructors
  const instructors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', students: 1200, courses: 8, image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Neurology', students: 950, courses: 6, image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 3, name: 'Dr. Amina Patel', specialty: 'Pediatrics', students: 1050, courses: 7, image: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 4, name: 'Dr. James Wilson', specialty: 'Surgery', students: 1300, courses: 9, image: 'https://randomuser.me/api/portraits/men/52.jpg' },
  ];

  // Sample data for courses
  const featuredCourses = [
    { id: 1, title: 'Advanced Cardiac Life Support', category: 'Emergency Medicine', students: 450, image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
    { id: 2, title: 'Surgical Techniques Masterclass', category: 'Surgery', students: 320, image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  ];

  // Sample data for testimonials
  const testimonials = [
    { id: 1, name: 'Dr. Lisa Zhang', role: 'Resident Physician', text: 'MedHome helped me prepare for my board exams with comprehensive materials and expert instruction.', image: 'https://randomuser.me/api/portraits/women/28.jpg' },
    { id: 2, name: 'Dr. Robert Miller', role: 'Cardiologist', text: 'The specialized courses on MedHome have significantly improved my clinical practice and patient outcomes.', image: 'https://randomuser.me/api/portraits/men/22.jpg' },
  ];

  // Sample data for pricing plans
  const pricingPlans = [
    { 
      id: 1, 
      name: 'Basic', 
      price: 29, 
      period: 'monthly',
      features: [
        'Access to 10 courses',
        'Basic certification',
        'Forum access',
        '3-month access',
      ],
      recommended: false
    },
    { 
      id: 2, 
      name: 'Professional', 
      price: 99, 
      period: 'monthly',
      features: [
        'Access to all courses',
        'Premium certification',
        'Priority support',
        '1-year access',
        'Live webinars'
      ],
      recommended: true
    },
    { 
      id: 3, 
      name: 'Institution', 
      price: 249, 
      period: 'monthly',
      features: [
        'Team access (up to 10)',
        'Custom learning paths',
        'Dedicated support',
        'Unlimited access',
        'Private sessions'
      ],
      recommended: false
    }
  ];

  // Statistics
  const stats = [
    { label: 'Courses', value: '75+' },
    { label: 'Students', value: '10k+' },
    { label: 'Instructors', value: '45+' },
    { label: 'Success Rate', value: '98%' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-primary text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
              MedHome
            </Link>
            <div className="hidden md:flex space-x-8">
              <a href="#courses" className="hover:text-blue-200">Courses</a>
              <a href="#instructors" className="hover:text-blue-200">Instructors</a>
              <a href="#pricing" className="hover:text-blue-200">Pricing</a>
              <a href="#testimonials" className="hover:text-blue-200">Testimonials</a>
            </div>
            <div className="space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to={user.role === 'admin' ? '/admin' : 
                        user.role === 'instructor' ? '/dashboard' : 
                        '/dashboard'} 
                    className="flex items-center px-4 py-2 text-white hover:text-blue-200"
                  >
                    <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                    Dashboard
                  </Link>
                  <div className="flex items-center px-4 py-2 text-white">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    {user.name || user.email}
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }} 
                    className="flex items-center px-4 py-2 text-white hover:text-blue-200"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/auth?mode=login" className="px-4 py-2 text-white hover:text-blue-200">
                    Login
                  </Link>
                  <Link to="/auth?mode=register" className="px-6 py-2 bg-white text-primary rounded-md hover:bg-blue-100 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Pathway to Mastery in Medicine
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Advanced specialized medical certifications and courses for healthcare professionals.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/courses" className="btn-lg bg-white text-primary hover:bg-blue-100 transition-colors">
                Explore Courses
              </Link>
              <Link to="/auth?mode=register" className="btn-lg border-2 border-white hover:bg-white hover:text-primary transition-colors">
                Get Started
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80" 
              alt="Medical professional"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-10 shadow-md">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Instructors */}
      <section id="instructors" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Expert Instructors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map(instructor => (
              <div key={instructor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={instructor.image} 
                  alt={instructor.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{instructor.name}</h3>
                  <p className="text-primary font-medium mb-4">{instructor.specialty}</p>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>{instructor.students} Students</span>
                    <span>{instructor.courses} Courses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full md:w-1/3 h-48 md:h-auto object-cover"
                />
                <div className="p-6 flex-1">
                  <span className="text-primary font-medium">{course.category}</span>
                  <h3 className="font-bold text-xl my-2 text-gray-800">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.students} students enrolled</p>
                  <Link to={`/courses/${course.id}`} className="text-primary font-medium flex items-center">
                    Learn More <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/courses" className="btn-lg bg-primary text-white hover:bg-primary-dark transition-colors">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-primary-dark bg-opacity-30 p-8 rounded-lg">
                <p className="text-lg mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-blue-200">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map(plan => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.recommended ? 'border-2 border-primary transform -translate-y-2' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="bg-primary text-white text-center py-2">
                    Recommended
                  </div>
                )}
                <div className="p-8">
                  <h3 className="font-bold text-2xl mb-4 text-gray-800">{plan.name}</h3>
                  <div className="flex items-end mb-6">
                    <span className="text-4xl font-bold text-primary">${plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-lg font-medium ${
                    plan.recommended 
                      ? 'bg-primary text-white hover:bg-primary-dark' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}>
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Advance Your Medical Career?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of healthcare professionals who are transforming their careers with MedHome's specialized courses.
          </p>
          <Link to="/auth?mode=register" className="btn-lg bg-primary text-white hover:bg-primary-dark transition-colors">
            Start Learning Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MedHome</h3>
              <p className="text-gray-400">
                Advanced medical education platform for healthcare professionals.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#courses" className="text-gray-400 hover:text-white">Courses</a></li>
                <li><a href="#instructors" className="text-gray-400 hover:text-white">Instructors</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Subscribe</h4>
              <p className="text-gray-400 mb-4">Stay updated with our latest courses and offers.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-md w-full focus:outline-none text-gray-800"
                />
                <button className="bg-primary px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} MedHome. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
