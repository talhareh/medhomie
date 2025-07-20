import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandshake,
  faHospital,
  faGraduationCap,
  faUniversity,
  faBuilding,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicPartnersPage component - Partners page for MedHome
 * Based on the MedHomeMedic partners page but with MedHome branding and content
 */
const MedicPartnersPage: React.FC = () => {
  // Partner categories
  const partnerCategories = [
    {
      id: 1,
      title: "Hospital Partners",
      icon: faHospital
    },
    {
      id: 2,
      title: "Educational Institutions",
      icon: faUniversity
    },
    {
      id: 3,
      title: "Accreditation Bodies",
      icon: faGraduationCap
    },
    {
      id: 4,
      title: "Corporate Partners",
      icon: faBuilding
    }
  ];

  // Partners data
  const partners = [
    {
      id: 1,
      name: "Nirogya Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 2,
      name: "SMITA Memorial Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 3,
      name: "Indira Gandhi Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 4,
      name: "Apothecary Medical Services",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 5,
      name: "Nanavati Max Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 6,
      name: "Amrita Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 7,
      name: "Bombay Maternity and Surgical Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 8,
      name: "SP Fort Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 9,
      name: "Medicover Hospitals",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 10,
      name: "Moulana Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 11,
      name: "Daya Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 12,
      name: "B.P Poddar Hospital",
      category: "Hospital Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 13,
      name: "Karol Educational Consultancy",
      category: "Educational Institutions",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 14,
      name: "OC Academy",
      category: "Educational Institutions",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 15,
      name: "Dubai Medical College for Girls",
      category: "Educational Institutions",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 16,
      name: "B J Medical College",
      category: "Educational Institutions",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 17,
      name: "Sunrise Academy",
      category: "Educational Institutions",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 18,
      name: "EBCOG",
      category: "Accreditation Bodies",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    },
    {
      id: 19,
      name: "ICICI BANK",
      category: "Corporate Partners",
      readMoreUrl: "#",
      imageUrl: "", // Placeholder for image
      imageWidth: 200,
      imageHeight: 100
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Partners</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Explore Our Trusted Partnerships in Medical Education
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <FontAwesomeIcon icon={faHandshake} className="text-primary text-5xl" />
            </div>
            <p className="text-lg text-neutral-700">
              Our roster of esteemed partners, comprising leading hospitals, renowned medical institutions, and prestigious accrediting bodies, underscores our commitment to excellence. Collaborating with these esteemed entities enhances our reliability and strengthens our position as a frontrunner in the medical education landscape.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Partner Network</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {partnerCategories.map(category => (
              <div key={category.id} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={category.icon} className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {partnerCategories.map(category => {
            const categoryPartners = partners.filter(partner => partner.category === category.title);
            
            return categoryPartners.length > 0 ? (
              <div key={category.id} className="mb-16 last:mb-0">
                <h2 className="text-2xl font-bold mb-8 flex items-center">
                  <FontAwesomeIcon icon={category.icon} className="text-primary mr-3" />
                  {category.title}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {categoryPartners.map(partner => (
                    <div key={partner.id} className="bg-neutral-100 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                      {/* Image placeholder - replace with actual images */}
                      <div 
                        className="bg-white border border-neutral-200 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4"
                        style={{ width: partner.imageWidth, height: partner.imageHeight }}
                      >
                        <span className="text-primary font-semibold">{partner.name}</span>
                        <span className="sr-only">{partner.name} Logo</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-3">{partner.name}</h3>
                      <a 
                        href={partner.readMoreUrl} 
                        className="inline-flex items-center text-primary font-medium hover:underline"
                      >
                        Read More <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-sm" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })}
        </div>
      </section>

      {/* Become a Partner Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">Become a Partner</h2>
          <p className="text-lg text-neutral-700 mb-8">
            Join our network of esteemed partners and collaborate with us to shape the future of medical education. We welcome partnerships with hospitals, educational institutions, accreditation bodies, and corporate organizations.
          </p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-neutral-700 mb-1">Organization Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your organization name"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-neutral-700 mb-1">Organization Type</label>
                  <select 
                    id="type" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select type</option>
                    <option value="hospital">Hospital</option>
                    <option value="educational">Educational Institution</option>
                    <option value="accreditation">Accreditation Body</option>
                    <option value="corporate">Corporate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label htmlFor="phone" className="block text-neutral-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-neutral-700 mb-1">Partnership Proposal</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe how you would like to partner with us"
                ></textarea>
              </div>
              <button 
                type="button" 
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Submit Proposal
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits of Partnership</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-primary">Enhanced Visibility</h3>
              <p className="text-neutral-700">
                Gain exposure to our global network of medical professionals and students. Your organization will be featured on our website, marketing materials, and events.
              </p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-primary">Collaborative Opportunities</h3>
              <p className="text-neutral-700">
                Engage in joint research initiatives, educational programs, and events that advance medical knowledge and practices worldwide.
              </p>
            </div>
            
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-primary">Access to Talent</h3>
              <p className="text-neutral-700">
                Connect with highly skilled medical professionals and graduates from our programs, creating pathways for recruitment and professional development.
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

export default MedicPartnersPage;
