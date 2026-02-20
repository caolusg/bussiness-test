import React from 'react';
import { Session } from '../types';
import { MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SessionListProps {
  sessions: Session[];
}

export const SessionList: React.FC<SessionListProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
        <MessageSquare className="mx-auto text-zinc-300 mb-4" size={48} />
        <p className="text-zinc-500">暂无会话，开始你的第一次谈判训练吧</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sessions.map((session) => (
        <Link
          key={session.id}
          to={`/app/session/${session.id}`}
          className="group flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-medium text-zinc-900">{session.title || '未命名会话'}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                <Calendar size={12} />
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <ChevronRight className="text-zinc-300 group-hover:text-indigo-500 transition-colors" size={20} />
        </Link>
      ))}
    </div>
  );
};
