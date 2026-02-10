import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIncomingCall, setActiveCall, endCall } from "../store/slices/chatSlice";
import { getWebSocketToken } from "../api/chat.api";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

const useVideoCall = (roomId) => {
    const dispatch = useDispatch();
    const { activeCall, incomingCall } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);

    const wsRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const tokenRef = useRef(null);

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const durationIntervalRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    // Fetch WS token
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await getWebSocketToken();
                tokenRef.current = token;
                setIsReady(true);
            } catch (err) {
                console.error("Failed to fetch WS token for call:", err);
            }
        };
        fetchToken();
    }, []);

    // Connect to call signaling WebSocket
    const connectSignaling = useCallback((targetRoomId) => {
        if (!tokenRef.current || !targetRoomId) return;

        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = window.location.host;
        const url = `${wsProtocol}//${wsHost}/ws/call/${targetRoomId}/?token=${tokenRef.current}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Call signaling WS connected");
        };

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "incoming_call":
                    dispatch(setIncomingCall({
                        callerId: data.caller_id,
                        callerName: data.caller_name,
                        sdp: data.sdp,
                        callId: data.call_id,
                        roomId: targetRoomId,
                    }));
                    break;

                case "call_accepted":
                    await handleCallAccepted(data);
                    break;

                case "ice_candidate":
                    await handleRemoteIceCandidate(data.candidate);
                    break;

                case "call_ended":
                    handleCallEnded();
                    break;

                case "call_rejected":
                    handleCallEnded();
                    break;

                default:
                    break;
            }
        };

        ws.onclose = () => {
            console.log("Call signaling WS disconnected");
        };

        ws.onerror = (err) => {
            console.error("Call signaling WS error:", err);
        };
    }, [dispatch]);

    // Get local media stream
    const getLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error("Failed to get media:", err);
            // Try audio only
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: true,
                });
                localStreamRef.current = stream;
                setLocalStream(stream);
                return stream;
            } catch (audioErr) {
                console.error("Failed to get audio:", audioErr);
                return null;
            }
        }
    };

    // Create peer connection
    const createPeerConnection = (stream) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add local tracks
        if (stream) {
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });
        }

        // Handle remote tracks
        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: "ice_candidate",
                    candidate: event.candidate.toJSON(),
                }));
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
                handleCallEnded();
            }
        };

        return pc;
    };

    // Start a call (caller side)
    const startCall = async (calleeId) => {
        if (!roomId) return;

        connectSignaling(roomId);

        // Wait for WS to connect
        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    clearInterval(check);
                    resolve();
                }
            }, 200);
            // Timeout after 5 seconds
            setTimeout(() => { clearInterval(check); resolve(); }, 5000);
        });

        const stream = await getLocalMedia();
        if (!stream) return;

        const pc = createPeerConnection(stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "call_offer",
                callee_id: calleeId,
                sdp: offer,
            }));
        }

        dispatch(setActiveCall({
            callId: null, // Will be set when we get the response
            roomId: roomId,
            remoteUserId: calleeId,
            isCaller: true,
        }));

        // Start duration timer
        setCallDuration(0);
        durationIntervalRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
    };

    // Answer an incoming call (callee side)
    const answerCall = async () => {
        if (!incomingCall) return;

        const targetRoomId = incomingCall.roomId;

        // Connect signaling if not already connected
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            connectSignaling(targetRoomId);
            await new Promise((resolve) => {
                const check = setInterval(() => {
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        clearInterval(check);
                        resolve();
                    }
                }, 200);
                setTimeout(() => { clearInterval(check); resolve(); }, 5000);
            });
        }

        const stream = await getLocalMedia();
        if (!stream) return;

        const pc = createPeerConnection(stream);

        // Set the remote offer
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "call_answer",
                call_id: incomingCall.callId,
                sdp: answer,
            }));
        }

        dispatch(setActiveCall({
            callId: incomingCall.callId,
            roomId: targetRoomId,
            remoteUserId: incomingCall.callerId,
            isCaller: false,
        }));

        // Start duration timer
        setCallDuration(0);
        durationIntervalRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
    };

    // Handle call accepted (caller receives answer)
    const handleCallAccepted = async (data) => {
        if (pcRef.current) {
            await pcRef.current.setRemoteDescription(
                new RTCSessionDescription(data.sdp)
            );
        }

        if (data.call_id) {
            dispatch(setActiveCall({
                ...activeCall,
                callId: data.call_id,
            }));
        }
    };

    // Handle remote ICE candidate
    const handleRemoteIceCandidate = async (candidate) => {
        if (pcRef.current && candidate) {
            try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding ICE candidate:", err);
            }
        }
    };

    // End the call
    const endCallAction = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "call_end",
                call_id: activeCall?.callId,
            }));
        }
        handleCallEnded();
    };

    // Reject incoming call
    const rejectCall = () => {
        if (!incomingCall) return;

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            connectSignaling(incomingCall.roomId);
        }

        // Wait briefly for connection then send reject
        setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: "call_reject",
                    call_id: incomingCall.callId,
                }));
            }
        }, 500);

        dispatch(endCall());
    };

    // Cleanup on call end
    const handleCallEnded = () => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setIsMuted(false);
        setIsCameraOff(false);
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
        }
        setCallDuration(0);
        dispatch(endCall());
    };

    // Toggle mic
    const toggleMic = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle camera
    const toggleCamera = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOff(!videoTrack.enabled);
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (pcRef.current) pcRef.current.close();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, []);

    return {
        startCall,
        answerCall,
        endCall: endCallAction,
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
    };
};

export default useVideoCall;
