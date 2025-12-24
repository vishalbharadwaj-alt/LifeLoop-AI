
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { CAMPUS_PINS, HOSTEL_MESS_MENU } from '../constants';
import { WeatherData } from '../types';

interface LiveVoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({ isOpen, onClose, weather }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const systemInstruction = `
    You are LifeLoop Voice, the auditory growth companion for students at Assam Skill University.
    Your tone is empathetic, professional, and helpful.
    Current Live Weather at ASU: ${weather.condition}, ${weather.temp}°C, Humidity ${weather.humidity}%, Wind ${weather.windSpeed}km/h.
    ASU Hazards: ${CAMPUS_PINS.filter(p => p.severity === 'Danger').map(p => p.name).join(', ')}.
    Hostel Menu: ${HOSTEL_MESS_MENU.map(m => m.name).join(', ')}.
  `;

  useEffect(() => {
    if (isActive) drawVisualizer();
  }, [isActive]);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const renderFrame = () => {
      if (!isActive) return;
      requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 65;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius * 1.6);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      for (let i = 0; i < bufferLength; i += 6) {
        const value = dataArray[i];
        const angle = (i / bufferLength) * Math.PI * 2;
        const lineLen = (value / 255) * 45;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + lineLen);
        const y2 = centerY + Math.sin(angle) * (radius + lineLen);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(129, 140, 248, ${value / 255})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    };
    renderFrame();
  };

  const startSession = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    analyserRef.current.connect(audioContextRef.current.destination);
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('listening');
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus('speaking');
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(analyserRef.current!);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction,
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setStatus('idle');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    inputAudioContextRef.current?.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/80">
      <div className="bg-slate-900/90 w-full max-w-sm rounded-[3rem] p-10 border border-white/5 shadow-2xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-12">
          <div>
            <h2 className="text-white font-black text-xl tracking-tight">LifeLoop Voice</h2>
            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">{status}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="relative w-full aspect-square flex items-center justify-center mb-12">
          <canvas ref={canvasRef} width={300} height={300} className="w-full h-full" />
          {!isActive && (
            <button onClick={startSession} className="absolute w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] hover:scale-110 transition-transform active:scale-95 z-20">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
            </button>
          )}
        </div>
        <div className="w-full space-y-6">
          <p className="text-slate-400 text-center text-sm font-medium leading-relaxed px-4">
            {isActive ? "Closing the loop with voice reflection..." : "Tap the orb to start a real-time voice meditation with LifeLoop AI."}
          </p>
          {isActive && (
            <button onClick={stopSession} className="w-full py-5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all">
              DISCONNECT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceAssistant;
