import React, { useState } from 'react';
import { useGetAllPosts } from '../hooks/useQueries';
import { useFileList } from './FileList';
import { Grid, List, Calendar, User, X } from 'lucide-react';
import { Post } from '../../declarations/findavote_backend/findavote_backend.did';

export default function Find() {
  const { data: posts = [], isLoading } = useGetAllPosts();
  const { getFileUrl } = useFileList();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Load image URLs
  React.useEffect(() => {
    const loadImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const post of posts) {
        if (post.imagePath) {
          try {
            const url = await getFileUrl({ path: post.imagePath, size: BigInt(0), mimeType: 'image/jpeg' });
            urls[post.imagePath] = url;
          } catch (error) {
            console.error('Failed to load image URL:', error);
          }
        }
      }
      setImageUrls(urls);
    };

    if (posts.length > 0) {
      loadImageUrls();
    }
  }, [posts, getFileUrl]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const formatPrincipal = (principal: any) => {
    const principalStr = principal.toString();
    return `${principalStr.slice(0, 8)}...${principalStr.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Voters to Follow</h1>
          <p className="text-gray-600">Discover voting methodologies, values, and neuron addresses to follow</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share your ICP SNS DAO participation methodology!</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {posts.map((post) => (
            <div
              key={Number(post.id)}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => setSelectedPost(post)}
            >
              {post.imagePath && imageUrls[post.imagePath] && (
                <div className={viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'}>
                  <img
                    src={imageUrls[post.imagePath]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{formatPrincipal(post.author)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for post details */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedPost.imagePath && imageUrls[selectedPost.imagePath] && (
                <img
                  src={imageUrls[selectedPost.imagePath]}
                  alt={selectedPost.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedPost.title}</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedPost.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Author: {formatPrincipal(selectedPost.author)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Posted: {formatDate(selectedPost.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}