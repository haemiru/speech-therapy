import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { useNavigate } from 'react-router-dom';

function OralMotorGame() {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [treatsCollected, setTreatsCollected] = useState(0); // Start at 0 for testing properly
    const [showCelebration, setShowCelebration] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [currentTreat, setCurrentTreat] = useState(null);
    const [puppyScale, setPuppyScale] = useState(1);
    const [isEating, setIsEating] = useState(false);
    const requestRef = useRef();

    const treatImages = [
        '/treats/treat1.png',
        '/treats/treat2.png',
        '/treats/treat3.png',
        '/treats/treat4.png'
    ];

    // Load MediaPipe FaceLandmarker
    useEffect(() => {
        const loadModel = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                setFaceLandmarker(landmarker);
                console.log("Face Landmarker Loaded");
            } catch (error) {
                console.error("Error loading model:", error);
            }
        };
        loadModel();
    }, []);

    // Celebration Logic
    useEffect(() => {
        if (treatsCollected >= 10) {
            setShowCelebration(true);
            // Play a sound here if we add one later
            const timer = setTimeout(() => {
                setShowCelebration(false);
                setTreatsCollected(0); // Reset for another round
            }, 3000); // Show celebration for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [treatsCollected]);

    // Tracking Logic
    const trackFace = useCallback(() => {
        if (!faceLandmarker || !webcamRef.current || !webcamRef.current.video || showCelebration) return;
        const videoResult = webcamRef.current.video;

        if (videoResult.readyState >= 2 && isRecording) {
            const startTimeMs = performance.now();
            const results = faceLandmarker.detectForVideo(videoResult, startTimeMs);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];

                // Get key landmarks for mouth opening and face size
                const upperLip = landmarks[13];
                const lowerLip = landmarks[14];
                // Use face top/bottom or eye/chin distance for normalization to make it distance-independent
                const faceTop = landmarks[10];
                const faceBottom = landmarks[152];

                if (upperLip && lowerLip && faceTop && faceBottom) {
                    const mouthDistance = Math.abs(lowerLip.y - upperLip.y);
                    const faceHeight = Math.abs(faceBottom.y - faceTop.y);

                    // Normalize mouth opening by face height
                    const normalizedOpening = mouthDistance / faceHeight;

                    // console.log("Normalized Mouth Opening Score: ", normalizedOpening);

                    // Adjusted threshold based on normalized distance (~0.1 to 0.15 is typical for wide open)
                    if (normalizedOpening > 0.12) {
                        // Cooldown mechanism
                        const now = Date.now();
                        if (now - (window.lastTreatTime || 0) > 1000) { // 1 second cooldown
                            setTreatsCollected(prev => {
                                const nextVal = Math.min(prev + 1, 10);
                                if (nextVal === 10 && prev !== 10) {
                                    // Can trigger confetti here if a library is added
                                }
                                return nextVal;
                            });
                            window.lastTreatTime = now;
                        }
                    }
                }
            }
        }

        if (isRecording) {
            requestRef.current = requestAnimationFrame(trackFace);
        }
    }, [faceLandmarker, isRecording, showCelebration]);

    useEffect(() => {
        if (treatsCollected === 10 && !showCelebration) {
            const randomTreat = treatImages[Math.floor(Math.random() * treatImages.length)];
            setCurrentTreat(randomTreat);
            setShowCelebration(true);
            setIsEating(false);

            // Animation sequence
            setTimeout(() => setIsEating(true), 1500); // Wait briefly so user sees the treat
            setTimeout(() => setPuppyScale(prev => Math.min(prev + 0.15, 1.4)), 2200); // Dog grows after eating
        }
    }, [treatsCollected, showCelebration]);

    useEffect(() => {
        if (isRecording) {
            requestRef.current = requestAnimationFrame(trackFace);
        } else if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isRecording, trackFace]);

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording, post metrics to backend
            try {
                await fetch('http://localhost:3001/api/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        childId: 'Leo Thompson',
                        exerciseType: 'Oral Motor Training',
                        accuracy: (treatsCollected / 10) * 100 // Might want to send total rounds won instead later
                    })
                });
            } catch (err) {
                console.error("Failed to save metric", err);
            }
        }
        setIsRecording(!isRecording);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">

            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between">
                <button onClick={() => navigate('/')} className="flex flex-1 items-center gap-2 text-left group cursor-pointer focus:outline-none active:scale-[0.98] transition-all">
                    <div className="text-primary flex size-12 shrink-0 items-center justify-center rounded-full group-hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                    </div>
                    <div className="flex-1 px-2">
                        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">Puppy's Treat</h2>
                        <p className="text-primary text-xs font-bold uppercase tracking-wider">Exercise: 'Ah' Sound</p>
                    </div>
                </button>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={() => setShowSettings(true)} className="flex size-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-2 p-4">
                <div className="flex gap-6 justify-between items-end">
                    <p className="text-slate-700 dark:text-slate-300 text-base font-semibold">Treats Collected</p>
                    <p className="text-primary text-xl font-bold">{treatsCollected} <span className="text-sm text-slate-500">/ 10</span></p>
                </div>
                <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                    <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(treatsCollected / 10) * 100}%` }}></div>
                    {/* Celebration subtle flash on full bar */}
                    {showCelebration && <div className="absolute inset-0 bg-white/50 animate-pulse rounded-full"></div>}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-2">

                {/* Instruction Bubble */}
                <div className="bg-primary/20 border-2 border-primary/30 rounded-xl px-6 py-3 mb-6 relative transition-opacity duration-300" style={{ opacity: showCelebration ? 0 : 1 }}>
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 text-center uppercase tracking-tight">Open your mouth wide to give the puppy a treat!</h1>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/20 border-r-2 border-b-2 border-primary/30 rotate-45"></div>
                </div>

                {/* Central Puppy Image */}
                <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                    <div
                        className="w-full h-full bg-center bg-no-repeat bg-cover rounded-[3rem] shadow-xl border-4 border-white dark:border-slate-800 transition-transform duration-500 ease-in-out"
                        style={{
                            backgroundImage: `url('/pomeranian_new.png')`,
                            transform: `scale(${puppyScale})`
                        }}
                    ></div>

                    {/* Treat Plate & Eating Animation */}
                    {showCelebration && currentTreat && (
                        <div className="absolute z-10 bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-end h-full pointer-events-none">
                            <div className="relative flex justify-center w-full">
                                {/* The plate */}
                                <div className={`w-32 h-10 bg-white/80 backdrop-blur-sm rounded-[100%] border-b-4 border-slate-300 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-opacity duration-[800ms] ${isEating ? 'opacity-0' : 'opacity-100'}`} style={{ transform: 'rotateX(45deg)' }}></div>
                                {/* The treat */}
                                <img
                                    src={currentTreat}
                                    alt="Treat"
                                    className={`absolute bottom-2 w-20 h-20 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)] transition-all duration-700 ${isEating ? '-translate-y-28 scale-50 opacity-0' : 'translate-y-0 scale-100 opacity-100'}`}
                                    style={{ transitionTimingFunction: isEating ? 'cubic-bezier(0.55, 0.085, 0.68, 0.53)' : 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Celebration Text Overlay */}
                    {showCelebration && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center pointer-events-none pt-8">
                            <div className="flex flex-col items-center animate-in slide-in-from-top-10 fade-in duration-500">
                                <span className="material-symbols-outlined text-yellow-400 text-6xl mb-2 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                                <h3 className="text-white text-3xl font-black drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] text-center px-4">Great Job!</h3>
                                <p className="text-white text-base font-bold mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Puppy is happy!</p>
                                <button onClick={() => {
                                    setTreatsCollected(0);
                                    setShowCelebration(false);
                                    setIsEating(false);
                                }} className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-full shadow-lg pointer-events-auto transition-transform active:scale-95 animate-in zoom-in fade-in duration-500 delay-1000 border-2 border-white/50">
                                    Play Again!
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Picture-in-Picture Webcam */}
                    <div className="absolute -bottom-6 -right-2 w-28 aspect-[3/4] rounded-2xl border-4 border-primary bg-slate-900 overflow-hidden shadow-2xl z-10 flex">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-full z-20">
                            <div className={`size-2 rounded-full ${isRecording ? 'bg-primary animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-[8px] text-white font-bold uppercase">Live</span>
                        </div>
                    </div>

                </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-8 p-8 pb-12">
                <button onClick={() => navigate('/')} className="flex flex-col items-center gap-2 group">
                    <div className="flex shrink-0 items-center justify-center rounded-full size-14 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-active:scale-95 transition-transform shadow-sm">
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Quit</span>
                </button>

                <button onClick={toggleRecording} className="flex flex-col items-center gap-2 group">
                    <div className={`flex shrink-0 items-center justify-center rounded-full size-20 text-slate-900 shadow-[0_0_25px_rgba(43,238,108,0.5)] group-active:scale-95 transition-transform ${isRecording ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] text-white' : 'bg-primary'}`}>
                        <span className="material-symbols-outlined text-4xl font-bold">{isRecording ? "stop" : "videocam"}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">{isRecording ? "Stop" : "Record"}</span>
                </button>

                <button onClick={() => setShowTips(true)} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform">
                    <div className="flex shrink-0 items-center justify-center rounded-full size-14 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-3xl">lightbulb</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Tips</span>
                </button>
            </div>

            {/* Tips Modal/Overlay */}
            {showTips && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-[320px] w-full shadow-2xl relative border-4 border-slate-100 dark:border-slate-700">
                        <button onClick={() => setShowTips(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                            Helpful Tips
                        </h3>
                        <ul className="space-y-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">videocam</span>
                                <div><strong className="text-slate-900 dark:text-white block">1. Start Recording</strong> Click the 'Record' button below to begin.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">record_voice_over</span>
                                <div><strong className="text-slate-900 dark:text-white block">2. Action</strong> Open your mouth as wide as possible to feed the puppy!</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">stop_circle</span>
                                <div><strong className="text-slate-900 dark:text-white block">3. Finish</strong> Click 'Stop' when you are done collecting treats.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">stat_1</span>
                                <div><strong className="text-slate-900 dark:text-white block">Device Position</strong> Keep your camera at eye level.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">wb_sunny</span>
                                <div><strong className="text-slate-900 dark:text-white block">Lighting</strong> Ensure your face is well-lit and clearly visible.</div>
                            </li>
                        </ul>
                        <button onClick={() => setShowTips(false)} className="w-full mt-6 bg-primary hover:bg-primary/90 text-slate-900 font-bold text-lg py-3 rounded-2xl transition-colors shadow-lg shadow-primary/20">
                            Got it!
                        </button>
                    </div>
                </div>
            )}
            {/* Settings Modal */}
            {showSettings && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-[320px] w-full shadow-2xl relative border-4 border-slate-100 dark:border-slate-700">
                        <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
                            Settings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sound Effects</span>
                                <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</span>
                                <span className="text-sm font-bold text-primary">Normal</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-4 text-center">More settings API coming soon!</div>
                        </div>
                        <button onClick={() => setShowSettings(false)} className="w-full mt-6 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-bold text-lg py-3 rounded-2xl transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OralMotorGame;
