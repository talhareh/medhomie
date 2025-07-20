import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookOpen,
  faUserGraduate,
  faChalkboardTeacher,
  faChartLine,
  faCalendarAlt,
  faUsers,
  faLaptop,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicLMSPage component - Learning Management System page for MedHome
 * Based on the MedHome LMS page but with MedHome branding and content
 */
const MedicLMSPage: React.FC = () => {
  // LMS features data
  const lmsFeatures = [
    {
      id: 1,
      title: "Integrated Learning Platform",
      description: "Track your performance, path, and create a unique learning journey tailored to your needs.",
      icon: faChartLine
    },
    {
      id: 2,
      title: "Enhanced User Interaction",
      description: "Easy login, intuitive interface, and great learning adaptability with numerous built-in features.",
      icon: faUserGraduate
    },
    {
      id: 3,
      title: "Virtual Libraries",
      description: "Access comprehensive study materials tailored to your preferences and learning style.",
      icon: faBookOpen
    },
    {
      id: 4,
      title: "Real-time Learning",
      description: "Participate in live sessions, interactive discussions, and engage with course content in real-time.",
      icon: faLaptop
    },
    {
      id: 5,
      title: "Study Groups",
      description: "Collaborate with peers, share insights, and learn together in virtual study groups.",
      icon: faUsers
    },
    {
      id: 6,
      title: "Learning Calendar",
      description: "Organize your study schedule, set reminders, and never miss important deadlines or sessions.",
      icon: faCalendarAlt
    },
    {
      id: 7,
      title: "Direct Mentor Interaction",
      description: "Connect with expert mentors for personalized guidance, feedback, and support throughout your learning journey.",
      icon: faChalkboardTeacher
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">MedHome Learning Management System</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Elevate your medical education with our comprehensive learning platform
          </p>
          <button className="bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-neutral-100 transition-colors">
            Request Demo
          </button>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Learn with MedHome LMS!</h2>
            <p className="text-lg text-neutral-700 mb-6">
              MedHome offers a one-stop solution for medical aspirants, delivering unique learning opportunities through its Learning Management System. With access to exclusive medical courses and related course products, MedHome empowers aspirants to build their dream medical career.
            </p>
            <p className="text-lg text-neutral-700">
              Our platform is designed to meet the evolving needs of modern healthcare professionals, helping you elevate your expertise and take the next step in your career.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">MedHome LMS Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lmsFeatures.map(feature => (
              <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={feature.icon} className="text-primary text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-neutral-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Why Choose MedHome LMS?</h2>
            
            <div className="bg-primary/10 p-8 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4">Comprehensive Learning Experience</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Access to study groups, learning calendar, and real-time mock exams</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Group assignments and collaborative learning opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Direct mentor interaction for personalized guidance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Extensive study materials and resources at your fingertips</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Customized performance reports to track your progress</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <a 
                href="#" 
                className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Explore MedHome LMS <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Request Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Request a Demo</h2>
          <p className="text-center text-lg text-neutral-700 mb-8">
            Experience the power of MedHome LMS firsthand with a personalized demo
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-neutral-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-neutral-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-neutral-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-neutral-700 mb-1">Organization</label>
                  <input 
                    type="text" 
                    id="organization" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your organization"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-neutral-700 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us about your specific requirements"
                ></textarea>
              </div>
              <button 
                type="button" 
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicLMSPage;
