'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
}

export default function VoiceInputButton({ onResult }: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`absolute right-3 top-3 p-2 rounded-lg transition-all duration-200 ${
        isRecording
          ? 'bg-danger-500/20 text-danger-400 animate-pulse-ring shadow-glow-danger'
          : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
      }`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
