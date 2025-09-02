/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, DollarSign, CreditCard, Wallet, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { accountsAPI } from '../../../lib/api';

// Type definitions
interface Account {
    id: string;
    name: string;
    type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'CASH' | 'DIGITAL_WALLET';
    balance: string;
    currency: string;
    isActive: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

interface AccountSummary {
    totalBalance: string;
    totalAccounts: number;
    creditAvailable: string;
}

interface FormData {
    name: string;
    type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'CASH' | 'DIGITAL_WALLET';
    initialBalance: string;
    currency: string;
    description: string;
}

const AccountsPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [summary, setSummary] = useState<AccountSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [showBalances, setShowBalances] = useState(true);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        type: 'CHECKING',
        initialBalance: '',
        currency: 'USD',
        description: ''
    });

    const accountTypes = [
        { value: 'CHECKING', label: 'Checking Account', icon: DollarSign },
        { value: 'SAVINGS', label: 'Savings Account', icon: TrendingUp },
        { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
        { value: 'INVESTMENT', label: 'Investment Account', icon: TrendingUp },
        { value: 'CASH', label: 'Cash', icon: Wallet },
        { value: 'DIGITAL_WALLET', label: 'Digital Wallet', icon: Wallet }
    ];

    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

    useEffect(() => {
        document.title = "Accounts - Daily Expense";
        fetchData();
    }, []);

    const fetchData = async () => {
    try {
        setLoading(true);
        const [accountsData, summaryData] = await Promise.all([
            accountsAPI.getAll(),
            accountsAPI.getSummary()
        ]);
        
        // Check if the data is nested inside another property
        if (accountsData && accountsData.data) {
            setAccounts(accountsData.data);  // ← Use nested accounts array
        } else if (Array.isArray(accountsData)) {
            setAccounts(accountsData);  // ← Use direct array
        } else {           
            setAccounts([]);
        }
        
        setSummary(summaryData.data);
        
        // Remove this line - it will always show [] because setState is async
        // console.log('Accounts:', accounts);
        
    } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch accounts data');
    } finally {
        setLoading(false);
    }
};

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedAccount) {                
                // Update existing account
                await accountsAPI.update(selectedAccount.id, formData);
            } else {
                // Create new account
                await accountsAPI.create(formData);
            }

            await fetchData();
            resetForm();
            setShowCreateModal(false);
            setShowEditModal(false);
        } catch (err) {
            setError('Failed to save account');
        }
    };

    const handleEdit = (account: Account) => {
        setSelectedAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            initialBalance: account.balance.toString(),
            currency: account.currency,
            description: account.description || ''
        });
        setShowEditModal(true);
    };

    const handleDelete = async (accountId: string) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                await accountsAPI.delete(accountId);
                await fetchData();
            } catch (err) {
                setError('Failed to delete account');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'CHECKING',
            initialBalance: '',
            currency: 'USD',
            description: ''
        });
        setSelectedAccount(null);
    };

    const formatCurrency = (amount: string | number, currency = 'USD') => {
        if (!showBalances) return '****';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(Number(amount));
    };

    const getAccountTypeInfo = (type: string) => {
        return accountTypes.find(t => t.value === type) || accountTypes[0];
    };

    const getAccountTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            CHECKING: 'bg-blue-100 text-blue-800',
            SAVINGS: 'bg-green-100 text-green-800',
            CREDIT_CARD: 'bg-red-100 text-red-800',
            INVESTMENT: 'bg-purple-100 text-purple-800',
            CASH: 'bg-yellow-100 text-yellow-800',
            DIGITAL_WALLET: 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                        <div className="h-64 sm:h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accounts</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your financial accounts</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={() => setShowBalances(!showBalances)}
                            className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {showBalances ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                            {showBalances ? 'Hide' : 'Show'} Balances
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <Plus size={16} className="sm:w-5 sm:h-5" />
                            Add Account
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Balance</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-all">
                                        {formatCurrency(summary.totalBalance)}
                                    </p>
                                </div>
                                <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
                                    <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active Accounts</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{summary.totalAccounts}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                                    <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Credit Available</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-all">
                                        {formatCurrency(summary.creditAvailable || 0)}
                                    </p>
                                </div>
                                <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                                    <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accounts List */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Accounts</h2>
                    </div>

                    {accounts.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center">
                            <Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
                            <p className="text-gray-500 mb-4 text-sm sm:text-base">Get started by creating your first account</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                            >
                                Create Account
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Account
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Balance
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Currency
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {!accounts || !Array.isArray(accounts) || accounts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                    No accounts found
                                                </td>
                                            </tr>
                                        ) : (
                                            accounts.map((account) => {
                                                const typeInfo = getAccountTypeInfo(account.type);
                                                const IconComponent = typeInfo.icon;

                                                return (
                                                    <tr key={account.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                                                    <IconComponent className="h-5 w-5 text-gray-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {account.name}
                                                                    </div>
                                                                    {account.description && (
                                                                        <div className="text-sm text-gray-500">
                                                                            {account.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccountTypeColor(account.type)}`}
                                                            >
                                                                {typeInfo.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {formatCurrency(account.balance, account.currency)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{account.currency}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${account.isActive
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                                    }`}
                                                            >
                                                                {account.isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => handleEdit(account)}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(account.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden">
                                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
                                    {accounts.map((account) => {
                                        const typeInfo = getAccountTypeInfo(account.type);
                                        const IconComponent = typeInfo.icon;

                                        return (
                                            <div key={account.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                                {/* Account Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center flex-1 min-w-0">
                                                        <div className="p-2 bg-white rounded-lg mr-3 flex-shrink-0">
                                                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                                                {account.name}
                                                            </div>
                                                            {account.description && (
                                                                <div className="text-xs sm:text-sm text-gray-500 truncate">
                                                                    {account.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2 flex-shrink-0 ml-2">
                                                        <button
                                                            onClick={() => handleEdit(account)}
                                                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit3 size={14} className="sm:w-4 sm:h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(account.id)}
                                                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Account Details */}
                                                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Type</span>
                                                        <div className="mt-1">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccountTypeColor(account.type)}`}>
                                                                {typeInfo.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Status</span>
                                                        <div className="mt-1">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${account.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                                {account.isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Balance</span>
                                                        <div className="mt-1 font-medium text-gray-900 text-sm sm:text-base">
                                                            {formatCurrency(account.balance, account.currency)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Currency</span>
                                                        <div className="mt-1 font-medium text-gray-900">
                                                            {account.currency}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base sm:text-lg text-gray-700 font-semibold mb-4">
                                {selectedAccount ? 'Edit Account' : 'Create New Account'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    >
                                        {accountTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Initial Balance
                                    </label>
                                    <input
                                        type="number"
                                        name="initialBalance"
                                        value={formData.initialBalance}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Currency
                                    </label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency} value={currency}>
                                                {currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 text-sm sm:text-base order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base order-1 sm:order-2"
                                >
                                    {selectedAccount ? 'Update' : 'Create'} Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountsPage;