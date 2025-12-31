
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encodeAudio, decodeAudio, decodeAudioData } from '../services/geminiService';

const LeopoldLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) {
      // Use session.close() to close the connection and release resources.
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    setTranscription('');
    
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
  };

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'Ти - кіт Леопольд, добрий та ввічливий персонаж. Твій девіз: "Хлопці, давайте жити дружньо!". Ти розмовляєш українською мовою. Ти допомагаєш дітям та батькам обрати найкращі іграшки в магазині "Леопольд". Ти завжди позитивний, лагідний та любиш розповідати маленькі цікавинки. Відповідай коротко та лагідно.',
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const inputCtx = new AudioContext({ sampleRate: 16000 });
            inputContextRef.current = inputCtx;
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBase64 = encodeAudio(new Uint8Array(int16.buffer));
              
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, do not add other condition checks.
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent.outputTranscription.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
              }
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decodeAudio(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => {
            console.error(e);
            stopSession();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice chat:", err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isActive && (
        <div className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-blue-400 w-64 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-gray-700">На зв'язку з Леопольдом...</span>
          </div>
          <p className="text-xs text-gray-500 italic mb-2">"Хлопці, давайте жити дружньо!"</p>
          {transcription && (
            <div className="bg-blue-50 p-2 rounded-lg text-sm text-blue-800 animate-pulse">
              {transcription}
            </div>
          )}
          <button 
            onClick={stopSession}
            className="w-full mt-4 bg-red-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
          >
            Завершити розмову
          </button>
        </div>
      )}

      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isActive 
            ? 'bg-red-500 hover:bg-red-600 border-4 border-white' 
            : 'bg-yellow-400 hover:bg-yellow-500 border-4 border-white'
        }`}
      >
        {isConnecting ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-3xl">{isActive ? '🛑' : '🐱'}</span>
        )}
        {!isActive && !isConnecting && (
          <span className="absolute -top-12 right-0 bg-white text-gray-800 px-3 py-1 rounded-xl text-xs font-bold shadow-lg border border-yellow-200 whitespace-nowrap">
            Поговорити з Леопольдом!
          </span>
        )}
      </button>
    </div>
  );
};

export default LeopoldLive;
