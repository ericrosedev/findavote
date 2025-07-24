import React, { useState, useEffect } from 'react';
import { useCreatePost, useGetUserPosts, useDeleteUserPost, useUpdatePost } from '../hooks/useQueries';
import { useFileUpload } from './FileUpload';
import { useFileList } from './FileList';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { Upload, Image as ImageIcon, Edit, Trash2, Plus, Lock } from 'lucide-react';
import { Post as PostType } from '../../declarations/findavote_backend/findavote_backend.did';

export default function Post() {
  const { identity } = useInternetIdentity();
  const { data: userPosts = [], isLoading: userPostsLoading } = useGetUserPosts();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeleteUserPost();
  const updatePostMutation = useUpdatePost();
  const { uploadFile, isUploading } = useFileUpload();
  const { getFileUrl } = useFileList();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const hasExistingPost = userPosts.length > 0;
  const existingPost = hasExistingPost ? userPosts[0] : null;

  // Load existing post image URL - moved before any conditional returns
  useEffect(() => {
    const loadExistingImage = async () => {
      if (existingPost && existingPost.imagePath) {
        try {
          const url = await getFileUrl({ path: existingPost.imagePath, size: BigInt(0), mimeType: 'image/jpeg' });
          setExistingImageUrl(url);
        } catch (error) {
          console.error('Failed to load existing image URL:', error);
        }
      }
    };

    if (existingPost) {
      loadExistingImage();
    }
  }, [existingPost, getFileUrl]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You must be logged in with Internet Identity to create, edit, or delete posts about ICP SNS DAO participation.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Please use the "Login" button in the header to authenticate with Internet Identity and access post management features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEditPost = () => {
    if (existingPost) {
      setIsEditing(true);
      setEditingPost(existingPost);
      setTitle(existingPost.title);
      setDescription(existingPost.description);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPost(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDeletePost = async () => {
    if (existingPost && confirm('Are you sure you want to delete your post? This action cannot be undone.')) {
      try {
        await deletePostMutation.mutateAsync(existingPost.id);
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (200kb)
    if (file.size > 200 * 1024) {
      alert('Image must be smaller than 200KB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resizeImage = (file: File): Promise<Uint8Array> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 120x120
        const maxSize = 120;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(new Uint8Array(reader.result as ArrayBuffer));
            };
            reader.readAsArrayBuffer(blob);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (title.length > 100) {
      alert('Title must be 100 characters or less');
      return;
    }

    if (description.length > 1000) {
      alert('Description must be 1000 characters or less');
      return;
    }

    try {
      let imagePath = '';
      
      if (imageFile) {
        const imageData = await resizeImage(imageFile);
        const fileName = `post-${Date.now()}.jpg`;
        
        await uploadFile(
          fileName,
          'image/jpeg',
          imageData,
          (progress) => {
            setUploadProgress(progress);
            return Promise.resolve();
          }
        );
        
        imagePath = fileName;
      } else if (isEditing && editingPost) {
        // Keep existing image if no new image is uploaded
        imagePath = editingPost.imagePath;
      }

      if (isEditing && editingPost) {
        await updatePostMutation.mutateAsync({
          postId: editingPost.id,
          title: title.trim(),
          description: description.trim(),
          imagePath
        });
        alert('Post updated successfully!');
      } else {
        await createPostMutation.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          imagePath
        });
        alert('Post created successfully!');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      setIsEditing(false);
      setEditingPost(null);
      
    } catch (error) {
      console.error('Failed to save post:', error);
      if (error instanceof Error && error.message.includes('already have a post')) {
        alert('You already have a post. Please delete your existing post before creating a new one.');
      } else if (error instanceof Error && error.message.includes('Unauthorized')) {
        alert('Authentication required. Please log in to create or edit posts.');
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'create'} post. Please try again.`);
      }
    }
  };

  if (userPostsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your posts...</p>
      </div>
    );
  }

  // Show existing post management if user has a post and is not editing
  if (hasExistingPost && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your ICP SNS DAO Participation Post</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              You can only have one post at a time. You can edit or delete your existing post below.
            </p>
          </div>

          {existingPost && (
            <div className="border border-gray-200 rounded-lg p-6">
              {existingPost.imagePath && existingImageUrl && (
                <img
                  src={existingImageUrl}
                  alt={existingPost.title}
                  className="w-full max-w-32 h-32 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{existingPost.title}</h3>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{existingPost.description}</p>
              
              <div className="text-sm text-gray-500 mb-6">
                Posted: {new Date(Number(existingPost.timestamp) / 1000000).toLocaleDateString()}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleEditPost}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Post</span>
                </button>
                
                <button
                  onClick={handleDeletePost}
                  disabled={deletePostMutation.isPending}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Your ICP SNS DAO Participation Post' : 'Share Your ICP SNS DAO Participation'}
        </h1>

        {isEditing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              You are editing your existing post. Changes will be saved when you submit.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto max-w-32 max-h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove image
                  </button>
                </div>
              ) : isEditing && editingPost && existingImageUrl && !imageFile ? (
                <div className="space-y-4">
                  <img
                    src={existingImageUrl}
                    alt="Current"
                    className="mx-auto max-w-32 max-h-32 object-cover rounded"
                  />
                  <p className="text-sm text-gray-600">Current image</p>
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-800">Change image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-800">Upload an image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Max 120x120px, 200KB. JPG, PNG, GIF supported.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title (e.g., 'My ICP SNS DAO Voting Methodology')"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your voting values, methodologies, neuron addresses for following, and any relevant information about your ICP SNS DAO participation approach..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isAuthenticated && 'You are logged in and can create posts.'}
            </div>
            <div className="flex space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={createPostMutation.isPending || updatePostMutation.isPending || isUploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createPostMutation.isPending || updatePostMutation.isPending || isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>
                      {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 
                       isEditing ? 'Updating...' : 'Creating...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isEditing ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span>{isEditing ? 'Update Post' : 'Create Post'}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}