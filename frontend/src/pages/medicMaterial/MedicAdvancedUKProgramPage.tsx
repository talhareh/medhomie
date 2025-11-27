import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import MedicalAIBot from '../../components/common/MedicalAIBot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faClock,
  faArrowRight,
  faGraduationCap,
  faUserMd,
  faChalkboardTeacher,
  faLanguage,
  faHandshake,
  faMedal,
  faBriefcase,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicAdvancedUKProgramPage component - Advanced UK Membership/Fellowship Program page for MedHome
 * Based on the MedHome advanced UK membership fellowship program page but with MedHome branding and content
 */
const MedicAdvancedUKProgramPage: React.FC = () => {
  // Program courses data
  const programCourses = [
    {
      id: 1,
      title: "MRCOG Advanced UK Membership Program",
      duration: "24 months (customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200
    },
    {
      id: 2,
      title: "MRCP Advanced UK Membership Program",
      duration: "24 months (customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200
    },
    {
      id: 3,
      title: "MRCEM Advanced UK Membership Program",
      duration: "24 months (customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200
    },
    {
      id: 4,
      title: "MRCPCH Advanced UK Membership Program",
      duration: "24 months (customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200
    },
    {
      id: 5,
      title: "MRCS Advanced UK Membership Program",
      duration: "24 months (customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200
    },
    {
      id: 6,
      title: "FRCR Advanced UK Fellowship Program",
      duration: "24 months (customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200
    }
  ];

  // Program advantages
  const advantages = [
    {
      id: 1,
      title: "Comprehensive Exam Preparation",
      description: "A structured, personalized course plan that covers every exam detail, ensuring you feel confident and ready to excel.",
      icon: faGraduationCap
    },
    {
      id: 2,
      title: "One-on-One Expert Mentorship",
      description: "Receive expert guidance for exam planning, booking, and personalized support to clear doubts and strengthen your concepts.",
      icon: faChalkboardTeacher
    },
    {
      id: 3,
      title: "Complimentary OET Course",
      description: "Build your language skills with a free OET course, preparing you for effective communication in global healthcare.",
      icon: faLanguage
    },
    {
      id: 4,
      title: "Dedicated Relationship Manager",
      description: "A dedicated relationship manager ensures smooth coordination with your mentors and the MedHome team, supporting you throughout your journey.",
      icon: faHandshake
    },
    {
      id: 5,
      title: "Scholarship Rewards for Achievers",
      description: "Pass all three parts of your exam on the first attempt and earn up to a full fee refund as a reward for your success.",
      icon: faMedal
    },
    {
      id: 6,
      title: "Global Placement Assistance",
      description: "Benefit from comprehensive placement support post-certification, backed by a proven track record of placing candidates in top roles.",
      icon: faBriefcase
    }
  ];

  // FAQ data
  const faqs = [
    {
      id: 1,
      question: "What is the MedHome Advanced UK Membership/Fellowship Program?",
      answer: "The MedHome Advanced UK Membership/Fellowship Program is an all-inclusive academic and career advancement program tailored for doctors aspiring to excel in prestigious Royal College Membership exams like MRCOG, MRCP, MRCS, MRCEM, MRCPCH, and FRCR."
    },
    {
      id: 2,
      question: "Which specializations are covered under this program?",
      answer: "The program covers preparation for: MRCOG (Membership of the Royal College of Obstetricians and Gynaecologists), MRCP (Membership of the Royal College of Physicians), MRCS (Membership of the Royal College of Surgeons), MRCEM (Membership of the Royal College of Emergency Medicine), MRCPCH (Membership of the Royal College of Paediatrics and Child Health), and FRCR (Fellowship of the Royal College of Radiologists)."
    },
    {
      id: 3,
      question: "What are the eligibility criteria for enrolling in the MedHome Advanced UK Membership/Fellowship Program?",
      answer: "To enroll in the program, candidates must: Have completed their MBBS and internship or an equivalent qualification in medicine, and have valid registration with the Medical Council of India (MCI) or a State Medical Council."
    },
    {
      id: 4,
      question: "Is the program suitable for international candidates?",
      answer: "Yes, this program is designed to cater to doctors worldwide, including those from the United Kingdom, Ireland, Australia, India, Canada, Singapore, Hong Kong, Malaysia, South Africa, the Middle East (UAE, Saudi Arabia, Qatar, etc.), and other Commonwealth nations. It offers online resources, live sessions, and comprehensive support accessible from anywhere."
    },
    {
      id: 5,
      question: "Are there any scholarship opportunities available?",
      answer: "Yes, the program offers up to 100% scholarship opportunities based on specific eligibility criteria, such as clearing all exam parts in a single attempt within the defined timeframe. Scholarship percentages vary based on the chosen course."
    },
    {
      id: 6,
      question: "Does the program include any live circuit courses?",
      answer: "For the 36 months plan (Platinum Plan), the program offers complimentary 2-day live circuit course onsite in India, providing practical exposure and hands-on experience to prepare for clinical assessments."
    },
    {
      id: 7,
      question: "Is this program aligned with Royal College exam standards?",
      answer: "Yes, the program is meticulously aligned with the latest exam formats and standards of the Royal Colleges in the UK. It ensures candidates are fully prepared for all stages of the membership and fellowship exams."
    },
    {
      id: 8,
      question: "What makes the MedHome Advanced UK Membership/Fellowship Program different from other medical education platforms?",
      answer: "Comprehensive coverage for Royal College exams, unlimited access to all courses, batches, and resources, expert mentorship support, complimentary OET course, regular progress tracking and bi-weekly feedback, dedicated relationship manager, exclusive placement assistance, and complimentary one-year fellowship."
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Advanced UK Membership/Fellowship Program</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Your premium, all-in-one package for mastering globally recognized medical certifications
          </p>
          <button className="bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-neutral-100 transition-colors">
            Enquire Now
          </button>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-neutral-700 mb-6">
              Welcome to MedHome Advanced UK Membership/Fellowship Program – your premium, all-in-one package for mastering globally recognized medical certifications. With expert mentorship, flexible learning plans, and comprehensive resources, we're here to guide your journey to success in healthcare.
            </p>
            <p className="text-lg text-neutral-700">
              MedHome is your trusted partner in post-MBBS medical education. Our wide range of online courses is designed to meet the evolving needs of modern healthcare professionals, helping you elevate your expertise and take the next step in your career.
            </p>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">The MedHome Advantage</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map(advantage => (
              <div key={advantage.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={advantage.icon} className="text-primary text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold">{advantage.title}</h3>
                </div>
                <p className="text-neutral-700">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programCourses.map(course => (
              <div key={course.id} className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {/* Image placeholder - replace with actual images */}
                <div 
                  className="bg-primary/10 flex items-center justify-center"
                  style={{ height: course.imageHeight }}
                >
                  <h3 className="text-primary text-xl font-bold">{course.title}</h3>
                  <span className="sr-only">{course.title} Image</span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-neutral-500 mr-2" />
                    <p className="text-neutral-700">
                      <span className="font-medium">Starts on:</span> {course.startDate}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button className="text-primary font-semibold hover:underline">
                      Enquire Now
                    </button>
                    <a 
                      href={course.viewCourseUrl} 
                      className="inline-flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                    >
                      View Course <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Section */}
      {/* <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Make an Enquiry</h2>
          <p className="text-center text-lg text-neutral-700 mb-8">Fill out the form to connect with a program expert</p>
          
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
                  <label htmlFor="program" className="block text-neutral-700 mb-1">Program of Interest</label>
                  <select 
                    id="program" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a program</option>
                    {programCourses.map(course => (
                      <option key={course.id} value={course.title}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="qualification" className="block text-neutral-700 mb-1">Qualification</label>
                <select 
                  id="qualification" 
                  className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Please choose an option</option>
                  <option value="MBBS">MBBS</option>
                  <option value="PG">PG (MD/MS/DNB/Diploma/etc)</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-neutral-700 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any specific questions or requirements"
                ></textarea>
              </div>
              <button 
                type="button" 
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map(faq => (
              <div key={faq.id} className="bg-neutral-100 p-6 rounded-lg">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faQuestionCircle} className="text-primary mt-1 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                    <p className="text-neutral-700">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-primary/10 p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-6">Scholarship Program</h2>
            <p className="text-lg text-neutral-700 mb-8">
              MedHome offers scholarships for deserving candidates to join our Advanced UK Membership/Fellowship programs. Scholarships are awarded based on academic merit, financial need, and commitment to the medical profession.
            </p>
            <a 
              href="/medicScholarship" 
              className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
            >
              Learn More About Scholarships <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MedicFooter />
      {/* <MedicalAIBot /> */}
    </div>
  );
};

export default MedicAdvancedUKProgramPage;
