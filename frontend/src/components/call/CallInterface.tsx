import React from 'react';
import { CallState } from '../../hooks/useWebRTC';
import { CallControls } from './CallControls';

interface CallInterfaceProps {
  callState: CallState;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  callerName?: string;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  callState,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  localVideoRef,
  remoteVideoRef,
  callerName,
}) => {
  const { isCallActive, callType, connectionState } = callState;

  if (!isCallActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-6xl mx-auto p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <h2 className="text-xl font-semibold">
              {callerName ? `Calling ${callerName}` : 'Call in progress'}
            </h2>
            <p className="text-sm text-gray-300 capitalize">
              {callType} call • {connectionState}
            </p>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900 rounded-xl overflow-hidden">
          {/* Remote Video */}
          <div className="absolute inset-0">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!callState.remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">
                      {callerName ? callerName.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <p className="text-lg font-medium">{callerName || 'Connecting...'}</p>
                  <p className="text-sm text-gray-400">Waiting for video</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          {callType === 'video' && callState.localStream && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Voice Call Avatar (when no video) */}
          {callType === 'voice' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl font-bold">
                    {callerName ? callerName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <p className="text-2xl font-medium">{callerName || 'Connecting...'}</p>
                <p className="text-lg text-gray-400">Voice call</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-center">
          <CallControls
            isMuted={callState.isMuted}
            isVideoEnabled={callState.isVideoEnabled}
            onToggleMute={onToggleMute}
            onToggleVideo={onToggleVideo}
            onEndCall={onEndCall}
            callType={callType}
          />
        </div>
      </div>
    </div>
  );
};
