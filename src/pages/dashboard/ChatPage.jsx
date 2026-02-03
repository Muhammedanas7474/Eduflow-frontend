import React from "react";
import RoomList from "../../components/chat/RoomList";
import ChatWindow from "../../components/chat/ChatWindow";
import useChat from "../../hooks/useChat";
import { useSelector } from "react-redux";

const ChatPage = () => {
    const { activeRoom } = useSelector(state => state.chat);
    /* 
       Note: We verify host dynamically in useChat hook.
       The frontend is likely served via NGINX or Vite Proxy.
    */
    const { sendMessage } = useChat(activeRoom?.id);

    return (
        <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-black">
            <RoomList />
            <ChatWindow sendMessage={sendMessage} />
        </div>
    );
};

export default ChatPage;
