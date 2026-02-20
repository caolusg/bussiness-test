import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Message, Session } from '../types';
import { apiClient } from '../lib/apiClient';
import { ChatWindow } from '../components/ChatWindow';
import { ChevronLeft, Info, Briefcase, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

  const fetchSessionData = async () => {
    try {
      // In a real app, we'd have an endpoint to get session by ID
      // For this demo, we'll fetch all and find the one
      const sessions = await apiClient.get<Session[]>('/api/sessions');
      const found = sessions.find(s => s.id === id);
      if (!found) {
        navigate('/app');
        return;
      }
      setSession(found);

      const msgs = await apiClient.get<Message[]>(`/api/sessions/${id}/messages`);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load session', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!id) return;
    
    // Optimistic update
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const { assistantMessage } = await apiClient.post<{ assistantMessage: string }>('/api/chat', {
        sessionId: id,
        userMessage: content
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      alert('发送失败，请检查网络');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <ShieldAlert className="text-indigo-600" size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 h-16 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-zinc-900 leading-tight">{session?.title}</h1>
              <p className="text-xs text-zinc-500">正在与 AI 谈判专家博弈中</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            <Target size={14} />
            实战模拟模式
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6">
          {/* Left Sidebar: Scenario Info */}
          <div className="hidden lg:block lg:col-span-4 space-y-6 overflow-y-auto pr-2">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 mb-4">
                <Briefcase size={20} />
                <h2 className="font-bold">谈判背景</h2>
              </div>
              <div className="prose prose-sm text-zinc-600 leading-relaxed">
                {session?.scenario}
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <Info size={18} />
                <h3 className="font-bold">谈判建议</h3>
              </div>
              <ul className="text-sm space-y-2 opacity-90 list-disc pl-4">
                <li>明确你的底线（BATNA）</li>
                <li>尝试寻找双赢的利益交换点</li>
                <li>保持专业且坚定的态度</li>
                <li>注意对方的情绪反馈</li>
              </ul>
            </div>
          </div>

          {/* Right: Chat Window */}
          <div className="lg:col-span-8 h-full">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={sending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
