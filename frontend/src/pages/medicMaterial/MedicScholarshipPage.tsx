import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle,
  faGraduationCap,
  faHandHoldingHeart,
  faAward,
  faBook,
  faUserGraduate,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicScholarshipPage component - Scholarship page for MedHome
 * Based on the StudyMedic scholarship page but with MedHome branding and content
 */
const MedicScholarshipPage: React.FC = () => {
  // Eligibility criteria
  const eligibilityCriteria = [
    "Completing the Scholarship application form.",
    "Justification on 'Why they require this scholarship'.",
    "Any Major/Minor contribution given to Field of Medical science or the government.",
    "Any Major/Minor medical events organized or being part of within your region/community.",
    "Participation in any Social Service programs initiated by the government.",
    "Any other Specific considerable reasons.",
    "Applicants shall provide an Eligibility form/completion certificate approved by the college or university or shall complete the required qualification courses (Proof shall be submitted when required).",
    "Applicant shall be working in the field of course which he/she selects.",
    "Any extra ordinary academic performance.",
    "Previous work Experience (Preferences for rural working areas, Govt Charity projects, NGO's etc.)"
  ];

  // Scholarship benefits
  const scholarshipBenefits = [
    "Selected candidates can join any one of our selected (by candidate) course for Free.",
    "Selected candidates can access our Course Library for Free.",
    "Selected candidate can choose the required course.",
    "Selected candidates can access our private study Group for Free.",
    "Selected candidates can request for a reduction in course fees (One specific course).",
    "Selected candidates can choose /request our course library subscription addons for free (One add On Only).",
    "Selected candidates can request for free subscription to MedHome exclusives such as One on One Session."
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      text: "Dear Colleagues, I am writing to share my experience with MedHome EBCOG-1. The mentors are knowledgeable & excellent in their approach towards coaching for this exam. The online platform is intuitive, easy to use, and fabulous. They are always there to assist, help & solve any query that the candidate has, including solving online glitches promptly. The overall experience of the One Month Crash Course and the Two-Day College Course was impressive. I wholeheartedly recommend MedHome for this competitive exam.",
      author: "Dr. Michael",
      role: ""
    },
    {
      id: 2,
      text: "I have cleared my EBCOG PART 1 September 2024. I had enrolled in 1 month StudyEFOG course from MedHome. About the course, First, the mentors-each one is a gem. They push you to stay on track and guide you in the right approach to preparing for the exam. Second, the study materials are curated to perfection. You will find yourself revising the core EBCOG books as you solve the question banks. Third, the revision resources are incredibly valuable. The presentations from the classes, available in PDF format are one of the best resources. The guidance, resources, and support provided will definitely make your entire journey towards part 1 EBCOG much easier.",
      author: "Dr. Samantha K",
      role: ""
    },
    {
      id: 3,
      text: "I am grateful to Dr. Sophia and her team at MedHome for providing me with an excellent platform that enabled me to successfully clear my part 1 EBCOG exam. It would not have been possible without their assistance. Thank you.",
      author: "Dr. James S",
      role: ""
    },
    {
      id: 4,
      text: "I completely prepared for the exam with the sessions from MedHome. The revision classes were very good as it provided information on the minute details that were to be taken care of. Thank you so much team MedHome.",
      author: "Dr. Sarah P",
      role: ""
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">MedHome Scholarship</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">Fuelling Dreams</p>
          <div className="inline-block bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-neutral-100 transition-colors">
            Apply Now
          </div>
        </div>
      </section>

      {/* About Scholarship Program */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">About Scholarship Program</h2>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start mb-8">
              <div className="mr-4 mt-1">
                <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-3xl" />
              </div>
              <p className="text-lg text-neutral-700">
                MedHome aims to guide professionals through advanced training platforms enhanced with technology, facilitated by expert mentors. Our MedHome Scholarship programs cater to professionals aspiring for specialization in medical fields such as MRCOG, MRCPI, FCPS, MRCP, FRCR, MRCS, FRCS, EFOG-EBCOG, MRCPCH, MRCEM, PLAB, OET, FMGE, NEETSS, MD, MS, DNB, and DGO etc.
              </p>
            </div>
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-primary text-3xl" />
              </div>
              <p className="text-lg text-neutral-700">
                We believe in extending a helping hand to those who need it the most, fostering positive change and career excellence. Our scholarship program is designed to support talented medical professionals who demonstrate exceptional potential but may face financial constraints in pursuing advanced education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Criteria */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Eligibility Criteria</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-neutral-700 mb-8">
              Eligible candidates shall be chosen by MedHome Scholarship panel based on the applicant's eligibility in demonstrating/furnishing the below details:
            </p>
            <ul className="space-y-4">
              {eligibilityCriteria.map((criterion, index) => (
                <li key={index} className="flex items-start">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-primary mr-3 mt-1" />
                  <span className="text-neutral-700">{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Scholarship Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Scholarship Benefits</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-neutral-100 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faAward} className="text-primary text-2xl mr-3" />
                  <h3 className="text-xl font-semibold">Free Course Access</h3>
                </div>
                <p className="text-neutral-700">
                  Selected candidates can join any one of our courses for free and access our comprehensive Course Library.
                </p>
              </div>
              
              <div className="bg-neutral-100 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faBook} className="text-primary text-2xl mr-3" />
                  <h3 className="text-xl font-semibold">Study Resources</h3>
                </div>
                <p className="text-neutral-700">
                  Access to private study groups and exclusive learning materials to enhance your educational experience.
                </p>
              </div>
              
              <div className="bg-neutral-100 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-primary text-2xl mr-3" />
                  <h3 className="text-xl font-semibold">Personalized Learning</h3>
                </div>
                <p className="text-neutral-700">
                  Request for free subscription to MedHome exclusives such as One-on-One Sessions with expert mentors.
                </p>
              </div>
              
              <div className="bg-neutral-100 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faUsers} className="text-primary text-2xl mr-3" />
                  <h3 className="text-xl font-semibold">Reduced Fees</h3>
                </div>
                <p className="text-neutral-700">
                  Selected candidates can request for a reduction in course fees or choose free library subscription add-ons.
                </p>
              </div>
            </div>
            
            <div className="bg-primary/10 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-primary mb-4">MedHome Scholarship Program</h3>
              <p className="text-neutral-700 mb-4">
                Students entitled for this scholarship can avail a complete course (Mutually agreed by Student & MedHome) with free access to our course library. Library Access shall only be valid during the course duration.
              </p>
              <p className="text-neutral-700 mb-4">
                Eligibility criteria shall be fulfilled as mentioned above.
              </p>
              <div className="text-center mt-6">
                <button className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Students Say</h2>
          <p className="text-center mb-12">Listen to the words of our proud champions!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-neutral-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-primary">{testimonial.author}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors">
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Apply Now CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Apply?</h2>
          <p className="text-lg text-neutral-700 mb-8">
            Take the first step towards advancing your medical career with the support of our scholarship program. Applications are reviewed on a rolling basis.
          </p>
          <button className="bg-primary text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-primary/90 transition-colors">
            Apply for Scholarship
          </button>
        </div>
      </section>

      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicScholarshipPage;
