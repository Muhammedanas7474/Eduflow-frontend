import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    toggleChat,
    closeChat,
    addUserMessage,
    sendDoubt,
    setActiveLessonId,
} from "../../store/slices/ragSlice";

/**
 * RAGChatbot — floating bot button + popup chat for lesson doubts.
 * Uses Redux for state, Tailwind for styling.
 */
export default function RAGChatbot({ courseId, lessonId, videoRef, lessonTitle }) {
    const dispatch = useDispatch();
    const { messages, loading, isOpen } = useSelector((state) => state.rag);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Sync lesson ID to redux
    useEffect(() => {
        dispatch(setActiveLessonId(lessonId));
    }, [lessonId, dispatch]);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleSend = () => {
        const question = input.trim();
        if (!question || loading || !lessonId) return;

        const currentTime = videoRef?.current?.currentTime || null;

        dispatch(addUserMessage(question));
        dispatch(sendDoubt({ courseId, lessonId, question, currentTime }));
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const jumpToTimestamp = (seconds) => {
        if (videoRef?.current) {
            videoRef.current.currentTime = seconds;
            videoRef.current.play();
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const suggestions = [
        "Summarize this lesson",
        "What are the key concepts?",
        "Explain the main topic",
    ];

    return (
        <>
            {/* ── Floating Action Button ── */}
            <button
                onClick={() => dispatch(toggleChat())}
                title="Ask AI about this lesson"
                className="fixed bottom-7 right-7 z-50 w-[60px] h-[60px] rounded-full flex items-center justify-center
                   bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/40
                   hover:scale-110 hover:shadow-xl hover:shadow-violet-600/50 transition-all duration-300
                   border-2 border-violet-500/30 cursor-pointer"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <span className="text-[28px] leading-none">🤖</span>
                )}
                {/* Pulse ring */}
                {!isOpen && messages.length === 0 && (
                    <span className="absolute inset-[-4px] rounded-full border-2 border-violet-500/60 animate-ping" />
                )}
            </button>

            {/* ── Chat Popup ── */}
            {isOpen && (
                <div className="fixed bottom-[100px] right-7 z-40 w-[400px] max-h-[560px] rounded-2xl overflow-hidden
                        flex flex-col bg-zinc-900 border border-indigo-500/25
                        shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4 duration-300
                        max-sm:w-[calc(100vw-24px)] max-sm:right-3 max-sm:bottom-[90px] max-sm:max-h-[70vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-violet-900 to-indigo-900 border-b border-violet-500/30">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/12 flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <div className="text-sm font-bold text-white">AI Lesson Assistant</div>
                                <div className="text-[11px] text-violet-300/80">
                                    Ask doubts about <span className="text-violet-200 font-semibold">{lessonTitle || "this lesson"}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => dispatch(closeChat())}
                            className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
                        >
                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[280px] max-h-[360px] scrollbar-thin scrollbar-thumb-white/10">

                        {/* Empty state */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center py-6 flex-1">
                                <span className="text-[40px] mb-3">💡</span>
                                <p className="text-zinc-200 font-semibold text-[15px] mb-1.5">Ask anything about this lesson</p>
                                <p className="text-zinc-500 text-[13px] leading-relaxed max-w-[260px]">
                                    I'll answer based on the video transcript and point you to the exact timestamps.
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                            className="bg-violet-500/10 border border-violet-500/25 rounded-full px-3.5 py-1.5
                                 text-violet-400 text-xs hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-300
                                 transition-all cursor-pointer"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message list */}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-2 max-w-[95%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                                {msg.role === "bot" && (
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-sm shrink-0 mt-0.5">🤖</div>
                                )}
                                <div className={`rounded-2xl px-3.5 py-2.5 ${msg.role === "user"
                                        ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm"
                                        : msg.isError
                                            ? "bg-red-500/10 text-red-300 border border-red-500/20 rounded-bl-sm"
                                            : "bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-sm"
                                    }`}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

                                    {/* Source timestamp chips */}
                                    {msg.sources?.length > 0 && (
                                        <div className="mt-2.5 pt-2.5 border-t border-white/5">
                                            <div className="text-[11px] text-zinc-400 font-medium mb-1.5">📍 Referenced segments:</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {msg.sources.map((src, sIdx) => (
                                                    <button
                                                        key={sIdx}
                                                        onClick={() => jumpToTimestamp(src.start)}
                                                        title={src.text_preview}
                                                        className="bg-emerald-500/12 border border-emerald-500/25 rounded-lg px-2.5 py-1
                                       text-[11px] text-emerald-400 font-mono cursor-pointer
                                       hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:scale-105 transition-all"
                                                    >
                                                        ▶ {formatTime(src.start)} – {formatTime(src.end)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex gap-2 self-start max-w-[95%]">
                                <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-sm shrink-0 mt-0.5">🤖</div>
                                <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-zinc-800 border border-zinc-700">
                                    <div className="flex gap-1 py-1">
                                        <span className="w-[7px] h-[7px] rounded-full bg-violet-400 animate-bounce [animation-delay:0s]" />
                                        <span className="w-[7px] h-[7px] rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-[7px] h-[7px] rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 px-3.5 py-3 border-t border-zinc-800 bg-zinc-900">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a doubt about this lesson..."
                            disabled={loading}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5
                         text-zinc-200 text-[13px] placeholder-zinc-500
                         outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer
                         bg-gradient-to-br from-violet-600 to-indigo-600 text-white
                         hover:scale-105 hover:shadow-lg hover:shadow-violet-600/40 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
