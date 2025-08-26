"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import { budgetsAPI } from '@/lib/api';

interface Budget {
    id: string;
    name: string;
    category: string;
    amount: number;
    spent: number;
    period: 'weekly' | 'monthly' | 'yearly';
    startDate: string; // ISO date string
    endDate: string;   // ISO date string
    isActive: boolean;
}

interface BudgetSummary {
    totalBudgeted: number;
    remainingBudget: number;
    totalSpent: number;
    activeBudgets: number;
}

interface BudgetAlert {
    message: string;
    budgetName: string;
    spent: number;
    amount: number;
}

const categories = [
    "FOOD_DINING", "TRANSPORTATION", "SHOPPING", "ENTERTAINMENT", "BILLS_UTILITIES",
    "HEALTHCARE", "EDUCATION", "TRAVEL", "BUSINESS", "PERSONAL_CARE", "HOME_GARDEN",
    "GIFTS_DONATIONS", "INVESTMENTS", "TAXES", "OTHER_EXPENSE", "SALARY", "FREELANCE",
    "BUSINESS_INCOME", "INVESTMENT_RETURNS", "RENTAL_INCOME", "GIFTS_RECEIVED", "REFUNDS",
    "OTHER_INCOME", "SAVINGS_TRANSFER", "ACCOUNT_TRANSFER", "LOAN_PAYMENT", "CREDIT_PAYMENT"
];

const BudgetPage = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: categories[0],
        amount: '',
        period: 'monthly',
        startDate: '',
        endDate: ''
    });

    const periods = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetsRes, summaryRes, alertsRes] = await Promise.all([
                budgetsAPI.getAll(),
                budgetsAPI.getSummary(),
                budgetsAPI.getAlerts()
            ]);

            setBudgets(budgetsRes.data);
            setSummary(summaryRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error('Error fetching budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBudget = async () => {
        if (!formData.name || !formData.amount || !formData.startDate || !formData.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            console.log('Creating budget with data:', formData);
            await budgetsAPI.create({
                ...formData,
                amount: parseFloat(formData.amount)
            });
            setShowCreateModal(false);
            setFormData({
                name: '',
                category: 'FOOD',
                amount: '',
                period: 'monthly',
                startDate: '',
                endDate: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error creating budget:', error);
        }
    };

    const handleEditBudget = async () => {
        if (!selectedBudget) return; // ✅ prevents "possibly null"

        if (!formData.name || !formData.amount || !formData.startDate || !formData.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await budgetsAPI.update(selectedBudget.id, {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            setShowEditModal(false);
            setSelectedBudget(null);
            fetchData();
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };


    const handleDeleteBudget = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await budgetsAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting budget:', error);
            }
        }
    };

    const openEditModal = (budget: Budget) => {
        setSelectedBudget(budget);
        setFormData({
            name: budget.name,
            category: budget.category,
            amount: budget.amount.toString(),
            period: budget.period,
            startDate: budget.startDate.split('T')[0],
            endDate: budget.endDate.split('T')[0]
        });
        setShowEditModal(true);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const formatCurrency = (amount: number) => {
        if (isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                            <p className="text-gray-600 mt-2">Track and manage your spending budgets</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Create Budget
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalBudgeted}</p>
                                </div>
                                <Target className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Remaining Budget</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.remainingBudget)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalSpent)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Budgets</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.activeBudgets}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-orange-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerts */}
                {alerts && alerts.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Alerts</h2>
                        <div className="space-y-3">
                            {alerts.map((alert, index) => (
                                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <div className="flex-1">
                                        <p className="text-red-800 font-medium">{alert.message}</p>
                                        <p className="text-red-600 text-sm">{alert.budgetName} - {formatCurrency(alert.spent)} of {formatCurrency(alert.amount)} spent</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Budget Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.length > 0 && budgets.map((budget) => {
                        const spentPercentage = (budget.spent / budget.amount) * 100;
                        const isOverBudget = spentPercentage > 100;

                        return (
                            <div key={budget.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{budget.category.toLowerCase().replace('_', ' ')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(budget)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBudget(budget.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Spent</span>
                                            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                                                {formatCurrency(budget.spent)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Budget</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(budget.amount)}</span>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(spentPercentage)}`}
                                                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Progress</span>
                                            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                                                {spentPercentage.toFixed(1)}%
                                            </span>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Period: {budget.period}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${budget.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {budget.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {budgets.length === 0 && (
                    <div className="text-center py-12">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets found</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first budget</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Budget
                        </button>
                    </div>
                )}
            </div>

            {/* Create Budget Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Create New Budget</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                                <select
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {periods.map(period => (
                                        <option key={period.value} value={period.value}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData({
                                            name: '',
                                            category: 'FOOD',
                                            amount: '',
                                            period: 'monthly',
                                            startDate: '',
                                            endDate: ''
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateBudget}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Budget
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Budget Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Edit Budget</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                                <select
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {periods.map(period => (
                                        <option key={period.value} value={period.value}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEditBudget}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update Budget
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetPage;