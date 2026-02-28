import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import OralMotorGame from './OralMotorGame';
import VocalizationChallenge from './VocalizationChallenge';
import TherapyProgressDashboard from './TherapyProgressDashboard';
import SLPManagementHub from './SLPManagementHub';

function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display text-slate-800 dark:text-slate-100 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center size-20 bg-primary/20 text-primary rounded-3xl mb-6 shadow-sm rotate-3">
                        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                        Speech <span className="text-primary">Therapy</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
                        Welcome to the interactive portal. Choose a module below to start training, view progress, or manage your patients.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Oral Motor Game Card */}
                    <a href="/oral-motor" className="group block h-full">
                        <div className="h-full bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 flex flex-col items-center text-center">
                            <div className="size-16 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Oral Motor Game</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm flex-1 leading-relaxed">
                                Practice lip and jaw movements with our AI-powered puppy. Open wide to collect treats!
                            </p>
                        </div>
                    </a>

                    {/* Vocalization Challenge Card */}
                    <a href="/vocalization" className="group block h-full">
                        <div className="h-full bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 flex flex-col items-center text-center">
                            <div className="size-16 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>air</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Vocalization Challenge</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm flex-1 leading-relaxed">
                                Control a hot air balloon with your voice. Sustain sounds to fly higher and avoid obstacles.
                            </p>
                        </div>
                    </a>

                    {/* Progress Dashboard Card */}
                    <a href="/dashboard" className="group block h-full">
                        <div className="h-full bg-slate-900 dark:bg-slate-950 p-8 rounded-[2rem] shadow-xl shadow-slate-900/20 border border-slate-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-900/40 flex flex-col items-center text-center">
                            <div className="size-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-white">My Therapy Dashboard</h2>
                            <p className="text-slate-400 text-sm flex-1 leading-relaxed">
                                View your daily streaks, AI observations, and track your speech improvement over time.
                            </p>
                        </div>
                    </a>

                    {/* SLP Hub Card */}
                    <a href="/slp-hub" className="group block h-full">
                        <div className="h-full bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 flex flex-col items-center text-center">
                            <div className="size-16 rounded-2xl bg-purple-100 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">SLP Management Hub</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm flex-1 leading-relaxed">
                                Tools for Speech-Language Pathologists to manage patients, review metrics, and upgrade plans.
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

const initialOptions = {
    "client-id": "AZHQjmleZ3U8ZCMXeKeFC0QLuqPqFMfz8Cyy8Cy-eepWzytN8eOikUim9nrvGKgRlf1lwHb-yg5IbH88",
    currency: "USD",
    intent: "capture",
};

function App() {
    return (
        <PayPalScriptProvider options={initialOptions}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/oral-motor" element={<OralMotorGame />} />
                    <Route path="/vocalization" element={<VocalizationChallenge />} />
                    <Route path="/dashboard" element={<TherapyProgressDashboard />} />
                    <Route path="/slp-hub" element={<SLPManagementHub />} />
                </Routes>
            </BrowserRouter>
        </PayPalScriptProvider>
    );
}

export default App;
