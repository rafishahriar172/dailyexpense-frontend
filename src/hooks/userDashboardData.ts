/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI, accountsAPI, budgetsAPI } from '../lib/api';
import axios from 'axios';
import { stat } from 'fs';

export interface DashboardData {
  balances: {
    total: number;
    income: number;
    expenses: number;
    budgetRemaining: number;
  };
  spendingByCategory: Array<{ name: string; value: number }>;
  cashflowTrend: Array<{ month: string; income: number; expenses: number }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    category: string;
    amount: number;
    date: string;
  }>;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const source = axios.CancelToken.source(); // Move inside callback

    try {
      setLoading(true);
      setError(null);

      const [
        transactionsResponse,
        statisticsResponse,
        accountsSummaryResponse,
        budgetsSummaryResponse,
      ] = await Promise.all([
        transactionsAPI.getAll({ cancelToken: source.token }),
        transactionsAPI.getStatistics({ cancelToken: source.token }),
        accountsAPI.getSummary({ cancelToken: source.token }),
        budgetsAPI.getSummary({ cancelToken: source.token }),
      ]);

      
      // Helper function to safely extract data
      const extractData = (response: any, fallback: any = {}) => {
        if (response?.success) return response.data || fallback;
        return response || fallback;
      };

      const transactions = extractData(transactionsResponse.data.data, []);
      const statistics = extractData(statisticsResponse.data, {});
      const accountsSummary = extractData(accountsSummaryResponse.data, {});
      const budgetsSummary = extractData(budgetsSummaryResponse.data, {});      
      // Ensure transactions is an array

      console.log("budgetsSummary", budgetsSummary);
      
      const transactionsArray = Array.isArray(transactions) ? transactions : [];
      
      console.log(statistics);
      const processedData: DashboardData = {
        balances: {
          total: parseFloat(accountsSummary.totalBalance) || 0,
          income: statistics.totalIncome || 0,
          expenses: statistics.totalExpense || 0,
          budgetRemaining: budgetsSummary.remainingBudget || 0,
        },
        spendingByCategory:
          statistics.categoryBreakdown?.map((item: any) => ({
            name: item.category,
            value: parseFloat(item._sum.amount),
          })) || [],
        cashflowTrend:
          statistics.monthlyTrend?.map((item: any) => ({
            month: item.month,
            income: item.income,
            expenses: item.expenses,
          })) || [],
        recentTransactions: transactionsArray.slice(0, 4).map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          category: tx.category,
          amount: parseFloat(tx.amount),
          date: tx.transactionDate,
        })),
      };

      
      setData(processedData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (!axios.isCancel(err)) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : 'An error occurred while fetching data'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
