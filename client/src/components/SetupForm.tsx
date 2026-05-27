import { useState } from 'react';
import { Briefcase, ChevronRight, Mic, Sparkles } from 'lucide-react';
import { InterviewConfig } from '../types/interview';

interface SetupFormProps {
  onStart: (config: InterviewConfig) => void;
  isLoading: boolean;
}

const ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Project Manager',
  'Business Analyst',
  'DevOps Engineer',
  'Frontend Developer',
];

export function SetupForm({ onStart, isLoading }: SetupFormProps) {
  const [config, setConfig] = useState<InterviewConfig>({
    role: '',
    experienceLevel: 'mid',
    interviewType: 'behavioral',
    questionCount: 5,
  });
  const [customRole, setCustomRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalConfig = {
      ...config,
      role: config.role === 'custom' ? customRole : config.role,
    };
    if (!finalConfig.role) return;
    onStart(finalConfig);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200 mb-6">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI Interview Coach
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Practice mock interviews with AI-powered feedback on your delivery, confidence, and structure.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Mic, label: 'Voice Analysis', desc: 'Speaking speed & fillers' },
            { icon: Sparkles, label: 'AI Feedback', desc: 'STAR format coaching' },
            { icon: Briefcase, label: 'PDF Scorecard', desc: 'Detailed report' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-800">{label}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 space-y-6 border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Role
            </label>
            <select
              value={config.role}
              onChange={(e) => setConfig({ ...config, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select a role...</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="custom">Other (type your own)</option>
            </select>
            {config.role === 'custom' && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter your target role..."
                className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={config.experienceLevel}
                onChange={(e) => setConfig({ ...config, experienceLevel: e.target.value as InterviewConfig['experienceLevel'] })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="junior">Junior (0-2 years)</option>
                <option value="mid">Mid-Level (2-5 years)</option>
                <option value="senior">Senior (5-10 years)</option>
                <option value="lead">Lead (10+ years)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interview Type
              </label>
              <select
                value={config.interviewType}
                onChange={(e) => setConfig({ ...config, interviewType: e.target.value as InterviewConfig['interviewType'] })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="behavioral">Behavioral</option>
                <option value="technical">Technical</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Questions: {config.questionCount}
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>3</span>
              <span>10</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!config.role || (config.role === 'custom' && !customRole))}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Preparing Interview...
              </>
            ) : (
              <>
                Start Interview
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
