import React from 'react';
import { Phone, Video, X } from 'lucide-react';
import { CallData } from '../../hooks/useWebRTC';

interface IncomingCallModalProps {
  callData: CallData | null;
  onAccept: (callType: 'video' | 'voice') => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callData,
  onAccept,
  onReject,
}) => {
  if (!callData) return null;

  const { callerName, callType } = callData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">
              {callerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
          </h3>
          <p className="text-gray-600">
            <span className="font-medium">{callerName}</span> is calling you
          </p>
        </div>

        {/* Call Type Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${
            callType === 'video' ? 'bg-emerald-100' : 'bg-orange-100'
          }`}>
            {callType === 'video' ? (
              <Video className="w-8 h-8 text-green-600" />
            ) : (
              <Phone className="w-8 h-8 text-blue-600" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {/* Reject Button */}
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors"
          >
            <X size={20} />
            <span>Reject</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={() => onAccept(callType)}
            className={`flex-1 flex items-center justify-center space-x-2 text-white py-3 px-4 rounded-xl transition-colors ${
              callType === 'video' 
                ? 'bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600' 
                : 'bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600'
            }`}
          >
            {callType === 'video' ? (
              <Video size={20} />
            ) : (
              <Phone size={20} />
            )}
            <span>Accept</span>
          </button>
        </div>

        {/* Call Type Indicator */}
        <div className="mt-4 text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            callType === 'video' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
        </div>
      </div>
    </div>
  );
};
