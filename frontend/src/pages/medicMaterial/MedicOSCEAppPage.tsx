import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faUserMd,
  faComments,
  faClipboardCheck,
  faIdCard,
  faCommentDots,
  faArrowRight,
  faMobileAlt
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicOSCEAppPage component - OSCE Exam Application page for MedHome
 * Based on the MedHomeMedic OSCE Exam App page but with MedHome branding and content
 */
const MedicOSCEAppPage: React.FC = () => {
  // OSCE App features data
  const osceFeatures = [
    {
      id: 1,
      title: "Real-like OSCE Exam Experience",
      description: "Experience scenarios that mimic the exact Royal College exam pattern in a strict time frame.",
      icon: faClock
    },
    {
      id: 2,
      title: "Interactive Examiner Simulation",
      description: "Feel the presence, response, and interaction between real examiners, role players and lay examiners.",
      icon: faUserMd
    },
    {
      id: 3,
      title: "Detailed Performance Feedback",
      description: "Get detailed feedback on your performance and areas for improvement at the end of every station.",
      icon: faClipboardCheck
    },
    {
      id: 4,
      title: "Universal OSCE Pattern Support",
      description: "Suitable for all OSCE Exam patterns with secure ID authentication.",
      icon: faIdCard
    },
    {
      id: 5,
      title: "Personalized Feedback",
      description: "Receive both written and verbal feedback tailored to your specific performance.",
      icon: faCommentDots
    },
    {
      id: 6,
      title: "Formalized Assessment Reports",
      description: "Detailed and formalized feedback at the end helps you enhance knowledge and perform better during real exams.",
      icon: faComments
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">MedHome OSCE Exam App</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            World's Best OSCE Course Provider - Practice, Perfect, Succeed
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
            <h2 className="text-3xl font-bold mb-8">Revolutionize Your OSCE Preparation</h2>
            <p className="text-lg text-neutral-700 mb-6">
              MedHome – The one-stop destination for medical aspirants, provides a unique learning opportunity through our OSCE Exam App. Through this innovative application, aspirants can practice real exam scenarios that mimic the actual OSCE structure within a specified time frame.
            </p>
            <p className="text-lg text-neutral-700">
              Our app is designed to give you the confidence and skills needed to excel in your Objective Structured Clinical Examinations.
            </p>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-6">Experience the MedHome OSCE App</h2>
              <p className="text-lg text-neutral-700 mb-6">
                Our OSCE Exam App provides a realistic simulation of the actual exam environment, helping you prepare effectively for your clinical assessments.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary mr-2">u2713</span>
                  <span>Available on iOS and Android devices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">u2713</span>
                  <span>Practice anytime, anywhere at your convenience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">u2713</span>
                  <span>Regular updates with new scenarios and cases</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 flex justify-center">
              {/* App mockup placeholder - replace with actual app screenshot */}
              <div className="bg-white p-4 rounded-3xl shadow-lg w-64 h-96">
                <div className="bg-neutral-200 rounded-2xl h-full flex items-center justify-center">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faMobileAlt} className="text-primary text-5xl mb-4" />
                    <p className="text-neutral-700 font-medium">MedHome OSCE App</p>
                    <p className="text-neutral-500 text-sm">App Screenshot</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">MedHome OSCE App Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {osceFeatures.map(feature => (
              <div key={feature.id} className="bg-neutral-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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

      {/* How It Works Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <span className="text-primary text-2xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Register and Download</h3>
                <p className="text-neutral-700">Create your account and download the MedHome OSCE App on your device.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <span className="text-primary text-2xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Select Your Specialty</h3>
                <p className="text-neutral-700">Choose your medical specialty and the specific OSCE exam you're preparing for.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <span className="text-primary text-2xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Practice OSCE Stations</h3>
                <p className="text-neutral-700">Experience realistic OSCE stations with virtual examiners and role players.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <span className="text-primary text-2xl font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Receive Detailed Feedback</h3>
                <p className="text-neutral-700">Get comprehensive feedback on your performance with specific improvement suggestions.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <a 
              href="#" 
              className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
            >
              Download App <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Demo Request Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Request a Demo</h2>
          <p className="text-center text-lg text-neutral-700 mb-8">
            Experience the MedHome OSCE App firsthand with a personalized demo
          </p>
          
          <div className="bg-neutral-100 p-8 rounded-lg shadow-md">
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
                  <label htmlFor="specialty" className="block text-neutral-700 mb-1">Medical Specialty</label>
                  <select 
                    id="specialty" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select your specialty</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Other">Other</option>
                  </select>
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

export default MedicOSCEAppPage;
