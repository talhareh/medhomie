import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, useInView, useAnimation } from 'framer-motion';
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
import heroImage from '../../assets/8.png';

// Import testimonial images
import testimonial1 from '../../assets/testimonial/1.jpeg';
import testimonial2 from '../../assets/testimonial/2.jpeg';
import testimonial3 from '../../assets/testimonial/3.jpeg';
import testimonial4 from '../../assets/testimonial/4.jpeg';
import testimonial5 from '../../assets/testimonial/5.jpeg';

// Import testimonial videos
import video1 from '../../assets/testimonial/vid1.mp4';
import video2 from '../../assets/testimonial/vid2.mp4';
import video3 from '../../assets/testimonial/vid3.mp4';

/**
 * MedicHomePage component - Clone of MedHome homepage
 * This is a standalone component that mimics the layout and functionality
 * of the MedHome homepage but uses MedHome branding and colors.
 */
const MedicHomePage: React.FC = () => {
  // State for testimonial carousel
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardHover = {
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  const iconHover = {
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 }
    }
  };

  const testimonialSlide = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };

  // Testimonial data - images and videos
  const testimonialItems = [
    // Images
    { id: 1, type: 'image', src: testimonial1, alt: "Student Testimonial 1" },
    { id: 2, type: 'image', src: testimonial2, alt: "Student Testimonial 2" },
    { id: 3, type: 'image', src: testimonial3, alt: "Student Testimonial 3" },
    { id: 4, type: 'image', src: testimonial4, alt: "Student Testimonial 4" },
    { id: 5, type: 'image', src: testimonial5, alt: "Student Testimonial 5" },
    // Videos
    { id: 6, type: 'video', src: video1, title: "Student Testimonial Video 1" },
    { id: 7, type: 'video', src: video2, title: "Student Testimonial Video 2" },
    { id: 8, type: 'video', src: video3, title: "Student Testimonial Video 3" },
  ];

  // Course data - exact from MedHome
  const courses = [
    { 
      id: 1, 
      title: "Royal College of Obstetricians and Gynaecologists", 
      shortName: "MRCOG-1", 
      url: "https://www.rcog.org.uk/" 
    },
    { 
      id: 2, 
      title: "Royal College of Obstetricians and Gynaecologists", 
      shortName: "MRCOG-2", 
      url: "https://www.rcog.org.uk/" 
    },
    { 
      id: 3, 
      title: "Royal College of Obstetricians and Gynaecologists", 
      shortName: "MRCOG-3", 
      url: "https://www.rcog.org.uk/" 
    },
    { 
      id: 4, 
      title: "College of Physicians and Surgeons Pakistan", 
      shortName: "FCPS-1", 
      url: "https://www.cpsp.edu.pk/" 
    },
    { 
      id: 5, 
      title: "Institute of Medicine and Medical Education", 
      shortName: "IMM", 
      url: "#" // Need more specific info for this one
    },
    { 
      id: 6, 
      title: "College of Physicians and Surgeons Pakistan", 
      shortName: "FCPS-2", 
      url: "https://www.cpsp.edu.pk/" 
    },
    { 
      id: 7, 
      title: "Medical Education Authority", 
      shortName: "MS-ABRIDGE", 
      url: "#" // Need more specific info
    },
    { 
      id: 8, 
      title: "Medical Education Authority", 
      shortName: "MS 2", 
      url: "#" // Need more specific info
    },
    { 
      id: 9, 
      title: "College of Physicians and Surgeons Pakistan", 
      shortName: "MCPS", 
      url: "https://www.cpsp.edu.pk/" 
    },
    { 
      id: 10, 
      title: "Royal College of Physicians of Ireland", 
      shortName: "MRCPI-2", 
      url: "https://www.rcpi.ie/" 
    },
    { 
      id: 11, 
      title: "Gulf Cooperation Council Health Ministers Council", 
      shortName: "GULF GP Exams", 
      url: "https://www.ghc.sa/en/" 
    },
    { 
      id: 12, 
      title: "Gulf Cooperation Council Health Ministers Council", 
      shortName: "GULF Speciality Exam", 
      url: "https://www.ghc.sa/en/" 
    },

  ];

  // Programs data - exact from MedHome
  const programs = [
    {
      id: 1,
      title: "MedHome Two Years Advanced Clinical Training Program",
      description: "Welcome to MedHome Advanced Clinical Training Program- Your perfect path for the UK medical career. By partnering with premier super-specialty hospitals, MedHome provides hands-on clinical training for medical aspirants preparing for esteemed Royal College Memberships and Fellowships.",
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
      description: "MedHome offers both one-day and two-day live circuit courses for medical aspirants preparing for their final round of OSCE examination. Here, aspirants get an opportunity to practice their clinical skills and communication abilities in a real-like exam format, thereby helping them to achieve their dream medical membership or fellowship in one go.",
      url: "#"
    }
  ];

  // Handle testimonial navigation
  const nextTestimonial = () => {
    setActiveTestimonialIndex((prev) => 
      prev === testimonialItems.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setActiveTestimonialIndex((prev) => 
      prev === 0 ? testimonialItems.length - 1 : prev - 1
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
            <motion.div 
              className="md:w-1/2 mb-8 md:mb-0"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                variants={fadeInUp}
              >
                The Pioneer in Medical Education
              </motion.h1>
              <motion.p 
                className="text-xl mb-6"
                variants={fadeInUp}
              >
                Comprehensive medical education courses to help medical graduates succeed in membership, fellowship, and entrance exams.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                variants={fadeInUp}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Link to="/courses" className="bg-white text-primary px-8 py-4 rounded-md font-semibold hover:bg-neutral-100 transition-colors w-full text-center block">
                    Explore Courses
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                  <a href="#programs" className="border border-white text-white px-8 py-4 rounded-md font-semibold hover:bg-white/10 transition-colors w-full text-center block">
                    Our Programs
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: -60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div 
                className="shadow-lg w-full h-64 md:h-80 flex items-center justify-center overflow-hidden p-[1px]"
              >
                <img 
                  src={heroImage} 
                  alt="Medical Education Excellence" 
                  className="w-full h-full rounded-[15px]" 
                />
              </div>
            </motion.div>
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
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {courses.slice(0, 8).map(course => (
              <motion.div 
                key={course.id} 
                className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                }}
                variants={fadeInUp}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
                  transition: { duration: 0.3 }
                }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-primary">{course.shortName}</h3>
                  <p className="text-neutral-700 mb-4">{course.title}</p>
                  <motion.a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary font-semibold flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Learn More <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {courses.slice(8, 16).map(course => (
              <motion.div 
                key={course.id} 
                className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                }}
                variants={fadeInUp}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
                  transition: { duration: 0.3 }
                }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-primary">{course.shortName}</h3>
                  <p className="text-neutral-700 mb-4">{course.title}</p>
                  <motion.a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary font-semibold flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Learn More <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {courses.slice(16).map(course => (
              <motion.div 
                key={course.id} 
                className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                }}
                variants={fadeInUp}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
                  transition: { duration: 0.3 }
                }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-primary">{course.shortName}</h3>
                  <p className="text-neutral-700 mb-4">{course.title}</p>
                  <motion.a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary font-semibold flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Learn More <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      {/* <section id="programs" className="py-16 bg-neutral-100">
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
      </section> */}

      {/* Features Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Makes MedHome Unique?</h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div className="text-center" variants={fadeInUp}>
              <motion.div 
                className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover="hover"
                variants={iconHover}
              >
                <FontAwesomeIcon icon={faMobileScreen} className="text-primary text-2xl" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Mobile Learning App</h3>
              <p className="text-neutral-700">
                Learn anytime, anywhere with our comprehensive mobile app
              </p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <motion.div 
                className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover="hover"
                variants={iconHover}
              >
                <FontAwesomeIcon icon={faLaptop} className="text-primary text-2xl" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Learning Management System</h3>
              <p className="text-neutral-700">
                Access exclusive medical courses and related course products
              </p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <motion.div 
                className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover="hover"
                variants={iconHover}
              >
                <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-2xl" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">OSCE App</h3>
              <p className="text-neutral-700">
                Practice real exam scenarios that mimic the real OSCE structure
              </p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <motion.div 
                className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover="hover"
                variants={iconHover}
              >
                <FontAwesomeIcon icon={faIdCard} className="text-primary text-2xl" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">E-PORTFOLIO</h3>
              <p className="text-neutral-700">
                Manage your learning, track progress, and showcase achievements
              </p>
            </motion.div>
          </motion.div>
          
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
          
          {/* <div className="mt-16">
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
          </div> */}
          
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">What Our Students Say</h2>
          <p className="text-center mb-12">Listen to the words of our proud champions!</p>
          
          <div className="max-w-4xl mx-auto relative">
            <motion.div 
              key={activeTestimonialIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              {testimonialItems[activeTestimonialIndex].type === 'image' ? (
                <div className="flex justify-center">
                  <img 
                    src={testimonialItems[activeTestimonialIndex].src} 
                    alt={testimonialItems[activeTestimonialIndex].alt}
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <video 
                    src={testimonialItems[activeTestimonialIndex].src}
                    controls
                    className="w-full h-auto max-h-[500px] rounded-lg"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </motion.div>
            
            <div className="flex justify-between mt-6">
              <motion.button 
                onClick={prevTestimonial}
                className="bg-white text-primary p-3 rounded-full shadow hover:bg-primary hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </motion.button>
              <motion.button 
                onClick={nextTestimonial}
                className="bg-white text-primary p-3 rounded-full shadow hover:bg-primary hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </motion.button>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonialItems.map((_, index: number) => (
                <motion.button 
                  key={index}
                  onClick={() => setActiveTestimonialIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === activeTestimonialIndex ? 'bg-primary' : 'bg-neutral-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  animate={{
                    scale: index === activeTestimonialIndex ? 1.2 : 1,
                    backgroundColor: index === activeTestimonialIndex ? '#3B82F6' : '#D1D5DB'
                  }}
                  transition={{ duration: 0.2 }}
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
      <section className="py-16 bg-neutral-100">
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
      {/* <section className="py-16 bg-neutral-100">
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
      </section> */}

      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicHomePage;
