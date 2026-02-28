import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function VocalizationChallenge() {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(0);
    const [altitude, setAltitude] = useState(0);
    const [pitch, setPitch] = useState(0);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const requestRef = useRef(null);
    const startTimeRef = useRef(null);
    const lastActiveTimeRef = useRef(null);

    const startAudioProcessing = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

            analyserRef.current.fftSize = 256;
            microphoneRef.current.connect(analyserRef.current);

            setIsActive(true);
            startTimeRef.current = performance.now();
            lastActiveTimeRef.current = performance.now();
            processAudio();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Microphone access is required for this exercise.');
        }
    };

    const stopAudioProcessing = async () => {
        setIsActive(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (microphoneRef.current) microphoneRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();

        try {
            await fetch('http://localhost:3001/api/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childId: 'Leo Thompson',
                    exerciseType: 'Vocalization Balloon',
                    duration: duration,
                    intensity: pitch,
                    accuracy: Math.min((duration / 10) * 100, 100)
                })
            });
            console.log('Metrics saved successfully');
        } catch (error) {
            console.error('Failed to save metrics:', error);
        }
    };

    const processAudio = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate volume (average of frequencies)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const averageVolume = sum / dataArray.length;

        // Estimate pitch (rough approximation: find dominant frequency bin)
        let maxVal = 0;
        let maxIdx = 0;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > maxVal) {
                maxVal = dataArray[i];
                maxIdx = i;
            }
        }
        const nyquist = audioContextRef.current.sampleRate / 2;
        const estimatedPitch = (maxIdx / dataArray.length) * nyquist;

        if (averageVolume > 30) { // Threshold for "Vocalizing"
            const now = performance.now();
            const elapsed = (now - startTimeRef.current) / 1000;
            setDuration(elapsed);
            setAltitude(Math.floor(elapsed * 280)); // scale duration to altitude
            if (estimatedPitch > 50 && estimatedPitch < 1000) {
                setPitch(Math.floor(estimatedPitch));
            }
            lastActiveTimeRef.current = now;
        } else {
            // If silent for more than 1 second, reset or hold? Let's just hold the duration
            const now = performance.now();
            if (now - lastActiveTimeRef.current > 1000) {
                // Maybe end the challenge if they stop for too long
            }
        }

        if (isActive) {
            requestRef.current = requestAnimationFrame(processAudio);
        }
    };

    useEffect(() => {
        return () => stopAudioProcessing();
    }, []);

    const progressPercentage = Math.min((duration / 10) * 100, 100);

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
            <header className="flex items-center bg-white/80 backdrop-blur-md dark:bg-background-dark/80 p-4 sticky top-0 z-20 justify-between border-b border-slate-200 dark:border-slate-800">
                <div onClick={() => navigate('/')} className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Balloon Challenge</h2>
                <div className="flex w-10 items-center justify-end">
                    <button className="text-slate-900 dark:text-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </header>

            <main className="relative flex-1 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(to bottom, #1e293b, #334155, #475569)' }}>
                {/* Decorative Stars & Clouds */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute bg-white rounded-full w-1 h-1 top-10 left-10 opacity-60"></div>
                    <div className="absolute bg-white rounded-full w-2 h-2 top-24 left-32 opacity-80"></div>
                    <div className="absolute bg-white rounded-full w-1 h-1 top-40 left-60 opacity-40"></div>
                    <div className="absolute top-20 right-[-20px] opacity-30 text-white transform scale-150">
                        <span className="material-symbols-outlined text-[80px]">cloud</span>
                    </div>
                    <div className="absolute top-60 left-[-30px] opacity-20 text-white transform scale-125">
                        <span className="material-symbols-outlined text-[100px]">cloud</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 p-6 relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
                    <div className="flex gap-6 justify-between items-end">
                        <div>
                            <p className="text-white/80 text-xs font-medium uppercase tracking-widest">Exercise</p>
                            <p className="text-white text-xl font-bold leading-normal">Hold your 'Ahhh' sound</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary text-3xl font-bold leading-none">{duration.toFixed(1)}s</p>
                            <p className="text-white/60 text-xs mt-1">Goal: 10.0s</p>
                        </div>
                    </div>
                    <div className="relative h-4 w-full rounded-full bg-slate-700/50 overflow-hidden mt-2">
                        <div className="h-full rounded-full bg-primary shadow-[0_0_15px_rgba(43,238,108,0.6)] transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="flex flex-col items-center transition-transform duration-500 ease-out" style={{ transform: `translateY(-${Math.min(duration * 20, 200)}px)` }}>
                        <div className="relative w-48 h-48 mb-4">
                            {isActive && <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>}
                            <img className="w-full h-full object-contain relative z-10 drop-shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5hYr8ltwsGTYAjbQ7nW_LGtzg07dMNl-ORKJvtHT_MYJuH8N8qMdp8musR1rt1eBllp_7Ywh5XzceyZdfsKclNdt-CYAzw__fuYgWTfOqobm13RhheTGGnd_vqlmX6WgXs6KhCk15Gnjna2LITHjoR-ahDBijYv9b-viikGGjztTfr3ZrnPrO5BIdgoVnC_2UXcd4IxU-iv5P4gg6YEpPkZGsGM13gyn5q0SNl1lr0gshtdRCYEDylwsMs7MP6hTvZZA4OLYlFs0" alt="Balloon" />
                        </div>
                        {isActive && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-3 border border-white/20">
                                <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                                <span className="text-white font-medium text-sm">Microphone active</span>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 px-6 mt-12">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={stopAudioProcessing} disabled={!isActive} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-900 h-16 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50">
                                <span className="material-symbols-outlined">stop_circle</span> Stop
                            </button>
                            <button onClick={startAudioProcessing} disabled={isActive} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-slate-900 h-16 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50">
                                <span className="material-symbols-outlined">play_circle</span> Start
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-md mt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-white/10 p-4 rounded-xl border border-white/10">
                            <p className="text-white/60 text-xs font-medium uppercase mb-1">Current Altitude</p>
                            <p className="text-white text-2xl font-bold leading-tight">{altitude} ft</p>
                        </div>
                        <div className="flex-1 bg-white/10 p-4 rounded-xl border border-white/10">
                            <p className="text-white/60 text-xs font-medium uppercase mb-1">Max Pitch</p>
                            <p className="text-white text-2xl font-bold leading-tight">{pitch} Hz</p>
                        </div>
                    </div>
                </div>
            </main>

            <nav className="flex gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 pb-6 pt-2">
                <a className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-900 dark:text-slate-100" href="#">
                    <span className="material-symbols-outlined text-[24px]">sports_esports</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Exercise</p>
                </a>
                <a className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500" href="#">
                    <span className="material-symbols-outlined text-[24px]">leaderboard</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Progress</p>
                </a>
            </nav>
        </div>
    );
}

export default VocalizationChallenge;
