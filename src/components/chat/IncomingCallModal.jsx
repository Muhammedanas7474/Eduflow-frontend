import React, { useEffect, useState } from "react";

const IncomingCallModal = ({ callerName, callerId, onAccept, onReject }) => {
    const [ringAnimation, setRingAnimation] = useState(true);

    // Pulse animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setRingAnimation(prev => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 rounded-3xl p-8 w-80 text-center border border-gray-700 shadow-2xl">
                {/* Animated ring */}
                <div className="relative w-28 h-28 mx-auto mb-6">
                    {/* Ripple rings */}
                    <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-green-500/10 animate-ping" style={{ animationDelay: "0.5s" }} />
                    {/* Avatar */}
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl shadow-xl">
                        👤
                    </div>
                </div>

                {/* Caller info */}
                <h3 className="text-white text-xl font-bold mb-1">
                    {callerName || `User ${callerId}`}
                </h3>
                <p className="text-gray-400 text-sm mb-8">
                    Incoming video call...
                </p>

                {/* Accept / Reject buttons */}
                <div className="flex items-center justify-center gap-8">
                    {/* Reject */}
                    <button
                        onClick={onReject}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all hover:shadow-lg hover:shadow-red-500/30 transform hover:scale-110"
                        title="Decline"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Accept */}
                    <button
                        onClick={onAccept}
                        className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center transition-all hover:shadow-lg hover:shadow-green-500/30 transform hover:scale-110 animate-pulse"
                        title="Accept"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </button>
                </div>

                <p className="text-gray-500 text-xs mt-6">
                    Decline &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Accept
                </p>
            </div>
        </div>
    );
};

export default IncomingCallModal;
