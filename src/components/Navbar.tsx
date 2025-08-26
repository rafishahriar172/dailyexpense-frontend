/* eslint-disable @next/next/no-img-element */
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Image from "next/image";
import { toast } from 'sonner'; // or your preferred toast library

interface User {
  id?: string;
  email?: string;
  name?: string;
  image?: string;
}

interface Session {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

const Navbar = () => {
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    if (!session?.refreshToken) {
      // If no refresh token, just sign out from NextAuth
      await signOut({ callbackUrl: '/' });
      return;
    }

    setIsLoggingOut(true);
    
    try {
      // Call backend logout API first
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          refreshToken: session.refreshToken,
        },
      });
    } catch (error) {
      console.error('Backend logout error:', error);
      // Continue with NextAuth signOut even if backend fails
      toast.error('Logout warning: Session cleared locally but server logout failed');
    } finally {
      // Always clear NextAuth session
      await signOut({ callbackUrl: '/' });
      setIsLoggingOut(false);
    }
  };

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-gray-800">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="inline-block mr-2" />
                Daily Expense
              </Link>
            </div>
            <div className="flex space-x-4">
              <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
              <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="inline-block mr-2" />
              Daily Expense
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {status === 'authenticated' && session ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>

                {/* Dashboard Link (optional) */}
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>

                {/* Accounts Link (optional) */}
                <Link
                  href="/expenses/account"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Accounts
                </Link>

                {/* Transfer Link (optional) */}
                <Link
                  href="/expenses/transaction"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Transaction
                </Link>

                {/* Budget Link (optional) */}
                <Link
                  href="/expenses/budget"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Budget
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <span>Logout</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Login Button */}
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                
                {/* Register Button */}
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;