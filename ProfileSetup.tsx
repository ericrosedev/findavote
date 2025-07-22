import React from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCurrentUserAdmin } from '../hooks/useQueries';
import { Vote } from 'lucide-react';

type Page = 'home' | 'find' | 'post' | 'admin' | 'about';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCurrentUserAdmin();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      setCurrentPage('home');
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navItems = [
    { id: 'home' as Page, label: 'Home' },
    { id: 'find' as Page, label: 'Find' },
    { id: 'post' as Page, label: 'Post' },
    { id: 'about' as Page, label: 'About' },
  ];

  if (isAdmin) {
    navItems.splice(-1, 0, { id: 'admin' as Page, label: 'Admin' });
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              <Vote className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FindaVote</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && identity && (
              <span className="text-sm text-gray-600 hidden sm:block">
                {identity.getPrincipal().toString().slice(0, 8)}...
              </span>
            )}
            <button
              onClick={handleAuth}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                isAuthenticated
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50`}
            >
              {buttonText}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}