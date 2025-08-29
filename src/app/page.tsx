"use client";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth/login");
  };

  return (
    <div className="font-sans gp-6 bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Daily Expense
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Track your expenses, set budgets, and achieve your financial goals
          </p>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Expenses Tracked
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                  10,000+
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Money Saved
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                  $2.5M+
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Happy Users
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                  5,000+
                </dd>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-10">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleGetStarted}>
              Get Started Today
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
