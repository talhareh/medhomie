import React, { useEffect } from 'react';
import Header from '../components/Header';
import { useStage, STAGES } from '../context/StageContext';

// ============================================
// ABOUT PAGE
// ============================================
export default function AboutPage() {
  const { updateStage } = useStage();
  
  useEffect(() => {
    updateStage(STAGES.HOME); // Keep as HOME since it's part of homepage navigation
  }, [updateStage]);
  return (
    <div className="bg-white min-h-screen">
      <Header showLogoutButton />
      
      {/* Hero Banner Section */}
      <div className="bg-blue-600 py-16 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">About MedHome</h1>
        <p className="text-xl text-white max-w-3xl mx-auto px-4">
          Pioneering excellence in medical education to help medical graduates succeed in their careers.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Who Are We Section */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Who Are We?</h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Accredited by international organizations and bodies like BAC, CPD, ACTD, IAO, AAA, and more; 
            MedHome remains a leading and most trusted brand in Premier Medical Education.
          </p>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            We proudly collaborate with globally esteemed organizations to enhance our educational offerings. 
            MedHome offers training and guidance for a range of globally-renowned medical memberships and 
            certifications, ensuring our students are well-prepared for their professional journeys.
          </p>
        </section>

        {/* Medical Education Excellence Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Medical Education Excellence</h2>
          <div className="bg-gray-50 rounded-lg p-8 mb-6">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Medical education is the cornerstone of healthcare delivery, preparing future physicians, 
              nurses, and healthcare professionals to provide exceptional patient care. At MedHome, we 
              understand that medical education goes beyond textbooks and lectures—it encompasses clinical 
              skills, critical thinking, ethical decision-making, and compassionate patient interaction.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our comprehensive curriculum integrates evidence-based medicine with hands-on clinical 
              experience, ensuring that graduates are not only knowledgeable but also competent and 
              confident in their practice. We emphasize the importance of lifelong learning, as medicine 
              is an ever-evolving field that requires continuous education and adaptation.
            </p>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-700 mb-3">Educational Excellence</h3>
              <p className="text-gray-700">
                To provide world-class medical education that meets international standards and prepares 
                students for successful careers in healthcare.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">Professional Development</h3>
              <p className="text-gray-700">
                To support medical professionals throughout their careers with continuous learning 
                opportunities and professional development programs.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-3">Global Recognition</h3>
              <p className="text-gray-700">
                To ensure our certifications and programs are recognized and valued by healthcare 
                institutions worldwide.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">Innovation in Learning</h3>
              <p className="text-gray-700">
                To leverage modern technology and innovative teaching methods to enhance the learning 
                experience and outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* Medical Specializations Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Medical Specializations We Cover</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-800 mb-2">Internal Medicine</h4>
              <p className="text-sm text-gray-600">
                Comprehensive training in diagnosis and treatment of adult diseases.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-800 mb-2">Surgery</h4>
              <p className="text-sm text-gray-600">
                Advanced surgical techniques and procedures for various specialties.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-800 mb-2">Pediatrics</h4>
              <p className="text-sm text-gray-600">
                Specialized care for infants, children, and adolescents.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-800 mb-2">Cardiology</h4>
              <p className="text-sm text-gray-600">
                Heart and cardiovascular system diagnosis and treatment.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-800 mb-2">Neurology</h4>
              <p className="text-sm text-gray-600">
                Disorders of the nervous system and brain.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-gray-800 mb-2">Emergency Medicine</h4>
              <p className="text-sm text-gray-600">
                Critical care and emergency response training.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose MedHome Section */}
        <section className="mb-12 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Why Choose MedHome?</h2>
          <ul className="space-y-4 text-lg text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-orange-600 font-bold text-xl">✓</span>
              <span>Internationally accredited programs recognized by leading medical organizations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 font-bold text-xl">✓</span>
              <span>Expert faculty with years of clinical and teaching experience</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 font-bold text-xl">✓</span>
              <span>Comprehensive curriculum covering both theoretical knowledge and practical skills</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 font-bold text-xl">✓</span>
              <span>Flexible learning options to accommodate busy schedules</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 font-bold text-xl">✓</span>
              <span>Strong network of healthcare professionals and institutions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 font-bold text-xl">✓</span>
              <span>Career support and guidance for medical graduates</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

