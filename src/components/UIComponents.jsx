import React from "react";

export const Button = ({ children, onClick, className = "", variant = "primary", ...props }) => {
    const baseStyle = "w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-neon text-black hover:bg-[#00cc7d] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]",
        outline: "border-2 border-neon text-neon hover:bg-neon hover:text-black",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ label, className = "", ...props }) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && <label className="block text-gray-400 text-sm font-medium mb-2 pl-1">{label}</label>}
            <input
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all placeholder-zinc-600"
                {...props}
            />
        </div>
    );
};

export const Select = ({ label, children, className = "", ...props }) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && <label className="block text-gray-400 text-sm font-medium mb-2 pl-1">{label}</label>}
            <select
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all appearance-none cursor-pointer"
                {...props}
            >
                {children}
            </select>
        </div>
    );
};

export const Card = ({ children, className = "", title }) => {
    return (
        <div className={`glass-card rounded-2xl p-8 shadow-neon ${className}`}>
            {title && <h2 className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>}
            {children}
        </div>
    );
};
