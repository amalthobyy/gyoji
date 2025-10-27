import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  callType: 'video' | 'voice';
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isVideoEnabled,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  callType,
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg">
      {/* Mute/Unmute Button */}
      <button
        onClick={onToggleMute}
        className={`p-3 rounded-full transition-colors ${
          isMuted 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Video Toggle Button (only for video calls) */}
      {callType === 'video' && (
        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
      )}

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        title="End call"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
};
