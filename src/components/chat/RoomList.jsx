import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRooms, setActiveRoom } from "../../store/slices/chatSlice";
import { getChatRooms } from "../../api/chat.api";

const RoomList = () => {
    const dispatch = useDispatch();
    const { rooms, activeRoom, unreadCounts, onlineUsers } = useSelector(state => state.chat);
    const [activeTab, setActiveTab] = useState("COURSE");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getChatRooms();
                dispatch(setRooms(data));
            } catch (error) {
                console.error("Failed to load rooms", error);
            }
        };
        fetchRooms();

        const interval = setInterval(fetchRooms, 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const filteredRooms = rooms
        .filter(room => room.type === activeTab)
        .filter(room => {
            if (!searchQuery) return true;
            const name = room.name || "";
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        });

    const totalDmUnread = rooms
        .filter(r => r.type === "DM")
        .reduce((sum, r) => sum + (unreadCounts[r.id] || 0), 0);

    const totalCourseUnread = rooms
        .filter(r => r.type === "COURSE")
        .reduce((sum, r) => sum + (unreadCounts[r.id] || 0), 0);

    const isUserOnline = (room) => {
        if (room.type !== "DM" || !room.other_user) return false;
        return onlineUsers.includes(room.other_user.user_id);
    };

    const getRoomDisplayName = (room) => {
        if (room.type === "DM" && room.other_user) {
            return `User ${room.other_user.user_id}`;
        }
        return room.course_title || room.name;
    };

    return (
        <div className="w-80 min-w-[280px] border-r border-gray-700 bg-gray-900 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white mb-3">Messages</h2>
                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 text-gray-300 text-sm rounded-lg pl-9 pr-3 py-2 border border-gray-700 focus:outline-none focus:border-green-500"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab("COURSE")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === "COURSE"
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    📚 Courses
                    {totalCourseUnread > 0 && (
                        <span className="ml-1 bg-green-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {totalCourseUnread}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("DM")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === "DM"
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    💬 Direct
                    {totalDmUnread > 0 && (
                        <span className="ml-1 bg-green-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {totalDmUnread}
                        </span>
                    )}
                </button>
            </div>

            {/* Room List */}
            <ul className="flex-1 overflow-y-auto">
                {filteredRooms.length === 0 && (
                    <li className="p-6 text-center text-gray-500 text-sm">
                        {activeTab === "DM"
                            ? "No direct messages yet.\nMessage an instructor from a course page!"
                            : "No course chats yet.\nEnroll in a course to join its chat."}
                    </li>
                )}
                {filteredRooms.map(room => (
                    <li
                        key={room.id}
                        onClick={() => dispatch(setActiveRoom(room))}
                        className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors border-b border-gray-800/50 ${activeRoom?.id === room.id
                                ? "bg-gray-800 border-l-4 border-l-green-500"
                                : ""
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Avatar / Icon */}
                            <div className="relative flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${room.type === "DM"
                                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                        : "bg-gradient-to-br from-green-500 to-emerald-600"
                                    }`}>
                                    {room.type === "DM" ? "👤" : "📚"}
                                </div>
                                {/* Online indicator for DM */}
                                {room.type === "DM" && (
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${isUserOnline(room) ? "bg-green-400" : "bg-gray-600"
                                        }`} />
                                )}
                            </div>

                            {/* Room info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-200 text-sm truncate">
                                        {getRoomDisplayName(room)}
                                    </h3>
                                    {unreadCounts[room.id] > 0 && (
                                        <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                                            {unreadCounts[room.id]}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {room.last_message?.content || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RoomList;
