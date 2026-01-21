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
    <div className="p-6 text-white h-full overflow-y-auto">
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

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-700">
              <th className="p-3 text-sm font-semibold text-gray-300">{t('Item')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-48">{t('Category')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-32">{t('Amount (NPR)')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-32">{t('Status')}</th>
              <th className="p-3 text-sm font-semibold text-gray-300 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="p-2"><input type="text" value={exp.item} onChange={(e) => updateExpense(exp.id, 'item', e.target.value)} className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm" placeholder={t('Item')} /></td>
                <td className="p-2">
                  <select value={exp.category} onChange={(e) => updateExpense(exp.id, 'category', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm">
                    <option value="Food/Khaja">Food/Khaja</option>
                    <option value="Travel/Yatayat">Travel/Yatayat</option>
                    <option value="Props/Samagri">Props/Samagri</option>
                    <option value="Location/Sthan">Location/Sthan</option>
                    <option value="Cast/Kalakar">Cast/Kalakar</option>
                    <option value="Crew/Prabidhik">Crew/Prabidhik</option>
                    <option value="Misc/Vividh">Misc/Vividh</option>
                  </select>
                </td>
                <td className="p-2"><input type="number" value={exp.amount} onChange={(e) => updateExpense(exp.id, 'amount', e.target.value)} className="w-full bg-transparent border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm" placeholder="0" /></td>
                <td className="p-2">
                   <select value={exp.status} onChange={(e) => updateExpense(exp.id, 'status', e.target.value)} className={`w-full border border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:outline-none text-sm ${exp.status === 'Paid' ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'}`}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </td>
                <td className="p-2 text-center"><button onClick={() => deleteExpense(exp.id)} className="text-gray-500 hover:text-red-500 transition-colors">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Budget