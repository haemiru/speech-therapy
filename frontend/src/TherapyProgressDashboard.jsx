import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TherapyProgressDashboard() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/metrics?childId=Leo%20Thompson');
                const data = await response.json();
                setMetrics(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch metrics", error);
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const speechAttempts = metrics.length;
    const avgAccuracy = metrics.length > 0 ? Math.round(metrics.reduce((acc, m) => acc + m.accuracy, 0) / metrics.length) : 0;
    const avgDuration = metrics.length > 0 ? (metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length).toFixed(1) : 0;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full max-w-[430px] mx-auto flex-col overflow-x-hidden pb-24 shadow-2xl bg-background-light dark:bg-background-dark antialiased">
                {/* Header Section */}
                <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800">
                    <div onClick={() => navigate('/')} className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Therapy Progress</h2>
                    <div className="flex w-10 items-center justify-end">
                        <button className="flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">account_circle</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-background-light dark:bg-background-dark sticky top-[57px] z-10 border-b border-slate-200 dark:border-slate-800 px-4">
                    <div className="flex gap-8">
                        <a className="flex flex-col items-center justify-center border-b-2 border-primary text-slate-900 dark:text-slate-100 pb-3 pt-4" href="#">
                            <p className="text-sm font-bold">Daily Stats</p>
                        </a>
                        <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-3 pt-4" href="#">
                            <p className="text-sm font-medium">Long-term Trends</p>
                        </a>
                    </div>
                </div>

                {/* Summary Banner Card */}
                <div className="p-4">
                    <div className="bg-slate-900 dark:bg-primary/20 rounded-xl p-5 text-white flex justify-between items-center overflow-hidden relative shadow-md">
                        <div className="z-10">
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Weekly Streak</p>
                            <h3 className="text-2xl font-bold">5 Day Success!</h3>
                            <p className="text-sm mt-1 text-primary">Leo is making great progress</p>
                        </div>
                        <div className="z-10 bg-white/10 p-3 rounded-full backdrop-blur-sm">
                            <span className="material-symbols-outlined text-primary text-3xl">star</span>
                        </div>
                        <div className="absolute right-[-10%] top-[-20%] w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Metric Grid */}
                <div className="px-4 pb-2">
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight mb-4">Today's Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <span className="material-symbols-outlined text-primary text-xl">forum</span>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">+15%</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Speech Attempts</p>
                            <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight">{loading ? '-' : speechAttempts}</p>
                        </div>

                        <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <span className="material-symbols-outlined text-blue-500 text-xl">record_voice_over</span>
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">+2%</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Vowel Accuracy</p>
                            <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight">{loading ? '-' : `${avgAccuracy}%`}</p>
                        </div>

                        <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <span className="material-symbols-outlined text-orange-500 text-xl">timer</span>
                                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">-0.1s</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Phonation</p>
                            <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight">{loading ? '-' : `${avgDuration}s`}</p>
                        </div>

                        <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <span className="material-symbols-outlined text-purple-500 text-xl">celebration</span>
                                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">New</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Game Rewards</p>
                            <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight">12</p>
                        </div>
                    </div>
                </div>

                {/* Activity Chart Placeholder */}
                <div className="p-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Daily Activity</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Speech intensity over time</p>
                            </div>
                            <select className="text-xs border-slate-200 dark:border-slate-700 rounded-lg bg-background-light dark:bg-slate-900 p-1">
                                <option>Today</option>
                                <option>Yesterday</option>
                            </select>
                        </div>
                        {/* Mock Chart Visualization */}
                        <div className="h-40 w-full flex items-end justify-between gap-1 px-2">
                            <div className="w-full bg-primary/20 rounded-t-lg h-[40%]"></div>
                            <div className="w-full bg-primary/40 rounded-t-lg h-[60%]"></div>
                            <div className="w-full bg-primary/20 rounded-t-lg h-[30%]"></div>
                            <div className="w-full bg-primary/60 rounded-t-lg h-[85%]"></div>
                            <div className="w-full bg-primary rounded-t-lg h-[100%]"></div>
                            <div className="w-full bg-primary/40 rounded-t-lg h-[55%]"></div>
                            <div className="w-full bg-primary/20 rounded-t-lg h-[45%]"></div>
                            <div className="w-full bg-primary/30 rounded-t-lg h-[70%]"></div>
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[10px] text-slate-400">9AM</span>
                            <span className="text-[10px] text-slate-400">12PM</span>
                            <span className="text-[10px] text-slate-400">3PM</span>
                            <span className="text-[10px] text-slate-400">6PM</span>
                            <span className="text-[10px] text-slate-400">9PM</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Feedback List */}
                <div className="px-4 pb-4">
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight mb-4">AI Observations</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined">psychology</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold">Vowel 'ah' improved</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consistent clarity detected during the "Farm Adventure" module.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                                <span className="material-symbols-outlined">priority_high</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold">Duration Alert</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Slight decrease in sustained phonation compared to last session.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Bar */}
                <div className="fixed bottom-0 w-full max-w-[430px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
                    <div className="flex h-16 items-center justify-around px-2">
                        <a className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/')}>
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-[10px] font-medium uppercase tracking-tighter">Home</span>
                        </a>
                        <a className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">sports_esports</span>
                            <span className="text-[10px] font-medium uppercase tracking-tighter">Exercises</span>
                        </a>
                        <a className="flex flex-col items-center gap-1 text-primary cursor-pointer">
                            <span className="material-symbols-outlined font-bold fill-[1]">analytics</span>
                            <span className="text-[10px] font-medium uppercase tracking-tighter">Reports</span>
                        </a>
                        <a className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-[10px] font-medium uppercase tracking-tighter">Settings</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TherapyProgressDashboard;
