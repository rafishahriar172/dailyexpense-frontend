/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../lib/validation";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../../lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account created successfully! Please login.");
      router.push("/auth/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  });

  useEffect(() => {
    document.title = "Register - Daily Expense";
  }, []);

  const onSubmit = (values: RegisterFormData) => mutation.mutate(values);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us today to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                {...register("username")}
                autoComplete="username"
                className={`appearance-none relative block w-full px-3 py-3 border ${errors.username ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent sm:text-sm`}
                placeholder="john_doe"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstname"
                {...register("firstName")}
                autoComplete="given-name"
                className={`appearance-none relative block w-full px-3 py-3 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${errors.firstName ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent sm:text-sm`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastname"
                {...register("lastName")}
                autoComplete="family-name"
                className={`appearance-none relative block w-full px-3 py-3 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${errors.lastName ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent sm:text-sm`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                autoComplete="email"
                className={`appearance-none relative block w-full px-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent sm:text-sm`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                autoComplete="new-password"
                className={`appearance-none relative block w-full px-3 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent sm:text-sm`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>           

            <div className="relative"> {/* Add 'relative' here */}
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`appearance-none relative block w-full pl-3 pr-10 py-3 border ${confirmPasswordError ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${confirmPasswordError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent sm:text-sm`}
                placeholder="••••••••"
                onBlur={(e) => { // Changed from 'outfocus' to 'onBlur'
                  const value = e.currentTarget.value;
                  const password = (document.getElementById('password') as HTMLInputElement).value;
                  if (value !== password) {
                    setConfirmPasswordError("Passwords do not match");
                  } else {
                    setConfirmPasswordError("");
                  }
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? ( // Changed from 'showPassword' to 'showConfirmPassword'
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span>Create account</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or register with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => signIn("google", { callbackUrl: '/dashboard' })}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FcGoogle size={20} className="mr-2" />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}