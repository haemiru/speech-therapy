import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PremiumSubscription from './PremiumSubscription';

function SLPManagementHub() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/metrics?childId=Leo%20Thompson');
                const data = await response.json();
                setMetrics(data);
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            }
        };
        fetchMetrics();
    }, []);

    const leoAvgAccuracy = metrics.length > 0 ? Math.round(metrics.reduce((acc, m) => acc + m.accuracy, 0) / metrics.length) : 0;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col items-center">
            <div className="w-full max-w-[430px] flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark shadow-2xl relative">
                <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-2 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div onClick={() => navigate('/')} className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/30 transition-colors">
                                <span className="material-symbols-outlined cursor-pointer">arrow_back</span>
                            </div>
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">psychology</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold leading-tight">SLP Hub</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back, Dr. Sarah</p>
                            </div>
                        </div>
                        <button className="size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-6 space-y-8 pb-32">
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold">Weekly Schedule</h2>
                            <div className="flex gap-1">
                                <button className="p-1"><span className="material-symbols-outlined text-slate-400">chevron_left</span></button>
                                <span className="text-sm font-medium px-2 py-1">Oct 16 - 22</span>
                                <button className="p-1"><span className="material-symbols-outlined text-slate-400">chevron_right</span></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            <p className="text-[10px] uppercase font-bold text-slate-400 text-center">Mon</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 text-center">Tue</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 text-center">Wed</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 text-center">Thu</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 text-center">Fri</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 text-center">Sat</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 text-center">Sun</p>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            <button className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <span className="text-sm">16</span>
                                <div className="size-1 bg-primary rounded-full mt-1"></div>
                            </button>
                            <button className="aspect-square flex flex-col items-center justify-center rounded-lg bg-primary text-slate-900 font-bold shadow-md shadow-primary/20">
                                <span className="text-sm">17</span>
                                <div className="size-1 bg-slate-900 rounded-full mt-1"></div>
                            </button>
                            <button className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                <span className="text-sm">18</span>
                                <div className="size-1 bg-primary rounded-full mt-1"></div>
                            </button>
                            <button className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                <span className="text-sm">19</span>
                            </button>
                            <button className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                <span className="text-sm">20</span>
                                <div className="size-1 bg-primary rounded-full mt-1"></div>
                            </button>
                            <button className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 opacity-40">
                                <span className="text-sm">21</span>
                            </button>
                            <button className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 opacity-40">
                                <span className="text-sm">22</span>
                            </button>
                        </div>
                    </section>

                    <section>
                        <button className="w-full bg-primary text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                            <span className="material-symbols-outlined fill-1">play_circle</span>
                            Start Quick Session Recording
                        </button>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Assigned Children</h2>
                            <button className="text-primary text-sm font-medium">View all</button>
                        </div>

                        <div className="space-y-3">
                            <div onClick={() => navigate('/dashboard')} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors">
                                <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                    <img className="w-full h-full object-cover" data-alt="Profile picture of a smiling child" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZVEqsWSFXqVfbd32BTIldL0mDN25Zf36YyL3RrWkANNTtYPhvyZAMXFYP-IPi-cCUEHi3COItRfC89o1pvlZiKRJqamPEdyRn7AYfWY3qwzisT6-jkFhugnHeHI_8cArwPg6AIpNw44I2AM8RLRFziPtF8nxjSjfYI0pcWjtGwAPOgtXl9HfQI4QGL0TdjVYhOxy8KP3wNz2XcLE9F1ps-Jh_333BZGOHATyUym-R4NXZ2y7IDrcfxJTBGnZxBcvp0ykcPCQu04U" alt="Leo Thompson" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate">Leo Thompson</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Next: Tomorrow, 10:00 AM</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50">In Progress</span>
                                        <span className="text-[10px] text-slate-400 font-medium">IEP: {leoAvgAccuracy || 65}% Achieved</span>
                                    </div>
                                </div>
                                <button className="size-8 rounded-full flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                    <img className="w-full h-full object-cover" data-alt="Profile picture of a young girl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo9cj5P8fE-pJp_GQZzZ0HBEwFJXlzkSjuaE4k-iyVzto2vpYw_yZObPIj58VoH8xesNev_bTZPd1apWakEujaqO8eJ-ByjrekaJB6xDmpm5F4g0GZEHVVzQiYuTWpFllljBZ4wPn9q_lF50oNzD9dpVxYJzjThqhoBGORu7z5Dkz0Kyna7SMcGJvoQ7TC84EeXeFLHCGF7YMU50Nxw-KxY_O509fsWONvpFy6oFKXowBxD2NLPy8tgGj9I8_abzbpU802rhwnQH8" alt="Mia Rodriguez" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate">Mia Rodriguez</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Next: Friday, 2:30 PM</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-emerald-700 dark:text-primary border border-primary/20">Achieved</span>
                                        <span className="text-[10px] text-slate-400 font-medium">IEP: 100% Achieved</span>
                                    </div>
                                </div>
                                <button className="size-8 rounded-full flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900 dark:bg-slate-800 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-7xl">receipt_long</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-slate-400 text-sm font-medium mb-1">Billing Summary</h3>
                            <p className="text-2xl font-bold mb-4">$4,280.00</p>
                            <div className="flex items-center justify-between text-xs border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-slate-400">Pending Invoices</p>
                                    <p className="font-bold text-primary">12 Active</p>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors font-medium cursor-pointer">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6">
                        <PremiumSubscription />
                    </section>
                </main>

                <nav className="absolute w-full bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-8 pt-3 px-6 flex justify-between items-center z-50">
                    <a onClick={() => navigate('/')} className="flex flex-col items-center gap-1 group cursor-pointer hover:opacity-80">
                        <span className="material-symbols-outlined text-primary font-variation-settings-'FILL' 1">dashboard</span>
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Home</span>
                    </a>
                    <a className="flex flex-col items-center gap-1 group cursor-pointer">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">calendar_month</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Schedule</span>
                    </a>
                    <a className="flex flex-col items-center gap-1 group cursor-pointer">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">groups</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Children</span>
                    </a>
                    <a className="flex flex-col items-center gap-1 group cursor-pointer">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">payments</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Billing</span>
                    </a>
                    <a className="flex flex-col items-center gap-1 group cursor-pointer">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">settings</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Settings</span>
                    </a>
                </nav>
            </div>
        </div>
    );
}

export default SLPManagementHub;
