'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'
import { supabase } from '../lib/supabase'

interface Expense {
  id: string
  item: string
  category: string
  amount: string
  status: string
}

interface BudgetProps {
  projectId?: string
}

const Budget = ({ projectId }: BudgetProps = {}) => {
  const { t } = useLanguage()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!projectId) {
        setExpenses([])
        setIsLoaded(true)
        return
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching expenses:', error)
      } else if (data) {
        setExpenses(data)
      }
      setIsLoaded(true)
    }
    fetchExpenses()
  }, [projectId])

  const addExpense = async () => {
    if (!projectId) return
    
    const newExpense = {
      project_id: projectId,
      item: '',
      category: 'Food/Khaja',
      amount: 0,
      status: 'Pending'
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(newExpense)
      .select()
      .single()

    if (error) {
      console.error('Error adding expense:', error)
    } else if (data) {
      setExpenses([data, ...expenses])
    }
  }

  const updateExpense = async (id: string, field: keyof Expense, value: string) => {
    // Optimistic update
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp))
    
    // Debounce could be added here, but for now we save directly
    await supabase.from('expenses').update({ [field]: value }).eq('id', id)
  }

  const deleteExpense = async (id: string) => {
    if (window.confirm(t('Are you sure you want to delete this item?'))) {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (!error) {
        setExpenses(expenses.filter(exp => exp.id !== id))
      }
    }
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)

  return (
    <div className="p-6 text-gray-900 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('Budget')} & {t('Expenses')}</h2>
        <div className="text-xl font-bold bg-gray-700 px-4 py-2 rounded">
          {t('Total')}: NPR {totalAmount.toLocaleString()}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={addExpense}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          {t('Add Entry')}
        </button>
      </div>

      <div className="space-y-4">
        {/* Header for larger screens */}
        <div className="hidden md:grid grid-cols-[3fr,2fr,1fr,1fr,auto] gap-4 px-4 py-2 bg-gray-800 rounded-t-lg text-sm font-semibold text-gray-300">
          <div>{t('Item')}</div>
          <div>{t('Category')}</div>
          <div className="text-right">{t('Amount (NPR)')}</div>
          <div>{t('Status')}</div>
          <div></div>
        </div>
        {expenses.length > 0 ? expenses.map((exp) => (
          <div key={exp.id} className="bg-gray-800 md:bg-transparent md:grid md:grid-cols-[3fr,2fr,1fr,1fr,auto] gap-4 p-4 md:p-0 md:px-4 md:py-2 rounded-lg md:rounded-none border md:border-0 border-gray-700 items-center">
            {/* Item */}
            <div className="md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Item')}</label>
              <input type="text" value={exp.item} onChange={(e) => updateExpense(exp.id, 'item', e.target.value)} className="w-full bg-transparent md:bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm" placeholder={t('Item')} />
            </div>
            {/* Category */}
            <div className="mt-2 md:mt-0 md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Category')}</label>
              <select value={exp.category} onChange={(e) => updateExpense(exp.id, 'category', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm">
                <option value="Food/Khaja">Food/Khaja</option>
                <option value="Travel/Yatayat">Travel/Yatayat</option>
                <option value="Props/Samagri">Props/Samagri</option>
                <option value="Location/Sthan">Location/Sthan</option>
                <option value="Cast/Kalakar">Cast/Kalakar</option>
                <option value="Crew/Prabidhik">Crew/Prabidhik</option>
                <option value="Misc/Vividh">Misc/Vividh</option>
              </select>
            </div>
            {/* Amount */}
            <div className="mt-2 md:mt-0 md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Amount (NPR)')}</label>
              <input type="number" value={exp.amount} onChange={(e) => updateExpense(exp.id, 'amount', e.target.value)} className="w-full bg-transparent md:bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm md:text-right" placeholder="0" />
            </div>
            {/* Status */}
            <div className="mt-2 md:mt-0 md:p-2">
              <label className="md:hidden text-xs font-bold text-gray-400">{t('Status')}</label>
              <select value={exp.status} onChange={(e) => updateExpense(exp.id, 'status', e.target.value)} className={`w-full border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm ${exp.status === 'Paid' ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'}`}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            {/* Delete */}
            <div className="mt-4 md:mt-0 md:p-2 text-right md:text-center">
              <button onClick={() => deleteExpense(exp.id)} className="text-gray-500 hover:text-red-500 transition-colors">×</button>
            </div>
          </div>
        )) : (
          <div className="p-4 text-center text-gray-500">No expenses added yet.</div>
        )}
      </div>
    </div>
  )
}

export default Budget