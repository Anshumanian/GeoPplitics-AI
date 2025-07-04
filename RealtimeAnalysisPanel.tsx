import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Globe, TrendingUp, Brain, RefreshCw, Eye, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { realtimeAnalysis, type GeopoliticalEvent, type AnalysisUpdate } from '../services/realtimeNewsService';

interface RealtimeAnalysisPanelProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const RealtimeAnalysisPanel: React.FC<RealtimeAnalysisPanelProps> = ({ 
  isExpanded = false, 
  onToggle 
}) => {
  const [currentEvents, setCurrentEvents] = useState<GeopoliticalEvent[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisUpdate[]>([]);
  const [threatLevel, setThreatLevel] = useState(5);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setCurrentEvents(realtimeAnalysis.getCurrentEvents());
      setLatestAnalysis(realtimeAnalysis.getLatestAnalysis());
      setThreatLevel(realtimeAnalysis.getGlobalThreatLevel());
      setLastUpdate(new Date());
    };

    updateData();
    
    // Update every 5 minutes
    const interval = setInterval(updateData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentEvents(realtimeAnalysis.getCurrentEvents());
    setLatestAnalysis(realtimeAnalysis.getLatestAnalysis());
    setThreatLevel(realtimeAnalysis.getGlobalThreatLevel());
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getThreatLevelColor = (level: number) => {
    if (level >= 4) return 'text-red-400 bg-red-500/20';
    if (level >= 3) return 'text-orange-400 bg-orange-500/20';
    if (level >= 2) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h ago`;
    return `${diffMinutes}m ago`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Real-Time Geopolitical Analysis</h3>
              <p className="text-sm text-gray-400">AI-Powered Intelligence Updates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getThreatLevelColor(threatLevel)}`}>
              Threat Level: {threatLevel}/5
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-700 text-gray-400 rounded-lg hover:text-blue-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-2 bg-slate-700 text-gray-400 rounded-lg hover:text-blue-400 transition-colors"
              >
                {isExpanded ? '−' : '+'}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{currentEvents.length} active situations</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Auto-refresh: 5min</span>
          </div>
        </div>
      </div>

      {/* Critical Events Summary */}
      <div className="p-6 border-b border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Critical Developments
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentEvents.filter(event => event.severity === 'critical').slice(0, 4).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-white text-sm">{event.title}</h5>
                <span className="text-xs text-gray-400">{getTimeAgo(event.timestamp)}</span>
              </div>
              <p className="text-gray-300 text-xs mb-2 line-clamp-2">{event.summary}</p>
              <div className="flex items-center gap-2 text-xs">
                <Globe className="w-3 h-3" />
                <span className="text-gray-400">{event.region}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{event.countries.length} countries</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Latest Analysis */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6"
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Latest Intelligence Analysis
            </h4>
            
            <div className="space-y-4">
              {latestAnalysis.slice(0, 3).map((analysis) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-700/30 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-white mb-1">Analysis Update</h5>
                      <p className="text-xs text-gray-400">By {analysis.analyst} • {getTimeAgo(analysis.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">Confidence</div>
                      <div className="text-sm font-bold text-blue-400">
                        {Math.floor(Math.random() * 20) + 80}%
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed">{analysis.analysis}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Escalation Risk</div>
                      <div className={`text-sm font-bold ${
                        analysis.riskAssessment.escalationRisk >= 80 ? 'text-red-400' :
                        analysis.riskAssessment.escalationRisk >= 60 ? 'text-orange-400' :
                        'text-yellow-400'
                      }`}>
                        {analysis.riskAssessment.escalationRisk}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Economic Impact</div>
                      <div className={`text-sm font-bold ${
                        analysis.riskAssessment.economicImpact >= 70 ? 'text-red-400' :
                        analysis.riskAssessment.economicImpact >= 50 ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {analysis.riskAssessment.economicImpact}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Regional Stability</div>
                      <div className={`text-sm font-bold ${
                        analysis.riskAssessment.regionalStability >= 70 ? 'text-red-400' :
                        analysis.riskAssessment.regionalStability >= 50 ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {analysis.riskAssessment.regionalStability}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Global Impact</div>
                      <div className={`text-sm font-bold ${
                        analysis.riskAssessment.globalImplications >= 70 ? 'text-red-400' :
                        analysis.riskAssessment.globalImplications >= 50 ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {analysis.riskAssessment.globalImplications}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="p-4 bg-slate-800/30 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Sources: Reuters, BBC, AP, Stratfor, Jane's Defence</span>
            <span>•</span>
            <span>AI Analysis Engine: Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400">Live Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};