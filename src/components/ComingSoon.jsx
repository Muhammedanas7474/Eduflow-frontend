import React from "react";
import { Link } from "react-router-dom";

export default function ComingSoon({ title = "Feature", backPath = null }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
                {/* Animated Icon */}
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center animate-pulse">
                    <svg
                        className="w-12 h-12 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    {title}
                </h1>

                {/* Message */}
                <p className="text-zinc-400 mb-8">
                    We're working hard to bring you this feature.
                    Stay tuned for updates!
                </p>

                {/* Coming Soon Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-medium text-zinc-300">Coming Soon</span>
                </div>

                {/* Back Button */}
                {backPath && (
                    <div className="mt-8">
                        <Link
                            to={backPath}
                            className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
                        >
                            ← Go Back
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
