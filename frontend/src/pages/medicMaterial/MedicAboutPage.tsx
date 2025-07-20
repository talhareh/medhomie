import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt,
  faPhone,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';

/**
 * MedicAboutPage component - About Us page for MedHome
 * Based on the MedHome about page but with MedHome branding and content
 */
const MedicAboutPage: React.FC = () => {
  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Sophia N. M.",
      role: "Chief Medical Officer",
      description: "Dr. Sophia is a highly experienced Obstetrician and Gynaecologist with over 11 years of clinical and surgical experience. She specializes in women's health issues including abdominal and vaginal hysterectomies, laparotomies, vaginal repairs, and obstetrical care. Currently based in Abu Dhabi, she practices with a leading hospital chain in the Middle East. Her mentoring style has earned her great respect among students worldwide, and she has vast experience in academic training, helping candidates excel in their MRCOG and MRCPI exams."
    },
    {
      id: 2,
      name: "Alex Krishnan",
      role: "Chief Operations Officer",
      description: "Alex is passionate about delivering quality-driven education in the most effective way possible. He spearheads commercial efforts to create a balanced and integrated MedHome experience. With over 10 years of experience in operations management and analysis at multiple established organizations, Alex brings diverse expertise to address each client's unique business needs. He manages a team of operations officers and coordinators, maintaining smooth client relationships and driving the adoption of best practices in planning, training, and new technologies."
    },
    {
      id: 3,
      name: "Dr. Tanya",
      role: "Academic Director",
      description: "Dr. Tanya brings over 15 years of experience in medical education and curriculum development. She has designed comprehensive training programs for various medical specialties and has been instrumental in establishing MedHome's reputation for academic excellence. Her innovative teaching methodologies have helped thousands of students achieve success in their medical examinations."
    },
    {
      id: 4,
      name: "Dr. Clara Diwan",
      role: "Director of Clinical Training",
      description: "Dr. Clara specializes in clinical skills training and assessment. With extensive experience in both hospital settings and academic institutions, she bridges the gap between theoretical knowledge and practical application. Her workshops on clinical examination techniques are highly regarded in the medical education community."
    },
    {
      id: 5,
      name: "Dr. Gavin Walsh",
      role: "Research Director",
      description: "Dr. Gavin leads MedHome's research initiatives, focusing on evidence-based medical education. His work has been published in several international journals, and he regularly presents at medical education conferences worldwide. Under his guidance, MedHome continues to evolve its teaching methodologies based on the latest research findings."
    },
    {
      id: 6,
      name: "Ryan Vijayan",
      role: "Head of Human Resources",
      description: "Ryan is a dynamic HR leader with over a decade of experience in strategic human resources management. He oversees global HR operations, aligning strategies with organizational goals to foster a culture of growth, productivity, and employee well-being. A strong advocate for diversity and inclusion, Ryan is dedicated to building a positive, ethical workplace that prioritizes both employee satisfaction and business success."
    }
  ];

  // Office locations
  const offices = [
    {
      id: 1,
      name: "MedHome LLC - Qatar",
      address: "Office No. 3, First Floor, Regus Business Center, Al Jaidah Square, No. 63, Doha, Qatar",
      phone1: "+974 7108 8181",
      phone2: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "#"
    },
    {
      id: 2,
      name: "MedHome Academy - India ud83dudccc Bengaluru",
      address: "MedHome Academy, Groundfloor, Novel Business Park, 57 13th Cross, Baldwins Road, Koramangala, Bengaluru, Karnataka u2013 560030",
      phone1: "+91 8562 800 700",
      phone2: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "#"
    },
    {
      id: 3,
      name: "MedHome Academy - India ud83dudccc Kerala",
      address: "MedHome Academy Private Ltd, Door No 90 G, N.K.K Plaza Pannithadam Road, Kecheri, Thrissur u2013 680501",
      phone1: "+91 8562 800 700",
      phone2: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "#"
    },
    {
      id: 4,
      name: "MedHome - Pakistan",
      address: "MedHome Pakistan, Collision Co-Working Space, Building C 21/16, CCD, Lake City Main Boulevard, M1, Opp. Rosan Islamic School, Lahore",
      phone1: "+92 333 0182414",
      phone2: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "#"
    }
  ];

  // Courses offered
  const courses = [
    "MRCS", "FRCR", "MRCPI", "OBG", "FMGE", "MRCOG", 
    "PLAB", "MRCPCH", "FCPS", "HRO", "MRCEM", "USMLE", 
    "ULTRASOUND", "VAGINAL SURGERY", "IBCLC"
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Page Title */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About MedHome</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Pioneering excellence in medical education to help medical graduates succeed in their careers
          </p>
        </div>
      </section>

      {/* Who Are We Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Who Are We?</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-neutral-700 mb-6">
              Accredited by international organizations and bodies like BAC, CPD, ACTD, IAO, AAA, and more; MedHome remains a leading and most trusted brand in Premier Medical Education.
            </p>
            <p className="text-lg text-neutral-700 mb-6">
              We proudly collaborate with globally esteemed organizations to enhance our educational offerings. MedHome offers training and guidance for a range of globally-renowned medical memberships and fellowships with the aim of turning medical aspirants into expert clinicians.
            </p>
            <p className="text-lg text-neutral-700 mb-6">
              With an inimitable training structure and a globally recognized mentor's panel with decades of clinical and teaching experience; our comprehensive and well-structured courses are designed to empower aspirants with the right knowledge and skills essential to excelling in the fields.
            </p>
            <p className="text-lg text-neutral-700 mb-6">
              Our plethora of courses range from MRCOG, EFOG-EBCOG, MRCEM, MRCP, MRCPI, MRCS, FRCS, FRCR, MRCPCH, FCPS, FMGE, NEET SS, OET, FMGE, PLAB, OBG and skill enhancement programs like Reproductive Medicine, High Risks Obstetrics, Vaginal Surgery and Ultrasound in Obstetrics & Gynaecology.
            </p>
            <p className="text-lg text-neutral-700 mb-6">
              MedHome also provides exclusive training through our advanced clinical and specialty training programs. Our fellowship programs are designed as per international medical education standards to enable medical aspirants to deal with the healthcare industry globally. We offer one-year fellowship programs for specialties: Cardiology, Emergency Medicine, Clinical Radiology, Obstetrics and Gynaecology, Pediatrics, Diabetology, and Critical Care in OBG.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {courses.map((course, index) => (
              <div key={index} className="bg-neutral-100 p-4 rounded-lg text-center hover:bg-primary hover:text-white transition-colors">
                <p className="font-semibold">{course}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4">Mission</h3>
              <p className="text-neutral-700">
                To facilitate global medical education, accessible to learners worldwide regardless of geographical constraints. We strive to build a new normal in medical education where quality mentoring and advanced technologies go hand in hand, enabling in creating reputed clinicians across the globe.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4">Vision</h3>
              <p className="text-neutral-700">
                MedHome upholds its vision of empowering and nurturing the next generation of healthcare practitioners by revolutionizing medical education. We are committed to creating an environment where medical aspirants can think, learn, and thereby refine their knowledge, skills, and expertise to confidently achieve any international accreditations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4">Core Values</h3>
              <p className="text-neutral-700">
                As the MedHome Team, we value and support our students in every way, aiming to mold them not only to pass exams but also to overcome career hurdles. With our world-class panel of mentors boasting vast clinical and teaching experience, MedHome ensures that all medical aspirants have the opportunity to pursue their dream careers affordably, transforming them into the best, renowned, and reputed clinicians worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Awards & Recognitions</h2>
          <p className="text-lg text-neutral-700 text-center max-w-4xl mx-auto mb-12">
            A pioneer Med EdTech company, MedHome has received numerous awards and recognitions for Excellence in Medical Education and for contributions to the medical fraternity. We are envisioned to create better clinicians across the globe, and each recognition fuels us to continually improve our services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-neutral-100 p-6 rounded-lg text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl font-bold">ud83cudfc6</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence in Medical Education</h3>
              <p className="text-neutral-700">Recognized for outstanding contributions to medical education</p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl font-bold">ud83cudf1f</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation in EdTech</h3>
              <p className="text-neutral-700">Awarded for innovative approaches to medical education technology</p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl font-bold">ud83cudf93</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Impact Award</h3>
              <p className="text-neutral-700">Recognized for global contributions to healthcare education</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-lg text-center mb-12">Our Key Position Holders</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-primary">{member.name}</h3>
                  <p className="text-neutral-600 font-medium mb-4">{member.role}</p>
                  <p className="text-neutral-700">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Global Presence</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offices.map(office => (
              <div key={office.id} className="bg-neutral-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-primary">{office.name}</h3>
                <p className="text-neutral-700 mb-4">{office.address}</p>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faPhone} className="text-primary mr-2" />
                  <p className="text-neutral-700">{office.phone1}</p>
                </div>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faPhone} className="text-primary mr-2" />
                  <p className="text-neutral-700">{office.phone2}</p>
                </div>
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faEnvelope} className="text-primary mr-2" />
                  <a href={`mailto:${office.email}`} className="text-primary hover:underline">
                    {office.email}
                  </a>
                </div>
                <a href={office.mapUrl} className="text-primary hover:underline flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Location Map
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-6">Signup for Newsletters</h2>
          <p className="text-lg text-neutral-700 text-center mb-8">
            Subscribe to MedHome Newsletters & stay informed about our latest courses, programs, and medical education updates.
          </p>
          <div className="flex">
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
        </div>
      </section>

      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicAboutPage;
