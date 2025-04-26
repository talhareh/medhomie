import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronRight, 
  faChevronLeft, 
  faMobileScreen, 
  faLaptop, 
  faGraduationCap, 
  faIdCard,
  faPhone,
  faEnvelope,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';

/**
 * MedicHomePage component - Clone of StudyMedic homepage
 * This is a standalone component that mimics the layout and functionality
 * of the StudyMedic homepage but uses MedHome branding and colors.
 */
const MedicHomePage: React.FC = () => {
  // State for testimonial carousel
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('text');
  
  // Testimonial data - exact from StudyMedic
  const testimonials = [
    {
      id: 1,
      text: "Dear Colleagues, This is Dr Yogesh. I am writing to share my experience with StudyMEDIC EBCOG-1. The mentors are knowledgeable & excellent in their approach towards coaching for this exam. The online platform is intuitive, easy to use, and fabulous. They are the official coaching centre for EBCOG exam. They are always there to assist, help & solve any query that the candidate has, including solving online glitches promptly. The overall experience of the One Month Crash Course and the Two-Day College Course was impressive. I wholeheartedly recommend Study-Medic for this competitive exam. Thank you, Study-Medic",
      author: "Dr. Yogesh",
      role: ""
    },
    {
      id: 2,
      text: "I have cleared my EBCOG PART 1 September 2024. I had enrolled in 1 month StudyEFOG course from study medic. About the course, First, the mentors-each one is a gem. They push you to stay on track and guide you in the right approach to preparing for the exam. Second, the study materials are curated to perfection. You will find yourself revising the core EBCOG books as you solve the question banks. Third, the revision resources are incredibly valuable. The presentations from the classes, available in PDF format are one of the best resources The guidance, resources, and support provided by Study EBCOG will definitely make your entire journey towards part 1 EBCOG much easier. First and foremost, I want to express my deepest gratitude to the Almighty for this success. I would like to extend my heartfelt thanks to the entire StudyMEDIC team, particularly Dr. Sowmya, Dr. Chitra, and Dr. Preethi, for your unwavering support, expert guidance, and encouragement throughout this journey. The IT team is really great, supporting in all aspects of technical issues even at odd times, the study materials are curated very precisely for easy revision, Thank you StudyMEDIC.",
      author: "Dr. Ashika KM",
      role: ""
    },
    {
      id: 3,
      text: "I am grateful to Dr. Sowmya and her team at StudyMEDIC for providing me with an excellent platform that enabled me to successfully clear my part 1 EBCOG exam. It would not have been possible without their assistance. Thank you.",
      author: "Dr. Ujjwala Sameer",
      role: ""
    }
  ];

  // Course data - exact from StudyMedic
  const courses = [
    { id: 1, title: "Royal College Membership in Obstetrics and Gynaecology", shortName: "MRCOG", url: "#" },
    { id: 2, title: "Royal College Membership in Surgery", shortName: "MRCS", url: "#" },
    { id: 3, title: "Royal College Membership in Emergency Medicine", shortName: "MRCEM", url: "#" },
    { id: 4, title: "Royal College Membership in Pediatrics and child health", shortName: "MRCPCH", url: "#" },
    { id: 5, title: "Royal College Fellowship in Radiology", shortName: "FRCR", url: "#" },
    { id: 6, title: "Royal College Fellowship in Surgery", shortName: "FRCS", url: "#" },
    { id: 7, title: "Royal College Membership in Internal Medicine", shortName: "MRCP", url: "#" },
    { id: 8, title: "Foreign Medical Graduate Examination", shortName: "FMGE", url: "#" },
    { id: 9, title: "Professional and Linguistic Assessments Board Test", shortName: "PLAB", url: "#" },
    { id: 10, title: "United States Medical Licensing Examination", shortName: "USMLE", url: "#" },
    { id: 11, title: "ISUOG Approved Courses for ULTRASOUND", shortName: "ULTRASOUND", url: "#" },
    { id: 12, title: "High-Risks in Obstetrics", shortName: "HRO", url: "#" },
    { id: 13, title: "VAGINAL SURGERY", shortName: "VAGINAL SURGERY", url: "#" },
    { id: 14, title: "Reproductive Medicine", shortName: "REPRO", url: "#" },
    { id: 15, title: "Occupational English Test", shortName: "OET", url: "#" },
    { id: 16, title: "MS/MD/DNB Entrance Exams in Obstetrics and Gynaecology", shortName: "MS/MD/DNB", url: "#" },
    { id: 17, title: "European Board Membership in Obstetrics and Gynaecology", shortName: "EFOG – EBCOG", url: "#" },
    { id: 18, title: "Royal College of Physicians of Ireland Membership in Obstetrics and Gynaecology", shortName: "MRCPI OBG", url: "#" },
    { id: 19, title: "Fellowship of the College of Physicians and Surgeons", shortName: "FCPS OBG", url: "#" },
    { id: 20, title: "National Eligibility cum Entrance Test for Super Speciality /Postgraduate Entrance Exams in OBG", shortName: "NEET SS / INI SS / FET", url: "#" },
    { id: 21, title: "Bachelor of Medicine and Bachelor of Surgery", shortName: "MBBS", url: "#" }
  ];

  // Programs data - exact from StudyMedic
  const programs = [
    {
      id: 1,
      title: "StudyMEDIC Two Years Advanced Clinical Training Program",
      description: "Welcome to StudyMEDIC Advanced Clinical Training Program- Your perfect path for the UK medical career. By partnering with premier super-specialty hospitals, StudyMEDIC provides hands-on clinical training for medical aspirants preparing for esteemed Royal College Memberships and Fellowships.",
      url: "#"
    },
    {
      id: 2,
      title: "Clinical Fellowships integrated with Royal College Memberships",
      description: "Clinical Fellowships integrated with Royal College Memberships are advanced two-year training programs designed for MBBS graduates. These hospital-based programs provide comprehensive coaching and hands-on experience to hone expertise in a chosen medical specialty.",
      url: "#"
    },
    {
      id: 3,
      title: "Live Circuit Courses",
      description: "StudyMEDIC offers both one-day and two-day live circuit courses for medical aspirants preparing for their final round of OSCE examination. Here, aspirants get an opportunity to practice their clinical skills and communication abilities in a real-like exam format, thereby helping them to achieve their dream medical membership or fellowship in one go.",
      url: "#"
    }
  ];

  // Handle testimonial navigation
  const nextTestimonial = () => {
    setActiveTestimonialIndex((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setActiveTestimonialIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">The Pioneer in Medical Education</h1>
              <p className="text-xl mb-6">
                Comprehensive medical education courses to help medical graduates succeed in membership, fellowship, and entrance exams.
              </p>
              <div className="flex space-x-4">
                <Link to="/courses" className="bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-neutral-100">
                  Explore Courses
                </Link>
                <a href="#programs" className="border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10">
                  Our Programs
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <div 
                className="rounded-lg shadow-lg w-full h-64 md:h-80 bg-primary/80 flex items-center justify-center text-white text-xl font-semibold"
              >
                Medical Education Excellence
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Welcome To MedHome</h2>
          <p className="text-lg text-neutral-700 text-center max-w-4xl mx-auto mb-12">
            MedHome, an internationally reputed Med-EdTech firm, headquartered in Qatar offers diverse courses for medical aspirants 
            specializing in Royal College memberships, fellowships, skill enhancement, medical entrances, 
            and licensing exams. Upskill yourself with the best guidance from experts around the globe.
          </p>
          
          <h2 className="text-3xl font-bold text-center mb-8">Fast-track Your Medical Career Our Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 8).map(course => (
              <div key={course.id} className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-primary">{course.shortName}</h3>
                  <p className="text-neutral-700 mb-4">{course.title}</p>
                  <a href={course.url} className="text-primary font-semibold flex items-center">
                    Learn More <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {courses.slice(8, 16).map(course => (
              <div key={course.id} className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-primary">{course.shortName}</h3>
                  <p className="text-neutral-700 mb-4">{course.title}</p>
                  <a href={course.url} className="text-primary font-semibold flex items-center">
                    Learn More <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {courses.slice(16).map(course => (
              <div key={course.id} className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-primary">{course.shortName}</h3>
                  <p className="text-neutral-700 mb-4">{course.title}</p>
                  <a href={course.url} className="text-primary font-semibold flex items-center">
                    Learn More <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Signature Programs</h2>
          <p className="text-lg text-neutral-700 text-center max-w-4xl mx-auto mb-12">
            MedHome provides Clinical fellowships, Clinical Training and Live Courses programs 
            for medical aspirants aiming to upskill them to achieve their dream Royal College 
            Memberships & Fellowships.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map(program => (
              <div key={program.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary">{program.title}</h3>
                  <p className="text-neutral-700 mb-4">{program.description}</p>
                  <a href={program.url} className="text-primary font-semibold flex items-center">
                    Know more <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Makes MedHome Unique?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faMobileScreen} className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Learning App</h3>
              <p className="text-neutral-700">
                Learn anytime, anywhere with our comprehensive mobile app
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faLaptop} className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Learning Management System</h3>
              <p className="text-neutral-700">
                Access exclusive medical courses and related course products
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">OSCE App</h3>
              <p className="text-neutral-700">
                Practice real exam scenarios that mimic the real OSCE structure
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faIdCard} className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">E-PORTFOLIO</h3>
              <p className="text-neutral-700">
                Manage your learning, track progress, and showcase achievements
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">MedHome Mobile Learning App</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-neutral-700 text-center mb-6">
                A comprehensive medical education learning app, available on both Android and iOS devices, providing an amazing opportunity to learn anytime, anywhere.
              </p>
              <div className="text-center">
                <a href="#" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90">
                  Know More
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Learning Management System</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-neutral-700 text-center mb-6">
                With access to exclusive medical courses and related course products, Learning Management System, empowers aspirants to build their dream medical career.
              </p>
              <div className="text-center">
                <a href="#" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90">
                  Know More
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">MedHome OSCE App</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-neutral-700 text-center mb-6">
                MedHome provides a unique learning opportunity through the MedHome OSCE App. Here, aspirants can practice real exam scenarios that mimic the real OSCE structure within a specified time frame.
              </p>
              <div className="text-center">
                <a href="#" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90">
                  Know More
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">MedHome E-PORTFOLIO</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-neutral-700 text-center mb-6">
                MedHome E-Portfolio is a unique space, where aspirants can manage their learning, track their progress, and showcase their achievements. Connect with MedHome, design your e-portfolio and uplift your medical career.
              </p>
              <div className="text-center">
                <a href="#" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90">
                  Know More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">What Our Students Say</h2>
          <p className="text-center mb-12">Listen to the words of our proud champions!</p>
          
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('text')}
                className={`px-4 py-2 rounded ${activeTab === 'text' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
              >
                Text
              </button>
              <button 
                onClick={() => setActiveTab('audio')}
                className={`px-4 py-2 rounded ${activeTab === 'audio' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
              >
                Audio
              </button>
              <button 
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded ${activeTab === 'video' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
              >
                Video
              </button>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <p className="text-lg text-neutral-700">
                  {testimonials[activeTestimonialIndex].text}
                </p>
              </div>
              <div>
                <p className="font-semibold text-primary">{testimonials[activeTestimonialIndex].author}</p>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={prevTestimonial}
                className="bg-white text-primary p-3 rounded-full shadow hover:bg-primary hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button 
                onClick={nextTestimonial}
                className="bg-white text-primary p-3 rounded-full shadow hover:bg-primary hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveTestimonialIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === activeTestimonialIndex ? 'bg-primary' : 'bg-neutral-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a href="#" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90">
              View All
            </a>
          </div>
        </div>
      </section>
      
      {/* Webinars Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Upcoming Free Webinars</h2>
          <div className="max-w-3xl mx-auto bg-neutral-100 p-8 rounded-lg text-center">
            <p className="text-lg text-neutral-700">No events scheduled at the moment.</p>
            <div className="mt-6 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <a href="#" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90">
                View All
              </a>
              <a href="#" className="inline-block bg-white border border-neutral-300 text-neutral-700 px-6 py-3 rounded-md font-semibold hover:bg-neutral-100">
                Contact Us
              </a>
              <a href="#" className="inline-block bg-green-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-600">
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Request for Demo</h2>
              <form className="space-y-4">
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
                <div>
                  <label htmlFor="phone" className="block text-neutral-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-neutral-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tell us what you're interested in"
                  ></textarea>
                </div>
                <button 
                  type="button" 
                  className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90"
                >
                  Submit Request
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">Signup for Newsletters</h2>
              <p className="text-neutral-700 mb-6">
                Subscribe to MedHome Newsletters & stay informed about our latest courses, 
                programs, and medical education updates.
              </p>
              <div className="flex mb-8">
                <input 
                  type="email" 
                  className="flex-grow p-3 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your email address"
                />
                <button 
                  type="button" 
                  className="bg-primary text-white px-6 py-3 rounded-r-md font-semibold hover:bg-primary/90"
                >
                  Subscribe
                </button>
              </div>
              
              <h3 className="text-xl font-bold mb-4">OFFICES</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-2">MedHome LLC - Qatar</h4>
                  <p className="text-neutral-700">
                    Office No. 3, First Floor, Regus Business Center, Al Jaidah Square, No. 63, Doha, Qatar
                  </p>
                  <p className="text-neutral-700 mt-2">+974 7108 8181</p>
                  <p className="text-neutral-700">+44 7341 981 539</p>
                  <p className="text-neutral-700 mt-2">
                    <a href="mailto:info@medhome.com" className="text-primary hover:underline">
                      info@medhome.com
                    </a>
                  </p>
                  <p className="mt-2">
                    <a href="#" className="text-primary hover:underline">
                      Location Map
                    </a>
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-2">MedHome Academy - India 📌 Bengaluru</h4>
                  <p className="text-neutral-700">
                    MedHome Academy<br />
                    Groundfloor, Novel Business Park, 57 13th Cross, Baldwins Road, Koramangala, Bengaluru, Karnataka – 560030
                  </p>
                  <p className="text-neutral-700 mt-2">+91 8562 800 700</p>
                  <p className="text-neutral-700">+44 7341 981 539</p>
                  <p className="text-neutral-700 mt-2">
                    <a href="mailto:info@medhome.com" className="text-primary hover:underline">
                      info@medhome.com
                    </a>
                  </p>
                  <p className="mt-2">
                    <a href="#" className="text-primary hover:underline">
                      Location Map
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicHomePage;
