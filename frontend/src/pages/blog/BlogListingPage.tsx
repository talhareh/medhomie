import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBlogs, BlogPost } from '../../services/blogService';
import BlogCard from '../../components/blog/BlogCard';
import MedicMenu from '../medicMaterial/MedicMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faTag } from '@fortawesome/free-solid-svg-icons';

const BlogListingPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-blogs', page, limit, selectedTag, search],
    queryFn: () => getBlogs(page, limit, 'PUBLISHED', selectedTag, search)
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? undefined : tag);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract all unique tags from blog posts
  const allTags = React.useMemo(() => {
    if (!data?.data) return [];
    const tagsSet = new Set<string>();
    data.data.forEach((blog: BlogPost) => {
      blog.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [data?.data]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <MedicMenu />
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">MedHome Blog</h1>
          <p className="text-xl opacity-90">
            Latest insights, research, and updates from the medical education community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-2/3">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search articles..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2 pt-1">
                <FontAwesomeIcon icon={faTag} className="mr-1" />
                Filter by tag:
              </span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(undefined)}
                  className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-600" />
          </div>
        ) : isError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load articles. Please try again later.</span>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded text-center">
            <p className="text-lg">No articles found.</p>
            <p className="text-sm mt-2">Try changing your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.map((blog: BlogPost) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>

            {data?.pagination && data.pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border-t border-b border-gray-300 ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === data.pagination.pages}
                    className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogListingPage;
