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
  const wsRef = useRef<WebSocket | null>(null);

  const createPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
        }));
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

  const startCall = useCallback(async (roomId: string, callType: 'video' | 'voice' = 'video') => {
    try {
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

      // Connect to WebSocket for signaling
      const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
      wsRef.current = ws;

      ws.onopen = async () => {
        const offer = await peerConnectionRef.current!.createOffer();
        await peerConnectionRef.current!.setLocalDescription(offer);
        
        ws.send(JSON.stringify({
          type: 'call-offer',
          offer,
          callType,
        }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'call-answer':
            await peerConnectionRef.current!.setRemoteDescription(data.answer);
            break;
          case 'ice-candidate':
            await peerConnectionRef.current!.addIceCandidate(data.candidate);
            break;
          case 'call-end':
            endCall();
            break;
        }
      };

    } catch (error) {
      console.error('Error starting call:', error);
      setCallState(prev => ({ ...prev, isCallActive: false }));
    }
  }, [createPeerConnection]);

  const answerCall = useCallback(async (roomId: string, offer: RTCSessionDescriptionInit, callType: 'video' | 'voice') => {
    try {
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

      // Connect to WebSocket for signaling
      const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'call-answer',
          answer,
        }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'ice-candidate':
            await peerConnectionRef.current!.addIceCandidate(data.candidate);
            break;
          case 'call-end':
            endCall();
            break;
        }
      };

    } catch (error) {
      console.error('Error answering call:', error);
      setCallState(prev => ({ ...prev, isCallActive: false }));
    }
  }, [createPeerConnection]);

  const endCall = useCallback(() => {
    if (callState.localStream) {
      callState.localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'call-end' }));
      wsRef.current.close();
      wsRef.current = null;
    }

    setCallState({
      isCallActive: false,
      isMuted: false,
      isVideoEnabled: true,
      localStream: null,
      remoteStream: null,
      connectionState: 'new',
      callType: 'video',
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [callState.localStream]);

  const toggleMute = useCallback(() => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  }, [callState.localStream]);

  const toggleVideo = useCallback(() => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, [callState.localStream]);

  return {
    callState,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
  };
};
