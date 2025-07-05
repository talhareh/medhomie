import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faClock,
  faArrowRight,
  faStethoscope,
  faUserMd,
  faHospital,
  faGraduationCap,
  faHeartbeat,
  faBrain,
  faXRay
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicClinicalProgramsPage component - Clinical Programs page for MedHome
 * Based on the StudyMedic clinical programs page but with MedHome branding and content
 */
const MedicClinicalProgramsPage: React.FC = () => {
  // Clinical programs data
  const clinicalPrograms = [
    {
      id: 1,
      title: "MRCOG Clinical Training Program",
      duration: "24 Months (Customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      icon: faStethoscope,
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200,
      description: "Our MRCOG Clinical Training Program provides comprehensive hands-on training and clinical experience to help you excel in the Royal College of Obstetricians and Gynaecologists membership exams. The program includes rotations in various subspecialties of obstetrics and gynecology, supervised by experienced consultants."
    },
    {
      id: 2,
      title: "MRCP Clinical Training Program",
      duration: "24 Months (Customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      icon: faHeartbeat,
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200,
      description: "The MRCP Clinical Training Program is designed to provide comprehensive clinical experience in internal medicine. The program covers all major subspecialties required for the MRCP examination, with rotations in cardiology, gastroenterology, respiratory medicine, endocrinology, and more."
    },
    {
      id: 3,
      title: "MRCEM Clinical Training Program",
      duration: "24 Months (Customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      icon: faUserMd,
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200,
      description: "Our MRCEM Clinical Training Program offers extensive experience in emergency medicine, preparing you for the Membership of the Royal College of Emergency Medicine examinations. The program includes rotations in trauma management, critical care, pediatric emergencies, and more."
    },
    {
      id: 4,
      title: "MRCPCH Clinical Training Program",
      duration: "24 Months (Customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      icon: faHospital,
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200,
      description: "The MRCPCH Clinical Training Program provides comprehensive pediatric training across various subspecialties. The program is designed to prepare candidates for the Membership of the Royal College of Paediatrics and Child Health examinations while providing valuable clinical experience."
    },
    {
      id: 5,
      title: "MRCS Clinical Training Program",
      duration: "24 Months (Customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      icon: faBrain,
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200,
      description: "Our MRCS Clinical Training Program offers comprehensive surgical training across various specialties. The program is designed to prepare candidates for the Membership of the Royal College of Surgeons examinations while providing extensive hands-on surgical experience."
    },
    {
      id: 6,
      title: "FRCR Clinical Training Program",
      duration: "24 Months (Customizable)",
      startDate: "May 1, 2025",
      viewCourseUrl: "#",
      icon: faXRay,
      imageUrl: "", // Placeholder for image
      imageWidth: 300,
      imageHeight: 200,
      description: "The FRCR Clinical Training Program provides comprehensive training in clinical radiology. The program covers all imaging modalities and clinical applications required for the Fellowship of the Royal College of Radiologists examinations."
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Clinical Programs</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Advanced Clinical Training Programs for Medical Professionals
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-5xl" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Two Years Advanced Clinical Training Programs</h2>
            <p className="text-lg text-neutral-700 mb-6">
              MedHome offers comprehensive clinical training programs designed to provide hands-on experience and prepare medical professionals for Royal College membership and fellowship examinations. Our programs combine clinical rotations with structured teaching and exam preparation.
            </p>
            <p className="text-lg text-neutral-700">
              Each program is customizable to meet individual needs and career goals, with placements in leading hospitals and medical institutions across our global network.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinicalPrograms.map(program => (
              <div key={program.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {/* Image placeholder - replace with actual images */}
                <div 
                  className="bg-primary/10 flex items-center justify-center"
                  style={{ height: program.imageHeight }}
                >
                  <FontAwesomeIcon icon={program.icon} className="text-primary text-5xl" />
                  <span className="sr-only">{program.title} Image</span>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-primary">{program.title}</h3>
                  
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-neutral-500 mr-2" />
                    <p className="text-neutral-700">
                      <span className="font-medium">Starts on:</span> {program.startDate}
                    </p>
                  </div>
                  
                  <p className="text-neutral-700 mb-6">{program.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <button className="text-primary font-semibold hover:underline">
                      Enquire Now
                    </button>
                    <a 
                      href={program.viewCourseUrl} 
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

      {/* Program Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Program Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-primary">Clinical Experience</h3>
              <p className="text-neutral-700">
                Gain hands-on clinical experience in leading hospitals under the supervision of experienced consultants. Our programs provide exposure to a wide range of cases and clinical scenarios.
              </p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-primary">Exam Preparation</h3>
              <p className="text-neutral-700">
                Our programs include structured teaching sessions, mock exams, and personalized guidance to help you prepare for Royal College membership and fellowship examinations.
              </p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-primary">Career Advancement</h3>
              <p className="text-neutral-700">
                The clinical experience and qualifications gained through our programs open doors to career opportunities in prestigious institutions worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Interested in Our Clinical Programs?</h2>
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
                    {clinicalPrograms.map(program => (
                      <option key={program.id} value={program.title}>{program.title}</option>
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
      </section>

      {/* Scholarship Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-primary/10 p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-6">Scholarship Program</h2>
            <p className="text-lg text-neutral-700 mb-8">
              MedHome offers scholarships for deserving candidates to join our clinical training programs. Scholarships are awarded based on academic merit, financial need, and commitment to the medical profession.
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
    </div>
  );
};

export default MedicClinicalProgramsPage;
