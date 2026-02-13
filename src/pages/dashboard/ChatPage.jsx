import React from "react";
import { useSelector } from "react-redux";
import RoomList from "../../components/chat/RoomList";
import ChatWindow from "../../components/chat/ChatWindow";
import VideoCallModal from "../../components/chat/VideoCallModal";
import IncomingCallModal from "../../components/chat/IncomingCallModal";
import useChat from "../../hooks/useChat";
import useVideoCall from "../../hooks/useVideoCall";

const ChatPage = () => {
    const { activeRoom, incomingCall, activeCall } = useSelector(state => state.chat);

    const { sendMessage, startTyping, stopTyping, sendReadReceipt } = useChat(activeRoom?.id);

    const {
        startCall,
        answerCall,
        endCall,
        rejectCall,
        toggleMic,
        toggleCamera,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        callDuration,
        connectSignaling,
        isReady,
    } = useVideoCall(activeRoom?.id);

    // Connect signaling when entering a DM room for receiving incoming calls
    React.useEffect(() => {
        if (activeRoom?.type === "DM" && activeRoom?.id && isReady) {
            connectSignaling(activeRoom.id);
        }
    }, [activeRoom?.id, activeRoom?.type, connectSignaling, isReady]);

    const handleStartCall = (calleeId) => {
        if (calleeId) {
            startCall(calleeId);
        }
    };

    return (
        <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-black">
            <RoomList />
            <ChatWindow
                sendMessage={sendMessage}
                startTyping={startTyping}
                stopTyping={stopTyping}
                sendReadReceipt={sendReadReceipt}
                onStartCall={handleStartCall}
            />

            {/* Incoming Call Modal */}
            {incomingCall && !activeCall && (
                <IncomingCallModal
                    callerName={incomingCall.callerName}
                    callerId={incomingCall.callerId}
                    onAccept={answerCall}
                    onReject={rejectCall}
                />
            )}

            {/* Active Call Modal */}
            {activeCall && (
                <VideoCallModal
                    localStream={localStream}
                    remoteStream={remoteStream}
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    callDuration={callDuration}
                    onEndCall={endCall}
                    onToggleMic={toggleMic}
                    onToggleCamera={toggleCamera}
                />
            )}
        </div>
    );
};

export default ChatPage;
