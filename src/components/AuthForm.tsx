import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { cn } from '../lib/apiClient';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.includes('@')) return '请输入有效的邮箱地址';
    if (password.length < 8) return '密码长度至少为 8 位';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (type === 'login') {
        const { token } = await apiClient.post<{ token: string }>('/api/auth/login', { email, password });
        localStorage.setItem('auth_token', token);
        navigate('/app');
      } else {
        await apiClient.post('/api/auth/register', { email, password });
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
          <Mail size={16} /> 邮箱地址
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
          <Lock size={16} /> 密码
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2",
          loading && "opacity-70 cursor-not-allowed"
        )}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : (type === 'login' ? '登录' : '注册')}
      </button>
    </form>
  );
};
