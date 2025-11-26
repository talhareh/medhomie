import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useStage, STAGES } from '../context/StageContext';

// ============================================
// MY COURSES PAGE
// ============================================
export default function MyCoursesPage() {
  const { purchasedCourses } = useCart();
  const { updateStage } = useStage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    updateStage(STAGES.HOME); // Keep as HOME since it's part of homepage navigation
  }, [updateStage]);

  // Get unique categories from purchased courses
  const categories = ['All', ...new Set(purchasedCourses.map(course => course.category))];

  // Filter courses
  const filteredCourses = purchasedCourses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get completion status (mock data - in real app, this would come from backend)
  const getCompletionStatus = (courseId) => {
    // Simulate completion percentage
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="bg-white min-h-screen">
      <Header showLogoutButton />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-600 py-16 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">My Courses</h1>
        <p className="text-xl text-white max-w-3xl mx-auto px-4">
          Access and continue learning from your purchased courses
        </p>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {purchasedCourses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search your courses..."
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
        )}

        {/* Courses Grid */}
        {purchasedCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h2>
            <p className="text-gray-600 mb-6">You haven't purchased any courses yet. Start learning today!</p>
            <Link
              to="/programs"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Browse Programs
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCourses.map(course => {
                const completion = getCompletionStatus(course.id);
                return (
                  <div key={course.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                    {/* Course Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-100 text-sm font-semibold">{course.category}</span>
                        <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">Purchased</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{course.name}</h3>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-4 line-clamp-2 text-sm">{course.description}</p>
                      
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

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{completion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full transition-all"
                            style={{ width: `${completion}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-lg font-semibold transition">
                          Continue Learning
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold transition" title="View Details">
                          📖
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty Filter State */}
            {filteredCourses.length === 0 && purchasedCourses.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

