/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Repeat, Edit3, Trash2, DollarSign } from 'lucide-react';
import { transactionsAPI, accountsAPI } from '../../../lib/api';

// Type definitions
interface Transaction {
  id: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  category: string;
  amount: string;
  description?: string;
  notes?: string;
  tags?: string[];
  transactionDate: string;
  accountId: string;
  account?: {
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface TransactionStats {
  totalIncome: string;
  totalExpense: string;
  netAmount: string;
  transactionCount: number;
}

interface TransactionFormData {
  accountId: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  category: string;
  amount: string;
  description: string;
  notes: string;
  tags: string[];
  transactionDate: string;
}

interface TransferFormData {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string;
  exchangeRate: string;
  fees: string;
  transactionDate: string;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    accountId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    sortBy: 'transactionDate',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const [formData, setFormData] = useState<TransactionFormData>({
    accountId: '',
    type: 'EXPENSE',
    category: '',
    amount: '',
    description: '',
    notes: '',
    tags: [],
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const [transferData, setTransferData] = useState<TransferFormData>({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    exchangeRate: '1.0',
    fees: '0',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const transactionTypes = [
    { value: 'EXPENSE', label: 'Expense', icon: ArrowDown, color: 'text-red-600' },
    { value: 'INCOME', label: 'Income', icon: ArrowUp, color: 'text-green-600' },
    { value: 'TRANSFER', label: 'Transfer', icon: Repeat, color: 'text-blue-600' }
  ];

  const expenseCategories = [
    'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
    'BILLS_UTILITIES', 'HEALTHCARE', 'EDUCATION', 'TRAVEL',
    'BUSINESS', 'PERSONAL_CARE', 'HOME_GARDEN', 'GIFTS_DONATIONS',
    'INVESTMENTS', 'TAXES', 'OTHER_EXPENSE'
  ];

  const incomeCategories = [
    'SALARY', 'FREELANCE', 'BUSINESS_INCOME', 'INVESTMENT_RETURNS',
    'RENTAL_INCOME', 'GIFTS_RECEIVED', 'REFUNDS', 'OTHER_INCOME'
  ];

  const transferCategories = [
    'SAVINGS_TRANSFER', 'ACCOUNT_TRANSFER', 'LOAN_PAYMENT', 'CREDIT_PAYMENT'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.values(filters).some(f => f !== '' && f !== 'transactionDate' && f !== 'desc')) {
      fetchTransactions();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, accountsData, statsData] = await Promise.all([
        transactionsAPI.getAll(),
        accountsAPI.getAll(),
        transactionsAPI.getStatistics()
      ]);

      
      setTransactions(transactionsData.data.data);
      setAccounts(accountsData.data);
      setStats(statsData.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch transactions data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const transactionsData = await transactionsAPI.getAll(params);
      setTransactions(transactionsData.data.data);
    } catch (err) {
      setError('Failed to fetch filtered transactions');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransferInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      };

      if (selectedTransaction) {
        await transactionsAPI.update(selectedTransaction.id, submitData);
      } else {
        await transactionsAPI.create(submitData);
      }

      await fetchData();
      resetForm();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to save transaction');
    }
  };

  const handleTransferSubmit = async () => {
    try {
      console.log('Submitting transfer with data:', transferData);
      await transactionsAPI.createTransfer(transferData);
      await fetchData();
      resetTransferForm();
      setShowTransferModal(false);
    } catch (err) {
      setError('Failed to create transfer');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      accountId: transaction.accountId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      notes: transaction.notes || '',
      tags: transaction.tags || [],
      transactionDate: transaction.transactionDate.split('T')[0]
    });
    setTagsInput((transaction.tags || []).join(', '));
    setShowEditModal(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsAPI.delete(transactionId);
        await fetchData();
      } catch (err) {
        setError('Failed to delete transaction');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      accountId: '',
      type: 'EXPENSE',
      category: '',
      amount: '',
      description: '',
      notes: '',
      tags: [],
      transactionDate: new Date().toISOString().split('T')[0]
    });
    setTagsInput('');
    setSelectedTransaction(null);
  };

  const resetTransferForm = () => {
    setTransferData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: '',
      exchangeRate: '1.0',
      fees: '0',
      transactionDate: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (amount: string) => {
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  const getTransactionIcon = (type: string) => {
    const typeInfo = transactionTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : ArrowUpDown;
  };

  const getTransactionColor = (type: string) => {
    const typeInfo = transactionTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.color : 'text-gray-600';
  };

  const getCategoriesForType = (type: string) => {
    switch (type) {
      case 'EXPENSE': return expenseCategories;
      case 'INCOME': return incomeCategories;
      case 'TRANSFER': return transferCategories;
      default: return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Track your income, expenses, and transfers</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Repeat size={20} />
              Transfer
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Transaction
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalIncome)}
                  </p>
                </div>
                <ArrowUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.totalExpense)}
                  </p>
                </div>
                <ArrowDown className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Flow</p>
                  <p className={`text-2xl font-bold ${Number(stats.netAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.netAmount)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.transactionCount}</p>
                </div>
                <ArrowUpDown className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <select
                name="accountId"
                value={filters.accountId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your finances by adding your first transaction</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">

                  {Array.isArray(transactions) && transactions.length > 0 ? (
                    transactions.map((transaction) => {
                      const IconComponent = getTransactionIcon(transaction.type);
                      const colorClass = getTransactionColor(transaction.type);

                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <IconComponent className={`h-5 w-5 mr-2 ${colorClass}`} />
                              <span className="text-sm font-medium text-gray-900">
                                {transaction.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description || 'No description'}
                            </div>
                            {transaction.tags && transaction.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {transaction.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                            {transaction.account?.name || 'Unknown Account'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {transaction.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`text-sm font-bold ${colorClass}`}>
                              {transaction.type === 'EXPENSE' && '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[95%] sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg text-gray-900 font-semibold mb-4">
                {selectedTransaction ? 'Edit Transaction' : 'Create New Transaction'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {transactionTypes.filter(t => t.value !== 'TRANSFER').map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {getCategoriesForType(formData.type).map(category => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={handleTagsChange}
                    placeholder="groceries, food, weekly"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedTransaction ? 'Update' : 'Create'} Transaction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg text-gray-900 font-semibold mb-4">Create Transfer</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                  <select
                    name="fromAccountId"
                    value={transferData.fromAccountId}
                    onChange={handleTransferInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select source account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                  <select
                    name="toAccountId"
                    value={transferData.toAccountId}
                    onChange={handleTransferInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select destination account</option>
                    {accounts.filter(account => account.id !== transferData.fromAccountId).map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={transferData.amount}
                    onChange={handleTransferInputChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={transferData.transactionDate}
                    onChange={handleTransferInputChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={transferData.description}
                    onChange={handleTransferInputChange}
                    placeholder="Transfer description"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate</label>
                    <input
                      type="number"
                      name="exchangeRate"
                      value={transferData.exchangeRate}
                      onChange={handleTransferInputChange}
                      step="0.000001"
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
                    <input
                      type="number"
                      name="fees"
                      value={transferData.fees}
                      onChange={handleTransferInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    resetTransferForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferSubmit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Create Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;