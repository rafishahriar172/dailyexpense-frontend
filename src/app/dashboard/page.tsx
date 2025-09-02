/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Loader2, RefreshCw } from "lucide-react";
import { useDashboardData } from "../../hooks/userDashboardData";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"]; // Extended color palette

// Format currency function
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Format month abbreviation
const formatMonth = (monthStr: string) => {
  const months: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
  };
  return months[monthStr] || monthStr;
};

// Custom tooltip with better styling and mobile optimization
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 sm:p-4 border border-gray-300 rounded-lg shadow-lg max-w-[200px] sm:max-w-none">
        <p className="text-gray-800 font-semibold mb-1 sm:mb-2 text-xs sm:text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs sm:text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data, loading, error, refetch } = useDashboardData();
  const { data: session } = useSession();

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    document.title = "Dashboard - Daily Expense";
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 px-4">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-indigo-600" />
        <span className="ml-2 mt-2 text-gray-600 font-medium text-sm sm:text-base text-center">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-red-800 font-semibold text-base sm:text-lg mb-2">Error loading dashboard</h2>
            <p className="text-red-700 mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={handleRefresh}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">No data available</p>
            <button
              onClick={handleRefresh}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
            >
              Refresh Data
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { balances, spendingByCategory, cashflowTrend, recentTransactions } = data;
  
  // Format the cashflow trend data for the chart
  const formattedCashflowTrend = cashflowTrend.map((item: { month: string; }) => ({
    ...item,
    month: formatMonth(item.month),
  }));

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome back, {session?.user?.name} 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Here&apos;s your financial overview for today</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          <RefreshCw size={14} className="sm:w-4 sm:h-4" />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200 border-gray-200">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-gray-600 text-xs sm:text-sm font-medium uppercase tracking-wide">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-all">
                {formatCurrency(balances.total)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200 border-green-200 bg-green-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-green-700 text-xs sm:text-sm font-medium uppercase tracking-wide">
                <ArrowUpCircle size={14} className="sm:w-4 sm:h-4" /> Income
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 break-all">
                {formatCurrency(balances.income)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200 border-red-200 bg-red-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-red-700 text-xs sm:text-sm font-medium uppercase tracking-wide">
                <ArrowDownCircle size={14} className="sm:w-4 sm:h-4" /> Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-800 break-all">
                {formatCurrency(balances.expenses)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-blue-700 text-xs sm:text-sm font-medium uppercase tracking-wide">
                <Wallet size={14} className="sm:w-4 sm:h-4" /> Budget Remaining
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 break-all">
                {formatCurrency(balances.budgetRemaining)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-gray-800 text-lg sm:text-xl">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-64 sm:h-72 lg:h-80 px-2 sm:px-6">
              {spendingByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="65%"
                      innerRadius="35%"
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {spendingByCategory.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '10px',
                        fontSize: '11px',
                        color: '#374151'
                      }}
                      className="text-xs sm:text-sm"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm sm:text-base">No spending data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-gray-800 text-lg sm:text-xl">Cash Flow Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-64 sm:h-72 lg:h-80 px-1 sm:px-6">
              {formattedCashflowTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={formattedCashflowTrend} 
                    margin={{ 
                      top: 5, 
                      right: 10, 
                      left: 10, 
                      bottom: 5 
                    }}
                  >
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#374151', fontSize: 10 }}
                      className="sm:text-xs"
                      axisLine={{ stroke: '#d1d5db' }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fill: '#374151', fontSize: 10 }}
                      className="sm:text-xs"
                      axisLine={{ stroke: '#d1d5db' }}
                      tickLine={{ stroke: '#d1d5db' }}
                      tickFormatter={(value) => `$${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '8px',
                        fontSize: '11px',
                        color: '#374151'
                      }}
                      className="text-xs sm:text-sm"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      className="sm:stroke-[3] sm:r-5"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}                       
                      activeDot={{ r: 5, fill: '#059669', className: 'sm:r-7' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      className="sm:stroke-[3] sm:r-5"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#dc2626', className: 'sm:r-7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm sm:text-base">No cash flow data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-gray-800 text-lg sm:text-xl">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {recentTransactions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentTransactions.map((tx: { 
                  id: Key | null | undefined; 
                  category: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; 
                  type: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; 
                  amount: number; 
                }) => (
                  <div key={tx.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-3 sm:px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors gap-1 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-800 font-medium text-sm sm:text-base">{tx.category}</span>
                      <span className="text-gray-500 text-xs sm:text-sm sm:ml-2">({tx.type})</span>
                    </div>
                    <span className={`font-semibold text-sm sm:text-base ${tx.amount < 0 ? "text-red-600" : "text-green-600"} self-start sm:self-auto`}>
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <p className="text-sm sm:text-base">No recent transactions available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}