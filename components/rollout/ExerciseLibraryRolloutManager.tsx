/**
 * Exercise Library Rollout Manager
 *
 * Administrative interface for managing the progressive rollout of enhanced exercise library features.
 * Provides controls for phase management, user targeting, monitoring, and rollback procedures.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Shield,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Download,
  Upload,
  Save,
  X,
  Info,
  AlertCircle,
  Target,
  BarChart3,
  FileText,
  MessageSquare,
  Zap
} from 'lucide-react';

import {
  EXERCISE_LIBRARY_ROLLOUT_CONFIG,
  getCurrentPhase,
  advanceToNextPhase,
  rollbackToPreviousPhase,
  updatePhaseStatus,
  shouldUserGetFeatures,
  getEnabledFeatureGroups,
  exportRolloutConfig,
  validateRolloutConfig
} from '../../config/exerciseLibraryRolloutConfig';
import { FeatureFlag, getEnabledFeatureFlags } from '../../services/featureFlags';

interface RolloutManagerProps {
  environment?: string;
  onPhaseChange?: (phase: any) => void;
  className?: string;
}

const ExerciseLibraryRolloutManager: React.FC<RolloutManagerProps> = ({
  environment,
  onPhaseChange,
  className = ''
}) => {
  const [currentPhase, setCurrentPhase] = useState<any>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environment || 'development');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [testUserId, setTestUserId] = useState('');

  useEffect(() => {
    loadCurrentState();
  }, [selectedEnvironment]);

  const loadCurrentState = () => {
    setIsLoading(true);
    try {
      const phase = getCurrentPhase(selectedEnvironment);
      setCurrentPhase(phase);
      setValidationResult(validateRolloutConfig(EXERCISE_LIBRARY_ROLLOUT_CONFIG));
    } catch (error) {
      console.error('Error loading rollout state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancePhase = async () => {
    setPendingAction('advance');
    setShowConfirmDialog(true);
  };

  const handleRollbackPhase = async () => {
    setPendingAction('rollback');
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    let success = false;
    let message = '';

    try {
      switch (pendingAction) {
        case 'advance':
          success = advanceToNextPhase(selectedEnvironment);
          message = success ? 'Successfully advanced to next phase' : 'Failed to advance phase';
          break;
        case 'rollback':
          success = rollbackToPreviousPhase(selectedEnvironment);
          message = success ? 'Successfully rolled back to previous phase' : 'Failed to rollback phase';
          break;
      }

      if (success) {
        loadCurrentState();
        onPhaseChange?.(getCurrentPhase(selectedEnvironment));
      }

      alert(message);
    } catch (error) {
      console.error('Error executing action:', error);
      alert('Error executing action. Please try again.');
    } finally {
      setShowConfirmDialog(false);
      setPendingAction('');
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const testUserAccess = () => {
    const hasAccess = shouldUserGetFeatures(testUserId, selectedEnvironment);
    const featureGroups = getEnabledFeatureGroups(testUserId, selectedEnvironment);

    alert(`User ${testUserId || 'Anonymous'}:\n` +
          `Has Access: ${hasAccess ? 'Yes' : 'No'}\n` +
          `Feature Groups: ${featureGroups.join(', ') || 'None'}`);
  };

  const exportConfiguration = () => {
    const config = exportRolloutConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exercise-library-rollout-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'rolled_back':
        return <RotateCcw className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rolled_back':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercise Library Rollout Manager</h1>
            <p className="text-gray-600">Manage the progressive rollout of enhanced exercise library features</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
            <button
              onClick={exportConfiguration}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Export Configuration"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Current Phase</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {currentPhase?.name?.split(' - ')[1] || 'N/A'}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Rollout Percentage</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {currentPhase?.percentage || 0}%
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Feature Groups</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {currentPhase?.featureGroups?.length || 0}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Monitoring</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {currentPhase?.monitoringEnabled ? 'Active' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Phase Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <button
          onClick={() => toggleSection('phases')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            <ChevronRight
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expandedSections.has('phases') ? 'rotate-90' : ''
              }`}
            />
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Phase Management</h2>
          </div>
        </button>

        <AnimatePresence>
          {expandedSections.has('phases') && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-gray-200"
            >
              <div className="p-6 space-y-4">
                {/* Current Phase Details */}
                {currentPhase && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Current Phase: {currentPhase.name}</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(currentPhase.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentPhase.status)}`}>
                          {currentPhase.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{currentPhase.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Feature Groups</h4>
                        <div className="space-y-1">
                          {currentPhase.featureGroups.map((group: string) => (
                            <div key={group} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">{group}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Target Criteria</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Percentage: {currentPhase.targetCriteria.percentage}%</div>
                          {currentPhase.targetCriteria.userSegments && (
                            <div>Segments: {currentPhase.targetCriteria.userSegments.length}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phase Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleAdvancePhase}
                        disabled={currentPhase.status === 'completed' || currentPhase.percentage >= 100}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>Advance Phase</span>
                      </button>
                      <button
                        onClick={handleRollbackPhase}
                        disabled={currentPhase.status === 'pending'}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Rollback</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Phase Timeline */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Phase Timeline</h4>
                  <div className="space-y-2">
                    {EXERCISE_LIBRARY_ROLLOUT_CONFIG.phases.map((phase, index) => {
                      const isActive = phase.id === currentPhase?.id;
                      const isCompleted = index < EXERCISE_LIBRARY_ROLLOUT_CONFIG.environments[selectedEnvironment]?.currentPhase;

                      return (
                        <div
                          key={phase.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${
                            isActive ? 'bg-blue-50 border-blue-200' :
                            isCompleted ? 'bg-green-50 border-green-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${
                            isActive ? 'bg-blue-600' : isCompleted ? 'bg-green-600' : 'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{phase.name}</span>
                              <span className="text-sm text-gray-600">{phase.percentage}%</span>
                            </div>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* User Testing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <button
          onClick={() => toggleSection('testing')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            <ChevronRight
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expandedSections.has('testing') ? 'rotate-90' : ''
              }`}
            />
            <Eye className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">User Testing</h2>
          </div>
        </button>

        <AnimatePresence>
          {expandedSections.has('testing') && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    placeholder="Enter user ID to test access (leave empty for anonymous)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={testUserAccess}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Test Access
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Test whether a specific user would have access to the enhanced exercise library features.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Validation Status */}
      {validationResult && !validationResult.isValid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Configuration Validation Errors</h3>
              <ul className="mt-2 space-y-1">
                {validationResult.errors.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm {pendingAction === 'advance' ? 'Phase Advancement' : 'Phase Rollback'}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {pendingAction} the rollout phase? This action will affect user experience.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`px-4 py-2 text-white rounded-md ${
                    pendingAction === 'advance' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseLibraryRolloutManager;