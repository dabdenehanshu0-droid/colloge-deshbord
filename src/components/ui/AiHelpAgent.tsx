import React, { useState, useRef, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { api } from '../../services/apiClient';
import { RobotAvatar } from './RobotAvatar';
import { 
  Sparkles, 
  X, 
  Send, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Radio
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiHelpAgent: React.FC = () => {
  const { role, user, showToast } = usePlatform();
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [robotState, setRobotState] = useState<'idle' | 'thinking' | 'talking' | 'happy'>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Text-To-Speech: Robot speaks out loud properly
  const speakText = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown/symbols for clear robotic pronunciation
    const cleanSpeech = text
      .replace(/[#*`_]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => 
      v.lang.includes('en-IN') || v.lang.includes('hi') || v.name.includes('Natural') || v.name.includes('Google')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setRobotState('talking');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setRobotState('happy');
      setTimeout(() => setRobotState('idle'), 2000);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setRobotState('idle');
    };
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setRobotState('idle');
    }
  };

  // Speech-To-Text: Microphone voice recognition
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech Recognition not supported in this browser. Please type your query.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setRobotState('thinking');
        showToast('Listening to your voice...', 'info');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          setIsListening(false);
          handleSend(transcript);
        }
      };
      recognition.onerror = () => {
        setIsListening(false);
        setRobotState('idle');
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Initialize role-based greeting
  useEffect(() => {
    if (role === 'TEACHER') {
      const greeting = `Namaste Professor ${user?.name || ''}! I am your SGSU AI Voice & Teaching Co-pilot. I can help you manage students, create and assign new subjects, generate QR codes for online live classes, or reply to student queries.`;
      setMessages([
        {
          id: 'init',
          sender: 'assistant',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setSuggestions([
        'How to add a student to SQL database?',
        'Add new subject / course',
        'Start online class with QR code',
        'Check student inbound email queries'
      ]);
    } else {
      const greeting = `Hi ${user?.name || 'Student'}! I am your AI Voice Robot Tutor. Ask me any doubts about your subjects, neural network formulas, how to join live class via QR, or send a query to your teacher!`;
      setMessages([
        {
          id: 'init',
          sender: 'assistant',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setSuggestions([
        'Explain backpropagation in simple terms',
        'How to join live online class via QR code?',
        'Send an email query to teacher',
        'Difference between ReLU and Sigmoid'
      ]);
    }
  }, [role, user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setRobotState('thinking');

    try {
      const res = await api.askAssistant(text.trim(), role || 'STUDENT');
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
      
      // Robot speaks the answer aloud
      speakText(res.reply);
    } catch (err: any) {
      setRobotState('idle');
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I am here to assist! ' + (err.message || 'Please ask your academic or platform question.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      {/* Floating Robot Mascot (When Minimized) */}
      {!isOpen && (
        <div className="relative flex flex-col items-end">
          {/* Speech Bubble */}
          {showSpeechBubble && (
            <div className="mb-2 mr-1 relative bg-white text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2 animate-bounce">
              <span className="text-sm">🤖</span>
              <span>Ask Nexora AI Voice Robot!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-slate-200 transform rotate-45" />
            </div>
          )}

          {/* Interactive Floating Robot Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setShowSpeechBubble(false);
            }}
            className="group relative flex items-center gap-2.5 p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 shadow-2xl border-2 border-indigo-500/40 hover:border-indigo-500 transition-all transform hover:scale-105 cursor-pointer ring-4 ring-indigo-500/10"
            title="Open Nexora AI Robot"
          >
            <div className="relative">
              <RobotAvatar size="md" state={robotState} showBadge={true} />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 font-display">
                  Nexora Voice Robot
                </span>
                <Sparkles className="w-3 h-3 text-indigo-600 fill-indigo-500" />
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Voice & Chat Active'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Expanded Console */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[440px] h-[580px] max-h-[85vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header with Mascot & Voice Controls */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <RobotAvatar size="md" state={robotState} showBadge={true} />
                {isSpeaking && (
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-indigo-500 text-white animate-pulse">
                    <Radio className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    Nexora AI Voice Robot
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {role === 'TEACHER' ? 'Teacher Co-Pilot' : 'Student Tutor'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                  <span>
                    {isSpeaking ? 'Speaking aloud...' : isListening ? 'Listening to voice...' : robotState === 'thinking' ? 'Robot is thinking...' : 'Voice AI Active · Web Speech'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Mute / Unmute Button */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setIsVoiceEnabled(!isVoiceEnabled);
                }}
                className={`p-2 rounded-xl transition-all ${
                  isVoiceEnabled 
                    ? 'bg-indigo-600/60 hover:bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isVoiceEnabled ? 'Voice Enabled (Click to Mute)' : 'Voice Muted (Click to Unmute)'}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimize"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="mt-0.5 shrink-0">
                    <RobotAvatar size="sm" state="idle" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm relative group ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line font-normal">{msg.text}</p>
                  
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/30">
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                        title="Replay voice audio"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    )}
                    <span
                      className={`text-[9px] font-mono ml-auto ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-[80%]">
                <RobotAvatar size="sm" state="thinking" />
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200"></div>
                  <span className="text-[11px] text-slate-500 font-mono ml-1">Robot analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Message & Voice Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            {/* Mic Speech Button */}
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border-slate-200'
              }`}
              title={isListening ? 'Listening (Click to stop)' : 'Click to Speak Question by Voice'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={role === 'TEACHER' ? 'Speak or type: add student, subject, QR class...' : 'Speak or type: formula, doubts, QR class...'}
              className="flex-1 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-200 transition-all cursor-pointer"
              title="Send to Robot"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
