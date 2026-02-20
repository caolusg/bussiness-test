import React from 'react';
import { ScenarioTemplate } from '../types';
import { BookOpen, Target, Briefcase } from 'lucide-react';
import { cn } from '../lib/apiClient';

interface ScenarioCardProps {
  scenario: ScenarioTemplate;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
        isSelected 
          ? "border-indigo-600 bg-indigo-50/30" 
          : "border-zinc-100 bg-white hover:border-zinc-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isSelected ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-500"
        )}>
          <Briefcase size={18} />
        </div>
        <div>
          <h4 className="font-semibold text-zinc-900">{scenario.title}</h4>
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{scenario.description}</p>
        </div>
      </div>
    </div>
  );
};
