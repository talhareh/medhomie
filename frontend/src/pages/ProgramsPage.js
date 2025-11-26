import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useStage, STAGES } from '../context/StageContext';

// ============================================
// PROGRAMS PAGE
// ============================================

// Sample courses data
const courses = [
  {
    id: 1,
    name: 'Advanced Internal Medicine',
    description: 'Comprehensive training in diagnosis and treatment of complex adult diseases. Covers cardiology, endocrinology, and infectious diseases.',
    duration: '12 months',
    price: '$2,499',
    instructor: 'Dr. Sarah Johnson',
    level: 'Advanced',
    category: 'Internal Medicine'
  },
  {
    id: 2,
    name: 'Surgical Techniques Masterclass',
    description: 'Hands-on training in advanced surgical procedures. Includes laparoscopic, robotic, and minimally invasive techniques.',
    duration: '6 months',
    price: '$3,999',
    instructor: 'Dr. Michael Chen',
    level: 'Expert',
    category: 'Surgery'
  },
  {
    id: 3,
    name: 'Pediatric Care Certification',
    description: 'Specialized program for healthcare professionals working with children. Covers developmental milestones, common illnesses, and emergency care.',
    duration: '9 months',
    price: '$1,899',
    instructor: 'Dr. Emily Rodriguez',
    level: 'Intermediate',
    category: 'Pediatrics'
  },
  {
    id: 4,
    name: 'Cardiology Fundamentals',
    description: 'Essential knowledge of cardiovascular system, ECG interpretation, and management of heart conditions.',
    duration: '6 months',
    price: '$2,199',
    instructor: 'Dr. James Wilson',
    level: 'Intermediate',
    category: 'Cardiology'
  },
  {
    id: 5,
    name: 'Neurological Disorders',
    description: 'In-depth study of neurological conditions, diagnostic methods, and treatment protocols for brain and nervous system disorders.',
    duration: '10 months',
    price: '$2,799',
    instructor: 'Dr. Lisa Anderson',
    level: 'Advanced',
    category: 'Neurology'
  },
  {
    id: 6,
    name: 'Emergency Medicine Training',
    description: 'Critical care skills for emergency situations. Includes trauma management, resuscitation, and triage protocols.',
    duration: '8 months',
    price: '$2,399',
    instructor: 'Dr. Robert Taylor',
    level: 'Advanced',
    category: 'Emergency Medicine'
  },
  {
    id: 7,
    name: 'Medical Research Methodology',
    description: 'Learn to conduct and analyze medical research. Includes clinical trial design, statistical analysis, and publication ethics.',
    duration: '4 months',
    price: '$1,599',
    instructor: 'Dr. Maria Garcia',
    level: 'Intermediate',
    category: 'Research'
  },
  {
    id: 8,
    name: 'Medical Ethics and Law',
    description: 'Understanding ethical principles in healthcare, patient rights, and legal aspects of medical practice.',
    duration: '3 months',
    price: '$999',
    instructor: 'Dr. David Brown',
    level: 'Beginner',
    category: 'Ethics'
  }
];

export default function ProgramsPage() {
  const { addToCart, removeFromCart, addToSaved, removeFromSaved, isInCart, isSaved, isPurchased } = useCart();
  const { updateStage } = useStage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    updateStage(STAGES.HOME); // Keep as HOME since it's part of homepage navigation
  }, [updateStage]);

  // Get unique categories
  const categories = ['All', ...new Set(courses.map(course => course.category))];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCartToggle = (course) => {
    if (isInCart(course.id)) {
      removeFromCart(course.id);
    } else {
      addToCart(course);
    }
  };

  const handleSaveToggle = (course) => {
    if (isSaved(course.id)) {
      removeFromSaved(course.id);
    } else {
      addToSaved(course);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header showLogoutButton />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-600 py-16 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Our Programs</h1>
        <p className="text-xl text-white max-w-3xl mx-auto px-4">
          Explore our comprehensive range of medical education programs designed to advance your career
        </p>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    selectedCategory === category
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-4">
                <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                <p className="text-blue-100 text-sm">{course.category}</p>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">Instructor:</span>
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">Level:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      course.level === 'Advanced' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-orange-600">{course.price}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isPurchased(course.id) ? (
                    <Link
                      to="/my-courses"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-semibold transition text-center"
                    >
                      ✓ View in My Courses
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleCartToggle(course)}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition ${
                        isInCart(course.id)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      {isInCart(course.id) ? '🗑️ Remove from Cart' : '🛒 Add to Cart'}
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveToggle(course)}
                    className={`py-2.5 px-4 rounded-lg font-semibold transition ${
                      isSaved(course.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    title={isSaved(course.id) ? 'Remove from Saved' : 'Save for Later'}
                  >
                    {isSaved(course.id) ? '✓ Saved' : '💾 Save'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

