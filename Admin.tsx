import React, { useState } from 'react';
import { useListUsers, useSetApproval, useAssignRole, useRemovePost, useGetAllPosts } from '../hooks/useQueries';
import { useFileList } from '../file-storage/FileList';
import { Shield, Users, Trash2 } from 'lucide-react';
import { UserInfo, Post, UserRole, ApprovalStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export default function Admin() {
  const { data: users = [] } = useListUsers();
  const { data: posts = [] } = useGetAllPosts();
  const { getFileUrl } = useFileList();
  
  const setApprovalMutation = useSetApproval();
  const assignRoleMutation = useAssignRole();
  const removePostMutation = useRemovePost();
  
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Load image URLs for posts
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

  const handleApprovalChange = (user: string, approval: ApprovalStatus) => {
    setApprovalMutation.mutate({ user, approval });
  };

  const handleRoleChange = (user: string, role: UserRole) => {
    assignRoleMutation.mutate({ user, role });
  };

  const handleRemovePost = (postId: bigint) => {
    if (confirm('Are you sure you want to remove this post? This action cannot be undone.')) {
      removePostMutation.mutate(postId);
    }
  };

  const formatPrincipal = (principal: Principal) => {
    const principalStr = principal.toString();
    return `${principalStr.slice(0, 8)}...${principalStr.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalColor = (approval: ApprovalStatus) => {
    switch (approval) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="inline h-4 w-4 mr-2" />
              Post Moderation
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.principal.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrincipal(user.principal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(user.approval)}`}>
                            {user.approval}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <select
                            value={user.approval}
                            onChange={(e) => handleApprovalChange(user.principal.toString(), e.target.value as ApprovalStatus)}
                            className="border border-gray-300 rounded px-2 py-1 text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.principal.toString(), e.target.value as UserRole)}
                            className="border border-gray-300 rounded px-2 py-1 text-xs"
                          >
                            <option value="guest">Guest</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Post Moderation</h2>
              <div className="grid gap-4">
                {posts.map((post) => (
                  <div key={Number(post.id)} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4 flex-1">
                        {post.imagePath && imageUrls[post.imagePath] && (
                          <img
                            src={imageUrls[post.imagePath]}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
                          <div className="text-xs text-gray-500">
                            By {formatPrincipal(post.author)} • {formatDate(post.timestamp)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePost(post.id)}
                        disabled={removePostMutation.isPending}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Remove post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}