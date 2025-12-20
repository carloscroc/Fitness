/**
 * EquipmentFilter Component
 *
 * Advanced equipment filtering component with categories, availability status,
 * and substitution suggestions for flexible exercise selection.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Home,
  Building,
  RefreshCw,
  Info,
  CheckCircle,
  Circle,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Star
} from 'lucide-react';
import {
  EQUIPMENT_TYPES,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_AVAILABILITY,
  EQUIPMENT_SUBSTITUTIONS,
  EquipmentType,
  EquipmentCategory,
  EquipmentAvailability,
  getEquipmentByCategory,
  getEquipmentByAvailability,
  getEquipmentColor
} from '../constants/exerciseFilters';

interface EquipmentFilterProps {
  selectedEquipment: EquipmentType[];
  onEquipmentChange: (equipment: EquipmentType[]) => void;
  maxSelections?: number;
  showAvailability?: boolean;
  showSubstitutions?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

interface EquipmentSubstitution {
  original: EquipmentType;
  substitutes: EquipmentType[];
}

export const EquipmentFilter: React.FC<EquipmentFilterProps> = ({
  selectedEquipment,
  onEquipmentChange,
  maxSelections,
  showAvailability = true,
  showSubstitutions = true,
  compact = false,
  disabled = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<EquipmentAvailability>('both');
  const [showSubstitutions, setShowSubstitutionsDialog] = useState(false);
  const [hoveredEquipment, setHoveredEquipment] = useState<EquipmentType | null>(null);

  // Filter equipment by category and availability
  const filteredEquipment = useMemo(() => {
    let equipment = [...EQUIPMENT_TYPES];

    if (selectedCategory !== 'all') {
      equipment = equipment.filter(eq => eq.category === selectedCategory);
    }

    if (selectedAvailability !== 'both') {
      equipment = equipment.filter(eq => eq.availability === selectedAvailability);
    }

    return equipment;
  }, [selectedCategory, selectedAvailability]);

  // Group equipment by category
  const equipmentByCategory = useMemo(() => {
    const grouped: Record<EquipmentCategory, typeof EQUIPMENT_TYPES> = {} as any;

    EQUIPMENT_CATEGORIES.forEach(category => {
      grouped[category.value] = getEquipmentByCategory(category.value);
    });

    return grouped;
  }, []);

  // Handle equipment selection
  const toggleEquipment = useCallback((equipment: EquipmentType) => {
    if (disabled) return;

    if (maxSelections && selectedEquipment.length >= maxSelections && !selectedEquipment.includes(equipment)) {
      return; // Max selections reached
    }

    const newSelection = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter(eq => eq !== equipment)
      : [...selectedEquipment, equipment];

    onEquipmentChange(newSelection);
  }, [selectedEquipment, onEquipmentChange, maxSelections, disabled]);

  // Handle substitution selection
  const applySubstitution = useCallback((substitution: EquipmentSubstitution) => {
    if (disabled) return;

    const newSelection = selectedEquipment.includes(substitution.original)
      ? [...selectedEquipment.filter(eq => eq !== substitution.original), ...substitution.substitutes]
      : [...selectedEquipment, ...substitution.substitutes];

    onEquipmentChange([...new Set(newSelection)]);
  }, [selectedEquipment, onEquipmentChange, disabled]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    if (disabled) return;
    onEquipmentChange([]);
  }, [onEquipmentChange, disabled]);

  // Get available substitutions for selected equipment
  const getSubstitutions = useCallback((equipment: EquipmentType): EquipmentType[] => {
    const subs = EQUIPMENT_SUBSTITUTIONS[equipment];
    if (!subs) return [];

    return subs.map(sub => {
      const equipmentData = EQUIPMENT_TYPES.find(eq => eq.value === sub);
      return equipmentData?.value || sub as EquipmentType;
    }).filter(Boolean);
  }, []);

  // Check if equipment is selected
  const isEquipmentSelected = useCallback((equipment: EquipmentType) => {
    return selectedEquipment.includes(equipment);
  }, [selectedEquipment]);

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Equipment pills */}
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_TYPES.slice(0, 12).map((equipment) => {
            const isSelected = isEquipmentSelected(equipment.value);
            return (
              <button
                key={equipment.value}
                onClick={() => toggleEquipment(equipment.value)}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'text-white border-2'
                    : 'bg-[#1C1C1E] text-zinc-400 border border-white/10 hover:border-white/20'
                }`}
                style={{
                  backgroundColor: isSelected ? equipment.color : undefined,
                  borderColor: isSelected ? equipment.color : undefined
                }}
              >
                <span>{equipment.icon}</span>
                <span>{equipment.label}</span>
                {isSelected && <CheckCircle size={12} />}
              </button>
            );
          })}
        </div>

        {/* Show more button */}
        {EQUIPMENT_TYPES.length > 12 && (
          <button
            onClick={() => {}}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            +{EQUIPMENT_TYPES.length - 12} more equipment options
          </button>
        )}

        {/* Clear button */}
        {selectedEquipment.length > 0 && (
          <button
            onClick={clearSelection}
            disabled={disabled}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear selection
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Dumbbell size={20} />
            Equipment
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Filter by available equipment
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedEquipment.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              {selectedEquipment.length} selected
            </span>
          )}
          {showSubstitutions && selectedEquipment.length > 0 && (
            <button
              onClick={() => setShowSubstitutionsDialog(!showSubstitutions)}
              className="p-2 rounded-lg bg-[#1C1C1E] text-zinc-400 hover:text-white hover:bg-[#2C2C2E] transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Availability Filter */}
      {showAvailability && (
        <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/10">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Availability
          </h4>

          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_AVAILABILITY.map((availability) => (
              <button
                key={availability.value}
                onClick={() => setSelectedAvailability(
                  selectedAvailability === availability.value ? 'both' : availability.value
                )}
                disabled={disabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedAvailability === availability.value
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                    : 'bg-[#2C2C2E] border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{availability.icon}</span>
                <span>{availability.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/10">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Categories
        </h4>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                : 'bg-[#2C2C2E] border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Filter size={16} />
            <span>All</span>
          </button>

          {EQUIPMENT_CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === category.value
                  ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                  : 'bg-[#2C2C2E] border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span style={{ color: category.color }}>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Equipment {selectedCategory !== 'all' && `(${selectedCategory})`}
          </h4>
          {selectedEquipment.length > 0 && (
            <button
              onClick={clearSelection}
              disabled={disabled}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredEquipment.map((equipment) => {
            const isSelected = isEquipmentSelected(equipment.value);
            const isHovered = hoveredEquipment === equipment.value;
            const hasSubstitutions = getSubstitutions(equipment.value).length > 0;

            return (
              <motion.button
                key={equipment.value}
                onClick={() => toggleEquipment(equipment.value)}
                disabled={disabled}
                className={`relative p-4 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-[#2C2C2E] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                onMouseEnter={() => setHoveredEquipment(equipment.value)}
                onMouseLeave={() => setHoveredEquipment(null)}
              >
                {/* Equipment Icon and Name */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <span
                    className="text-2xl"
                    style={{
                      filter: isSelected ? `drop-shadow(0 0 8px ${equipment.color})` : undefined
                    }}
                  >
                    {equipment.icon}
                  </span>
                  <div className="space-y-1">
                    <div className="text-xs font-bold leading-tight">
                      {equipment.label}
                    </div>

                    {/* Availability indicator */}
                    <div className="flex items-center justify-center gap-1">
                      {equipment.availability === 'home' && <Home size={10} />}
                      {equipment.availability === 'gym' && <Building size={10} />}
                      <span className="text-[10px] opacity-75">
                        {equipment.availability === 'home' ? 'Home' :
                         equipment.availability === 'gym' ? 'Gym' : 'Both'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                <div className="absolute top-2 right-2">
                  {isSelected ? (
                    <CheckCircle size={16} className="text-blue-400" />
                  ) : (
                    <Circle size={16} className="text-zinc-600" />
                  )}
                </div>

                {/* Substitution indicator */}
                {showSubstitutions && hasSubstitutions && isHovered && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full p-1">
                    <Zap size={10} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No equipment found for the selected filters
          </div>
        )}
      </div>

      {/* Substitutions Panel */}
      <AnimatePresence>
        {showSubstitutions && selectedEquipment.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#1C1C1E] rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw size={16} />
                  Equipment Substitutions
                </h4>
                <button
                  onClick={() => setShowSubstitutionsDialog(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-xs text-zinc-400 mb-4">
                Don't have the exact equipment? Here are some alternatives:
              </div>

              <div className="space-y-3">
                {selectedEquipment.map((equipment) => {
                  const substitutes = getSubstitutions(equipment);
                  const equipmentData = EQUIPMENT_TYPES.find(eq => eq.value === equipment);

                  if (!equipmentData || substitutes.length === 0) return null;

                  return (
                    <div key={equipment} className="bg-[#2C2C2E] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{equipmentData.icon}</span>
                          <span className="text-sm font-medium text-white">
                            {equipmentData.label}
                          </span>
                        </div>
                        <button
                          onClick={() => applySubstitution({
                            original: equipment,
                            substitutes
                          })}
                          disabled={disabled}
                          className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Use Substitutes
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {substitutes.map((substitute) => {
                          const subData = EQUIPMENT_TYPES.find(eq => eq.value === substitute);
                          if (!subData) return null;

                          const isAlreadySelected = selectedEquipment.includes(substitute);

                          return (
                            <button
                              key={substitute}
                              onClick={() => toggleEquipment(substitute)}
                              disabled={disabled}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                                isAlreadySelected
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                  : 'bg-[#1C1C1E] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <span>{subData.icon}</span>
                              <span>{subData.label}</span>
                              {isAlreadySelected && <CheckCircle size={10} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Equipment Summary */}
      <AnimatePresence>
        {selectedEquipment.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Selected Equipment ({selectedEquipment.length})
              </h4>
              <button
                onClick={clearSelection}
                disabled={disabled}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedEquipment.map((equipment) => {
                const equipmentData = EQUIPMENT_TYPES.find(eq => eq.value === equipment);
                if (!equipmentData) return null;

                return (
                  <div
                    key={equipment}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: equipmentData.color }}
                  >
                    <span>{equipmentData.icon}</span>
                    <span>{equipmentData.label}</span>
                    <button
                      onClick={() => toggleEquipment(equipment)}
                      disabled={disabled}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquipmentFilter;