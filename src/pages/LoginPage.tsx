import React from 'react';
import { AuthForm } from '../components/AuthForm';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-zinc-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">欢迎回来</h1>
          <p className="text-zinc-500 mt-2">登录以继续你的谈判训练</p>
        </div>

        <AuthForm type="login" />

        <p className="text-center mt-6 text-sm text-zinc-600">
          还没有账号？{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            立即注册
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
