import React from 'react';
import MedicMenu from './MedicMenu';
import MedicFooter from './MedicFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUser,
  faSearch,
  faTags,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

/**
 * MedicBlogsPage component - Blogs page for MedHome
 * Based on the StudyMedic blogs page but with MedHome branding and content
 */
const MedicBlogsPage: React.FC = () => {
  // Blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Medical Education Beyond Boundaries: MedHome's Global Partnerships",
      excerpt: "Discover how MedHome is expanding medical education opportunities through strategic global partnerships with leading institutions.",
      author: "Admin",
      date: "04 Mar 2025",
      category: "Partnerships",
      imageUrl: "", // Placeholder for image
      slug: "medical-education-beyond-boundaries"
    },
    {
      id: 2,
      title: "MedHome at Medical Education Summit 2025: Driving the Future of Medical Education",
      excerpt: "Learn about MedHome's participation in the prestigious Medical Education Summit and our contributions to advancing healthcare education.",
      author: "Admin",
      date: "01 Mar 2025",
      category: "Events",
      imageUrl: "", // Placeholder for image
      slug: "medhome-at-medical-education-summit-2025"
    },
    {
      id: 3,
      title: "5 Challenges Doctors Face When Preparing for Royal College Exams",
      excerpt: "Explore the common obstacles medical professionals encounter when studying for prestigious Royal College examinations and how to overcome them.",
      author: "Admin",
      date: "21 Feb 2025",
      category: "Exam Preparation",
      imageUrl: "", // Placeholder for image
      slug: "challenges-doctors-face-royal-college-exams"
    },
    {
      id: 4,
      title: "Top Strategies for Doctors Pursuing Royal College Certifications",
      excerpt: "Discover proven techniques and approaches to help you succeed in your journey toward earning prestigious Royal College certifications.",
      author: "Admin",
      date: "17 Feb 2025",
      category: "Career Development",
      imageUrl: "", // Placeholder for image
      slug: "strategies-for-royal-college-certifications"
    },
    {
      id: 5,
      title: "5 Things Every Doctor Needs to Know About Royal College Certifications",
      excerpt: "Essential information about Royal College certifications that can significantly impact your medical career trajectory and opportunities.",
      author: "Admin",
      date: "10 Feb 2025",
      category: "Career Development",
      imageUrl: "", // Placeholder for image
      slug: "things-to-know-about-royal-college-certifications"
    },
    {
      id: 6,
      title: "Why choose our MRCOG Clinical Training Program?",
      excerpt: "Explore the unique benefits and advantages of MedHome's comprehensive MRCOG Clinical Training Program for obstetrics and gynecology specialists.",
      author: "Admin",
      date: "21 Jan 2025",
      category: "Clinical Programs",
      imageUrl: "", // Placeholder for image
      slug: "why-choose-mrcog-clinical-training-program"
    },
    {
      id: 7,
      title: "Exploring the Benefits of Royal College Certifications for Indian Doctors",
      excerpt: "How Indian medical professionals can leverage UK Royal College certifications to enhance their career prospects globally.",
      author: "Admin",
      date: "18 Jan 2025",
      category: "International Opportunities",
      imageUrl: "", // Placeholder for image
      slug: "benefits-royal-college-certifications-indian-doctors"
    },
    {
      id: 8,
      title: "Understanding the Structure of Royal College Membership & Fellowship Exams",
      excerpt: "A comprehensive breakdown of how Royal College exams are organized, what to expect, and how to prepare effectively for each component.",
      author: "Admin",
      date: "13 Jan 2025",
      category: "Exam Preparation",
      imageUrl: "", // Placeholder for image
      slug: "structure-royal-college-membership-fellowship-exams"
    }
  ];

  // Blog categories
  const categories = [
    { id: 1, name: "Exam Preparation", count: 12 },
    { id: 2, name: "Career Development", count: 15 },
    { id: 3, name: "Clinical Programs", count: 8 },
    { id: 4, name: "International Opportunities", count: 10 },
    { id: 5, name: "Events", count: 5 },
    { id: 6, name: "Partnerships", count: 3 },
    { id: 7, name: "Medical Education", count: 14 }
  ];

  // Recent posts (subset of blog posts)
  const recentPosts = blogPosts.slice(0, 5);

  return (
    <div className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <MedicMenu />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">MedHome Blogs</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Explore insightful articles on medical education, career guidance, exam preparation, and the latest trends in healthcare
          </p>
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full p-4 pr-12 rounded-md focus:outline-none"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Blog Posts */}
            <div className="lg:w-2/3">
              <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
              
              <div className="space-y-8">
                {blogPosts.map(post => (
                  <div key={post.id} className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    {/* Image placeholder - replace with actual images */}
                    <div 
                      className="bg-primary/10 h-64 flex items-center justify-center"
                    >
                      <h3 className="text-primary text-xl font-bold px-4 text-center">{post.title}</h3>
                      <span className="sr-only">{post.title} Image</span>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center text-sm text-neutral-500 mb-3">
                        <span className="flex items-center mr-4">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                          {post.date}
                        </span>
                        <span className="flex items-center mr-4">
                          <FontAwesomeIcon icon={faUser} className="mr-2" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <FontAwesomeIcon icon={faTags} className="mr-2" />
                          {post.category}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3">{post.title}</h3>
                      <p className="text-neutral-700 mb-4">{post.excerpt}</p>
                      
                      <a 
                        href={`#${post.slug}`} 
                        className="inline-flex items-center text-primary font-semibold hover:underline"
                      >
                        Read More <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                  <a href="#" className="px-4 py-2 rounded-l-md border border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50">
                    Previous
                  </a>
                  <a href="#" className="px-4 py-2 border-t border-b border-neutral-300 bg-primary text-white">
                    1
                  </a>
                  <a href="#" className="px-4 py-2 border-t border-b border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">
                    2
                  </a>
                  <a href="#" className="px-4 py-2 border-t border-b border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">
                    3
                  </a>
                  <span className="px-4 py-2 border-t border-b border-neutral-300 bg-white text-neutral-700">
                    ...
                  </span>
                  <a href="#" className="px-4 py-2 border-t border-b border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">
                    8
                  </a>
                  <a href="#" className="px-4 py-2 rounded-r-md border border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50">
                    Next
                  </a>
                </nav>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Search Widget */}
              <div className="bg-neutral-100 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">Search</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search articles..." 
                    className="w-full p-3 pr-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
              
              {/* Categories Widget */}
              <div className="bg-neutral-100 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map(category => (
                    <li key={category.id}>
                      <a 
                        href={`#category-${category.id}`} 
                        className="flex items-center justify-between text-neutral-700 hover:text-primary transition-colors"
                      >
                        <span>{category.name}</span>
                        <span className="bg-neutral-200 px-2 py-1 rounded-full text-xs">
                          {category.count}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recent Posts Widget */}
              <div className="bg-neutral-100 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">Recent Posts</h3>
                <ul className="space-y-4">
                  {recentPosts.map(post => (
                    <li key={post.id} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                      <a 
                        href={`#${post.slug}`} 
                        className="hover:text-primary transition-colors"
                      >
                        <h4 className="font-medium mb-1">{post.title}</h4>
                        <div className="flex items-center text-xs text-neutral-500">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                          <span>{post.date}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Newsletter Widget */}
              <div className="bg-primary/10 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>
                <p className="text-neutral-700 mb-4">Stay updated with the latest articles, news, and resources in medical education.</p>
                <form className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button 
                    type="button" 
                    className="w-full bg-primary text-white px-4 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MedicFooter />
    </div>
  );
};

export default MedicBlogsPage;
