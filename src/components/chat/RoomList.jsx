import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRooms, setActiveRoom } from "../../store/slices/chatSlice";
import { getChatRooms } from "../../api/chat.api";

const RoomList = () => {
    const dispatch = useDispatch();
    const { rooms, activeRoom, unreadCounts } = useSelector(state => state.chat);

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

        // Poll for updates every 30s
        const interval = setInterval(fetchRooms, 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    return (
        <div className="w-1/3 border-r border-gray-700 bg-gray-900 overflow-y-auto hidden md:block">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Chats</h2>
            </div>
            <ul>
                {rooms.map(room => (
                    <li
                        key={room.id}
                        onClick={() => dispatch(setActiveRoom(room))}
                        className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${activeRoom?.id === room.id ? "bg-gray-800 border-l-4 border-green-500" : ""
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-200">{room.course_title || room.name}</h3>
                            {unreadCounts[room.id] > 0 && (
                                <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                    {unreadCounts[room.id]}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 truncate mt-1">
                            {room.last_message?.content || "No messages yet"}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RoomList;
