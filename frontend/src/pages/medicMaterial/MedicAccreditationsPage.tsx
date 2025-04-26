import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAward,
  faGlobe,
  faGraduationCap,
  faHandshake,
  faArrowRight,
  faStar
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicAccreditationsPage component - Accreditations page for MedHome
 * Based on the StudyMedic accreditations page but with MedHome branding and content
 */
const MedicAccreditationsPage: React.FC = () => {
  // Accreditations data
  const accreditations = [
    {
      id: 1,
      title: "BAC Accreditation",
      description: "The British Accreditation Council (BAC) is a globally recognized accrediting body dedicated to ensuring quality in education. By providing accreditation to a wide range of educational institutions, including universities, colleges, and training organizations, BAC promotes excellence & quality assurance in education. The BAC accreditation that MedHome holds as an online, distance, and blended learning provider is a testament to our commitment, proving once again that we are the best in global medical education.",
      learnMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 150
    },
    {
      id: 2,
      title: "CPD Excellence",
      description: "The Continuing Professional Development (CPD) accreditation highlights our dedication to ongoing learning. CPD involves tracking and documenting the skills, knowledge, and experience you gain beyond initial training. This lifelong learning process helps professionals stay current with industry trends, meet evolving requirements, and achieve career goals. Our CPD accreditation ensures that our courses adhere to the highest standards of continuous development.",
      learnMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 150
    },
    {
      id: 3,
      title: "ACTD Recognition",
      description: "The American Council of Training and Development (ACTD) accreditation is a prestigious recognition awarded to organisations excelling in training program design, implementation, and evaluation. This rigorous evaluation process ensures that an organisation adheres to best practices and delivers high-quality learning experiences that adapt to the evolving needs of the workforce. Our ACTD accreditation reflects our dedication to providing top-notch education and supporting your professional growth.",
      learnMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 150
    },
    {
      id: 4,
      title: "IAO Prestige",
      description: "We are honoured to hold the accreditation from the International Accreditation Organization (IAO), a globally recognised mark of excellence that signifies our commitment to outstanding educational standards. IAO's comprehensive assessment process ensures that our programs meet international quality benchmarks, enhancing our global reputation and credibility. This accreditation supports superior learning outcomes, provides valuable resources, and encourages ongoing improvement, reaffirming our dedication to delivering top-notch education and training.",
      learnMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 150
    },
    {
      id: 5,
      title: "AAA Distinction",
      description: "Being accredited by the American Accreditation Organization (AAA) highlights our dedication to providing outstanding educational experiences. AAA is renowned for its rigorous standards and detailed assessment process, which ensures our programs consistently meet and surpass quality expectations. This accreditation underscores our commitment to excellence and our ability to adapt to the evolving needs of students and professionals.",
      learnMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 150
    },
    {
      id: 6,
      title: "RCSEd Accreditation",
      description: "MedMRCS, a sister concern of MedHome, offers a 6-week course accredited by the Royal College of Surgeons of Edinburgh. This prestigious accreditation ensures the course meets the highest standards in preparation for the MRCS exams. With RCSEd's accreditation, participants can trust that the program is globally recognised for its quality and professional relevance.",
      learnMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 150
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">MedHome: Accredited, Trusted Excellence</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Delivering quality medical education with globally recognized accreditations
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">MedHome's Prestigious Accreditations</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-neutral-700 mb-6">
              Accreditations certify that an institution adheres to stringent national and international standards established by authoritative bodies, ensuring that the training provided is relevant, comprehensive, and globally recognised. MedHome, a leading and trusted name in premier medical education, is proud to hold accreditations from esteemed organisations such as BAC, CPD, ACTD, IAO, AAA and more.
            </p>
            <p className="text-lg text-neutral-700 mb-6">
              These endorsements guarantee that our programs are up-to-date with the latest advancements in medicine and support your professional development. Opting for accredited programs not only deepens your expertise but also enhances your professional reputation and broadens your global career prospects.
            </p>
          </div>
        </div>
      </section>

      {/* Accreditations Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          {accreditations.map((accreditation, index) => (
            <div key={accreditation.id} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} mb-16 last:mb-0`}>
              <div className={`md:w-1/3 mb-8 md:mb-0 ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'} flex justify-center`}>
                {/* Image placeholder - replace with actual images */}
                <div 
                  className="bg-white border border-neutral-200 rounded-lg shadow-md flex items-center justify-center"
                  style={{ width: accreditation.imageWidth, height: accreditation.imageHeight }}
                >
                  <FontAwesomeIcon icon={faAward} className="text-primary text-5xl" />
                  <span className="sr-only">{accreditation.title} Logo</span>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold text-primary mb-4">{accreditation.title}</h3>
                <p className="text-neutral-700 mb-6">{accreditation.description}</p>
                <a 
                  href={accreditation.learnMoreUrl} 
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  Know More <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Future Accreditations Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Prestige on the Horizon</h2>
          <div className="max-w-4xl mx-auto bg-primary/10 p-8 rounded-lg">
            <div className="flex items-start mb-6">
              <div className="mr-4 mt-1">
                <FontAwesomeIcon icon={faStar} className="text-primary text-2xl" />
              </div>
              <p className="text-lg text-neutral-700">
                We are actively pursuing accreditation from various national and international medical associations and forums. These upcoming recognitions will further strengthen the value we provide to our students and professionals.
              </p>
            </div>
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <FontAwesomeIcon icon={faGlobe} className="text-primary text-2xl" />
              </div>
              <p className="text-lg text-neutral-700">
                Choosing MedHome means embracing excellence, credibility, and a clear pathway to a successful medical career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Make an Enquiry</h2>
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
              <div>
                <label htmlFor="subject" className="block text-neutral-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enquiry subject"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-neutral-700 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your message"
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

      {/* Why Choose Accredited Education Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Accredited Education?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-neutral-100 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-neutral-700">
                Our accreditations ensure that our educational programs meet rigorous quality standards and best practices in medical education.
              </p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faGlobe} className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Recognition</h3>
              <p className="text-neutral-700">
                Accredited qualifications are recognized worldwide, enhancing your professional credibility and opening doors to international opportunities.
              </p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faHandshake} className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Industry Relevance</h3>
              <p className="text-neutral-700">
                Our accredited courses are designed in collaboration with industry experts to ensure the content is current, relevant, and aligned with employer needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicAccreditationsPage;
