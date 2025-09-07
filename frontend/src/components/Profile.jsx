import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TagInput from './TagInput';
import SkillSlider from './SkillSlider';
import ResumeUpload from './ResumeUpload';
import { useApi } from '../hooks/useApi';
import { DEGREES } from '../utils/constants';

const Profile = () => {
  const navigate = useNavigate();
  const { post } = useApi();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    years_of_experience: '',
    interest_areas: [],
    education: '',
    target_roles: [],
    hours_per_week: '',
    duration_weeks: '',
    resume_text: ''
  });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetectSkills = async () => {
    if (!formData.resume_text) return;
    
    setLoading(true);
    try {
      const response = await post('/api/detect-skills', {
        profile: {
          name: formData.name,
          age: parseInt(formData.age),
          years_of_experience: parseInt(formData.years_of_experience),
          interest_areas: formData.interest_areas,
          education: formData.education,
          target_roles: formData.target_roles
        },
        resume_text: formData.resume_text,
        ui_settings: {}
      });

      if (response.skills) {
        const detectedSkills = response.skills.map(skill => ({
          name: skill.canonical,
          level: skill.inferred_level
        }));
        setSkills(detectedSkills);
      }
    } catch (error) {
      console.error('Error detecting skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.age || !formData.years_of_experience || !formData.education) {
      alert('Please fill in all required fields');
      return;
    }

    if (skills.length === 0) {
      alert('Please add at least one skill');
      return;
    }

    navigate('/results', { 
      state: { profile: formData, skills } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-center mb-8 text-teal-400 font-poppins"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Build Your Profile
        </motion.h1>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          {[].map(tab => (
            <button
              key={tab}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'text-teal-400 border-b-2 border-teal-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Profile Card */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-teal-400">Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Age *</label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.years_of_experience}
                  onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Years of professional experience"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interest Areas</label>
                <TagInput
                  tags={formData.interest_areas}
                  onTagsChange={(tags) => handleInputChange('interest_areas', tags)}
                  placeholder="Add interest areas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Education *</label>
                <select
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full bg-slate-700/100 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Select your education</option>
                  {DEGREES.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Goals Card */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Your Goals</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Role Keyword(s)</label>
                <TagInput
                  tags={formData.target_roles}
                  onTagsChange={(tags) => handleInputChange('target_roles', tags)}
                  placeholder="Add target roles..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hours/Week *</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.hours_per_week}
                    onChange={(e) => handleInputChange('hours_per_week', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Hours per week"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (weeks) *</label>
                  <input
                    type="number"
                    min="1"
                    max="520"
                    value={formData.duration_weeks}
                    onChange={(e) => handleInputChange('duration_weeks', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Duration in weeks"
                  />
                </div>
              </div>

              <ResumeUpload
                onTextExtracted={(text) => handleInputChange('resume_text', text)}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Resume Text</label>
                <textarea
                  value={formData.resume_text}
                  onChange={(e) => handleInputChange('resume_text', e.target.value)}
                  rows="6"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Paste or edit your resume text here..."
                />
              </div>

              <button
                onClick={handleDetectSkills}
                disabled={loading || !formData.resume_text}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                {loading ? 'Detecting Skills...' : 'Detect Skills from Text'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Skills Card */}
        <motion.div 
          className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Skills</h2>
          
          <div className="mb-4">
            <TagInput
              tags={skills.map(s => s.name)}
              onTagsChange={(newSkills) => {
                const currentSkillNames = skills.map(s => s.name);
                const addedSkills = newSkills.filter(s => !currentSkillNames.includes(s));
                const removedSkills = currentSkillNames.filter(s => !newSkills.includes(s));
                
                let updatedSkills = skills.filter(s => !removedSkills.includes(s.name));
                
                addedSkills.forEach(skillName => {
                  if (!updatedSkills.find(s => s.name === skillName)) {
                    updatedSkills.push({ name: skillName, level: 5 });
                  }
                });
                
                setSkills(updatedSkills);
              }}
              placeholder="Add skills (type and press Enter)"
            />
          </div>

          <div className="space-y-4">
            {skills.map((skill, index) => (
              <SkillSlider
                key={index}
                skill={skill}
                onChange={(newLevel) => {
                  const updatedSkills = [...skills];
                  updatedSkills[index] = { ...skill, level: newLevel };
                  setSkills(updatedSkills);
                }}
                onRemove={() => {
                  setSkills(skills.filter((_, i) => i !== index));
                }}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <motion.button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-teal-400 to-purple-500 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:from-teal-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See Your Career Path
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;