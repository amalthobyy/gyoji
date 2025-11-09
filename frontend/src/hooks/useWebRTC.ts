import { useState, useRef, useCallback, useEffect } from 'react';

export interface CallState {
  isCallActive: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  callType: 'video' | 'voice';
}

export interface CallData {
  roomId: string;
  callerId: string;
  callerName: string;
  callType: 'video' | 'voice';
  offer?: RTCSessionDescriptionInit;
}

export const useWebRTC = () => {
  const [callState, setCallState] = useState<CallState>({
    isCallActive: false,
    isMuted: false,
    isVideoEnabled: true,
    localStream: null,
    remoteStream: null,
    connectionState: 'new',
    callType: 'video',
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const sendMessageRef = useRef<((data: any) => void) | null>(null);
  const callMessageHandlerRef = useRef<((data: any) => void) | null>(null);

  const createPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && sendMessageRef.current) {
        sendMessageRef.current({
          type: 'ice-candidate',
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setCallState(prev => ({ ...prev, remoteStream }));
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    peerConnection.onconnectionstatechange = () => {
      setCallState(prev => ({ 
        ...prev, 
        connectionState: peerConnection.connectionState 
      }));
    };

    return peerConnection;
  }, []);

  // Register message sender function
  const registerMessageSender = useCallback((sendFn: (data: any) => void) => {
    sendMessageRef.current = sendFn;
  }, []);

  const endCall = useCallback(() => {
    setCallState(prev => {
      if (prev.localStream) {
        prev.localStream.getTracks().forEach(track => track.stop());
      }
      return {
        isCallActive: false,
        isMuted: false,
        isVideoEnabled: true,
        localStream: null,
        remoteStream: null,
        connectionState: 'new',
        callType: 'video',
      };
    });

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Send call-end message if WebSocket is available
    if (sendMessageRef.current) {
      try {
        sendMessageRef.current({ type: 'call-end' });
      } catch (error) {
        console.error('Error sending call-end:', error);
      }
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  // Handle incoming call signaling messages
  const handleCallSignaling = useCallback(async (data: any) => {
    // Allow call-offer even if no call is active (to show incoming call modal)
    if (data.type !== 'call-offer' && !callState.isCallActive) {
      return; // Ignore call signaling if no call is active
    }

    try {
      switch (data.type) {
        case 'call-answer':
          if (peerConnectionRef.current && data.answer) {
            await peerConnectionRef.current.setRemoteDescription(data.answer);
          }
          break;
        case 'ice-candidate':
          if (peerConnectionRef.current && data.candidate) {
            await peerConnectionRef.current.addIceCandidate(data.candidate);
          }
          break;
        case 'call-end':
        case 'call-reject':
          endCall();
          break;
      }
    } catch (error) {
      console.error('Error handling call signaling:', error);
    }
  }, [callState.isCallActive, endCall]);

  const startCall = useCallback(async (roomId: string, callType: 'video' | 'voice' = 'video') => {
    try {
      if (!sendMessageRef.current) {
        throw new Error('WebSocket message sender not registered');
      }

      const constraints: MediaStreamConstraints = {
        video: callType === 'video' ? true : false,
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        localStream: stream,
        callType,
        isVideoEnabled: callType === 'video',
      }));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnectionRef.current = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      sendMessageRef.current({
        type: 'call-offer',
        offer,
        callType,
        roomId,
      });

    } catch (error) {
      console.error('Error starting call:', error);
      setCallState(prev => ({ ...prev, isCallActive: false }));
      throw error;
    }
  }, [createPeerConnection]);

  const answerCall = useCallback(async (roomId: string, offer: RTCSessionDescriptionInit, callType: 'video' | 'voice') => {
    try {
      if (!sendMessageRef.current) {
        throw new Error('WebSocket message sender not registered');
      }

      const constraints: MediaStreamConstraints = {
        video: callType === 'video' ? true : false,
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        localStream: stream,
        callType,
        isVideoEnabled: callType === 'video',
      }));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnectionRef.current = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      // Send answer
      sendMessageRef.current({
        type: 'call-answer',
        answer,
        roomId,
      });

    } catch (error) {
      console.error('Error answering call:', error);
      setCallState(prev => ({ ...prev, isCallActive: false }));
      throw error;
    }
  }, [createPeerConnection]);


  const toggleMute = useCallback(() => {
    setCallState(prev => {
      if (prev.localStream) {
        const audioTrack = prev.localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          return { ...prev, isMuted: !audioTrack.enabled };
        }
      }
      return prev;
    });
  }, []);

  const toggleVideo = useCallback(() => {
    setCallState(prev => {
      if (prev.localStream) {
        const videoTrack = prev.localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          return { ...prev, isVideoEnabled: videoTrack.enabled };
        }
      }
      return prev;
    });
  }, []);

  // Expose handler registration
  useEffect(() => {
    callMessageHandlerRef.current = handleCallSignaling;
  }, [handleCallSignaling]);

  return {
    callState,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
    registerMessageSender,
    handleCallSignaling,
  };
};
