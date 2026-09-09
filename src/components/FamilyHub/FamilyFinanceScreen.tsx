import React, { useState } from 'react';
import type { FinanceTransaction, SavingsTarget } from '../../types/family';
import { ArrowLeft, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';


interface FamilyFinanceScreenProps {
  transactions: FinanceTransaction[];
  savingsTargets: SavingsTarget[];
  onAddTransaction: (type: 'income' | 'expense', amount: number, category: string, note: string) => void;
  onDepositSavings: (id: string, amount: number) => void;
  onBack: () => void;
}

export const FamilyFinanceScreen: React.FC<FamilyFinanceScreenProps> = ({
  transactions,
  savingsTargets,
  onAddTransaction,
  onDepositSavings,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'savings' | 'kids_money'>('finance');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount);
    if (!num || isNaN(num) || !note.trim()) return;

    onAddTransaction(type, num, type === 'income' ? 'Pemasukan' : 'Pengeluaran', note.trim());
    setAmount('');
    setNote('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6 animate-pop-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <span>💰</span> Keuangan & Belajar Uang
        </h2>

        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'finance' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Keuangan Bulanan
        </button>
        <button
          onClick={() => setActiveTab('savings')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'savings' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Target Tabungan
        </button>
        <button
          onClick={() => setActiveTab('kids_money')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kids_money' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Belajar Uang Anak
        </button>
      </div>

      {/* Tab 1: Finance Summary */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-3xl text-white shadow-bubbly-teal flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-white/20">
                SALDO KELUARGA
              </span>
              <h3 className="font-display font-black text-3xl mt-1">
                Rp {balance.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-teal-100 mt-1">
                Pemasukan: Rp {totalIncome.toLocaleString('id-ID')} | Pengeluaran: Rp {totalExpense.toLocaleString('id-ID')}
              </p>
            </div>
            <Wallet className="w-12 h-12 text-teal-200" />
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddTransaction} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                - Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                + Pemasukan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="number"
                required
                placeholder="Jumlah (Rp)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
              <input
                type="text"
                required
                placeholder="Catatan (misal: Beli Buah)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs">
              Simpan Transaksi
            </button>
          </form>

          {/* Transactions List */}
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {t.type === 'income' ? (
                    <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{t.note}</p>
                    <p className="text-[10px] text-slate-400">{t.date}</p>
                  </div>
                </div>
                <span className={`font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Savings Targets */}
      {activeTab === 'savings' && (
        <div className="space-y-3">
          {savingsTargets.map(s => {
            const percent = Math.min(100, Math.round((s.currentAmount / s.targetAmount) * 100));

            return (
              <div key={s.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-black text-base text-slate-800 dark:text-slate-100">{s.title}</h4>
                  <span className="text-xs font-bold text-teal-600">{percent}% Tercapai</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Terkumpul: Rp {s.currentAmount.toLocaleString('id-ID')}</span>
                  <span>Target: Rp {s.targetAmount.toLocaleString('id-ID')}</span>
                </div>

                <button
                  onClick={() => onDepositSavings(s.id, 50000)}
                  className="w-full py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nabung +Rp 50.000 ke Celengan</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Kids Money */}
      {activeTab === 'kids_money' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-amber-200 dark:border-slate-700 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <span className="text-4xl block animate-bounce">🪙</span>
          <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
            Belajar Cerdas Finansial untuk Anak
          </h3>
          <p className="leading-relaxed">
            Ajarkan anak 3 prinsip sederhana mengelola uang saku:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
              <span className="text-2xl">💰</span>
              <h4 className="font-bold font-display text-sm mt-1">1. Belanja Bijak (Spend)</h4>
              <p className="text-[11px] text-slate-500 mt-1">Hanya untuk kebutuhan sekolah dan hal bermanfaat.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200">
              <span className="text-2xl">🏦</span>
              <h4 className="font-bold font-display text-sm mt-1">2. Tabungan Impian (Save)</h4>
              <p className="text-[11px] text-slate-500 mt-1">Sisihkan minimal 20% uang saku untuk masa depan.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
              <span className="text-2xl">❤️</span>
              <h4 className="font-bold font-display text-sm mt-1">3. Sedekah & Berbagi (Share)</h4>
              <p className="text-[11px] text-slate-500 mt-1">Membantu teman atau sesama yang membutuhkan.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
