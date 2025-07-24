import React from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useUserProfile, useSaveUserProfile, useIsCurrentUserAdmin } from '../hooks/useQueries';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import Find from './Find';
import Post from './Post';
import Admin from './Admin';
import About from './About';
import ProfileSetup from './ProfileSetup';
import { useState } from 'react';

type Page = 'home' | 'find' | 'post' | 'admin' | 'about';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: isAdmin } = useIsCurrentUserAdmin();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const isAuthenticated = !!identity;

  // Show profile setup if user is authenticated but has no profile
  if (isAuthenticated && !profileLoading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="container mx-auto px-4 py-8">
          {/* @ts-ignore */}
          <ProfileSetup />
        </main>
        <Footer />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'find':
        return <Find />;
      case 'post':
        if (!isAuthenticated) {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-6">You must be logged in to create or manage posts.</p>
              <p className="text-gray-500">Please log in using the button in the header to continue.</p>
            </div>
          );
        }
        return <Post />;
      case 'admin':
        if (isAdmin) {
          return <Admin />;
        } else {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          );
        }
      case 'about':
        return <About />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}