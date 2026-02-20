import React, { useEffect, useState } from 'react';
import { Session, ScenarioTemplate } from '../types';
import { apiClient } from '../lib/apiClient';
import { SessionList } from '../components/SessionList';
import { ScenarioCard } from '../components/ScenarioCard';
import { Plus, LogOut, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: '1',
    title: '软件外包合同谈判',
    description: '作为甲方，你需要与一家软件开发公司就项目范围、价格和交付日期进行谈判。',
    content: '你是一家初创公司的 CTO，需要外包一个移动 App 的开发。预算为 5 万美元，希望 3 个月内上线。对方报价 8 万美元，工期 5 个月。'
  },
  {
    id: '2',
    title: '核心人才招聘谈薪',
    description: '你正在面试一位资深架构师，对方能力极强但要求的薪资超出了你的部门预算。',
    content: '你是一家科技公司的研发总监。候选人非常优秀，但要求年薪 100 万加股票期权。你的最高预算是 80 万。你需要通过其他福利或长期激励来达成一致。'
  },
  {
    id: '3',
    title: '供应商涨价应对',
    description: '你的长期原材料供应商突然提出涨价 15%，你需要通过谈判维持成本或寻找折中方案。',
    content: '你是制造企业的采购经理。核心原材料供应商因全球供应链紧张要求涨价 15%。如果接受，你的利润将大幅缩水。你需要利用长期合作关系和采购量进行博弈。'
  }
];

export const AppPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTemplate | null>(null);
  const [customScenario, setCustomScenario] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await apiClient.get<Session[]>('/api/sessions');
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const handleCreateSession = async () => {
    const scenario = selectedScenario ? selectedScenario.content : customScenario;
    if (!scenario.trim()) return;

    setCreating(true);
    try {
      const { sessionId } = await apiClient.post<{ sessionId: string }>('/api/sessions', {
        title: selectedScenario?.title || '自定义谈判',
        scenario
      });
      navigate(`/app/session/${sessionId}`);
    } catch (err) {
      alert('创建失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-bottom border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <span className="font-bold text-xl text-zinc-900">NegotiateAI</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="退出登录"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">谈判练习</h2>
            <p className="text-zinc-500">回顾你的历史对话或开始新的挑战</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-medium"
          >
            <Plus size={20} /> 新建会话
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          <SessionList sessions={sessions} />
        )}
      </main>

      {/* Create Session Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">选择谈判场景</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SCENARIO_TEMPLATES.map((t) => (
                    <ScenarioCard
                      key={t.id}
                      scenario={t}
                      isSelected={selectedScenario?.id === t.id}
                      onClick={() => {
                        setSelectedScenario(t);
                        setCustomScenario('');
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">或者输入自定义场景</label>
                  <textarea
                    value={customScenario}
                    onChange={(e) => {
                      setCustomScenario(e.target.value);
                      setSelectedScenario(null);
                    }}
                    placeholder="描述你想模拟的谈判背景、目标和对手信息..."
                    className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-zinc-600 font-medium hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={creating || (!selectedScenario && !customScenario.trim())}
                  className="px-8 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {creating && <Loader2 className="animate-spin" size={18} />}
                  开始练习
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
