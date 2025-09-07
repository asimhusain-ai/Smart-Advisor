import { motion } from 'framer-motion';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SkillSlider = ({ skill, onChange, onRemove }) => {
  const skillLevels = [
    'Beginner', 'Basic', 'Intermediate', 'Proficient', 'Advanced', 'Expert'
  ];

  return (
    <motion.div 
      className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-white truncate">{skill.name}</span>
          <span className="text-teal-400 font-bold">{skill.level}/10</span>
        </div>
        
        <Slider
          min={0}
          max={10}
          value={skill.level}
          onChange={onChange}
          trackStyle={{ backgroundColor: '#0ea5e9', height: 6 }}
          handleStyle={{
            borderColor: '#0ea5e9',
            height: 20,
            width: 20,
            backgroundColor: '#1e40af',
          }}
          railStyle={{ backgroundColor: '#334155', height: 6 }}
        />
        
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {skillLevels.map((level, index) => (
            <span key={index} className="text-center" style={{ width: `${100/6}%` }}>
              {index * 2 === 0 ? level : index * 2 === 10 ? level : ''}
            </span>
          ))}
        </div>
      </div>
      
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-300 transition-colors p-2"
        aria-label={`Remove ${skill.name}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default SkillSlider;