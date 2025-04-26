import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicContactPage component - Contact page for MedHome
 * Based on the StudyMedic contact page but with MedHome branding and content
 */
const MedicContactPage: React.FC = () => {
  // Office locations data
  const officeLocations = [
    {
      id: 1,
      country: "Qatar",
      name: "MedHome LLC Qatar",
      address: "Office No. 3, First Floor, Regus Business Center, Al Jaidah Square, No. 63, Doha, Qatar",
      phone: "+974 7108 8181",
      altPhone: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "https://www.google.com/maps?ll=25.245169,51.568121&z=17&t=m&hl=en&gl=IN&mapclient=embed&cid=7205919135018252853"
    },
    {
      id: 2,
      country: "India",
      location: "Bengaluru",
      name: "MedHome Academy",
      address: "Groundfloor, Novel Business Park, 57 13th Cross, Baldwins Road, Koramangala, Bengaluru, Karnataka – 560030",
      phone: "+91 8562 800 700",
      altPhone: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "https://www.google.com/maps?ll=12.85335,77.666619&z=16&t=m&hl=en&gl=IN&mapclient=embed&cid=2733529789776790145"
    },
    {
      id: 3,
      country: "India",
      location: "Kerala",
      name: "MedHome Academy Private Ltd",
      address: "Door No 90 G, N.K.K Plaza Pannithadam Road, Kecheri, Thrissur – 680501",
      phone: "+91 8562 800 700",
      altPhone: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "https://www.google.com/maps?ll=10.622564,76.122306&z=16&t=m&hl=en&gl=IN&mapclient=embed&cid=1730546049562577872"
    },
    {
      id: 4,
      country: "Pakistan",
      name: "MedHome Pakistan",
      address: "Collision Co-Working Space, Building C 21/16, CCD, Lake City Main Boulevard, M1, Opp. Rosan Islamic School, Lahore",
      phone: "+92 333 0182414",
      altPhone: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "https://www.google.com/maps?ll=31.36472,74.262237&z=16&t=m&hl=en&gl=IN&mapclient=embed&cid=15378152949927344128"
    },
    {
      id: 5,
      country: "Australia",
      name: "MedHome AUSTRALIA PTY LTD",
      address: "11 York Street, Sydney, NSW 2000 – Australia",
      phone: "+61 434 606 329",
      altPhone: "+974 7108 8181",
      email: "info@medhome.com",
      mapUrl: "https://www.google.com/maps/place/11+York+St,+Sydney+NSW+2000,+Australia/@-33.8652321,151.2029452,17z/data=!3m1!4b1!4m6!3m5!1s0x6b12ae40d8e1bc1d:0x454bc7abc95db497!8m2!3d-33.8652366!4d151.2055201!16s%2Fg%2F11c1y54smv?entry=ttu&g_ep=EgoyMDI1MDIxMi4wIKXMDSoASAFQAw%3D%3D"
    },
    {
      id: 6,
      country: "Mauritius",
      name: "MedHome Academy - Mauritius",
      address: "Hindu House, Cassis, Port Louis Cassis, 1111-05 MAURITIUS",
      phone: "+91 8562 800 700",
      altPhone: "+44 7341 981 539",
      email: "info@medhome.com",
      mapUrl: "https://maps.app.goo.gl/fxDUcjsq1qvXfhdX9"
    },
    {
      id: 7,
      country: "Uganda",
      name: "MedHome LIMITED",
      address: "P.O Box 181938 plot 725 Mawanda Road, Kamyokya, Kampala, Uganda",
      phone: "+256 783 352546",
      altPhone: "+974 7108 8181",
      email: "info@medhome.com",
      mapUrl: "#"
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Feel free to contact MedHome; We are available a click away.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                <form className="space-y-6">
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
                    <label htmlFor="phone" className="block text-neutral-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-neutral-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Subject of your message"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-neutral-700 mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows={5}
                      className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  <button 
                    type="button" 
                    className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
                      <FontAwesomeIcon icon={faBuilding} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Headquarters</h3>
                      <p className="text-neutral-700">MedHome LLC Qatar</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Address</h3>
                      <p className="text-neutral-700">Office No. 3, First Floor, Regus Business Center, Al Jaidah Square, No. 63, Doha, Qatar</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
                      <FontAwesomeIcon icon={faPhone} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Phone</h3>
                      <p className="text-neutral-700">+974 7108 8181</p>
                      <p className="text-neutral-700">+44 7341 981 539</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email</h3>
                      <p className="text-neutral-700">info@medhome.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
                      <FontAwesomeIcon icon={faGlobe} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Website</h3>
                      <p className="text-neutral-700">www.medhome.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <span className="sr-only">Facebook</span>
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <span className="sr-only">Twitter</span>
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#" className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <span className="sr-only">Instagram</span>
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Global Offices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officeLocations.map(office => (
              <div key={office.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">
                  {office.name}
                  {office.location && <span className="text-primary"> - {office.location}</span>}
                </h3>
                <p className="text-neutral-500 mb-4">{office.country}</p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary mt-1 mr-3" />
                    <p className="text-neutral-700">{office.address}</p>
                  </div>
                  
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faPhone} className="text-primary mt-1 mr-3" />
                    <div>
                      <p className="text-neutral-700">{office.phone}</p>
                      <p className="text-neutral-700">{office.altPhone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faEnvelope} className="text-primary mt-1 mr-3" />
                    <p className="text-neutral-700">{office.email}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <a 
                    href={office.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary font-medium hover:underline"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Find Us on the Map</h2>
          <p className="text-center text-neutral-700 max-w-3xl mx-auto mb-12">
            Visit our headquarters in Doha, Qatar or any of our global offices. We'd love to meet you in person and discuss how MedHome can help advance your medical career.
          </p>
          
          {/* Map placeholder - replace with actual map component or iframe */}
          <div className="bg-neutral-200 h-96 rounded-lg flex items-center justify-center">
            <p className="text-neutral-500 text-lg">Interactive Map Will Be Displayed Here</p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-primary/10 p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-neutral-700 mb-8">
              Stay updated with the latest news, events, and resources from MedHome
            </p>
            
            <form className="flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button 
                type="button" 
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Subscribe
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

export default MedicContactPage;
