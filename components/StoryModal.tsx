
import React, { useState, useEffect, useRef } from 'react';
import { getLeopoldStory, generateLeopoldAudio } from '../services/geminiService';

interface StoryModalProps {
  toyName: string;
  onClose: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ toyName, onClose }) => {
  const [story, setStory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      const text = await getLeopoldStory(toyName);
      setStory(text);
      setLoading(false);
    };
    fetchStory();
  }, [toyName]);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
      const base64 = await generateLeopoldAudio(story);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        
        // Manual base64 decode (from rules)
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      }
    } catch (e) {
      console.error("Audio playback error", e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-500 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐱</span>
            <div>
              <h2 className="text-2xl font-extrabold leading-tight">Послухай казку!</h2>
              <p className="text-blue-100 opacity-90">Леопольд розповідає...</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-blue-600 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold italic">Заварюємо чай з ромашкою...</p>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 text-gray-800 leading-relaxed italic text-lg mb-6">
                "{story}"
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-md ${
                    isPlaying ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg scale-100 hover:scale-[1.02]'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  {isPlaying ? 'Слухаємо...' : 'Озвучити Леопольдом'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryModal;
