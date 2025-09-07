import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer as PieResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useApi';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post } = useApi();
  const { profile, skills } = location.state || {};
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [filters, setFilters] = useState({
    industry: '',
    remote: false,
    minExperience: 0
  });

  // Check if we have the required data on component mount
  useEffect(() => {
    if (!profile || !skills) {
      navigate('/profile');
    }
  }, [profile, skills, navigate]);

  const fetchResults = useCallback(async () => {
    if (!profile || !skills) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post('/api/role-fit', {
        profile,
        skills,
        top_n: 5
      });
      setResults(response);
      setSelectedRole(response.roles[0]);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  }, [profile, skills, post]);

  // Only fetch results once when component mounts
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Analyzing your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
        <button 
          onClick={() => navigate('/profile')}
          className="ml-4 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">No results found</div>
      </div>
    );
  }

  // ... rest of the component remains the same
  const filteredRoles = results.roles.filter(role => {
    if (filters.industry && role.industry !== filters.industry) return false;
    if (filters.remote && !role.remote_friendly) return false;
    if (filters.minExperience > role.min_years_experience) return false;
    return true;
  });

  const donutColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-teal-400 font-poppins mb-2">
            Career Path Analysis
          </h1>
          <p className="text-gray-400">Based on your profile and skills</p>
        </motion.div>

        {/* Role Fit Analysis Card */}
        <motion.div 
          className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-semibold text-teal-400 mb-4 md:mb-0">Role Fit Analysis</h2>

            <div className="flex flex-wrap gap-4">
            
            </div>
          </div>

          <div className="space-y-4">
            {filteredRoles.slice(0, 5).map((role, index) => (
              <motion.div
                key={role.title}
                className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                  <div className="text-2xl font-bold text-teal-400">
                    {role.fit_percentage}%
                  </div>
                </div>

                <div className="w-full bg-slate-600/50 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${role.fit_percentage}%` }}
                  ></div>
                </div>

                <p className="text-gray-300 text-sm mb-3">{role.reason}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">Matching Skills</h4>
                    {role.matching_skills.slice(0, 3).map(skill => (
                      <div key={skill.skill} className="flex justify-between mb-1">
                        <span>{skill.skill}</span>
                        <span className="text-green-300">
                          {skill.user_level}/{skill.required_level}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-medium text-red-400 mb-2">Skills to Improve</h4>
                    {role.missing_skills.slice(0, 3).map(skill => (
                      <div key={skill.skill} className="flex justify-between mb-1">
                        <span>{skill.skill}</span>
                        <span className="text-red-300">
                          {skill.user_level}/{skill.required_level} 
                          ({skill.weeks_to_learn} weeks)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donut Chart Card */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-purple-400 mb-6 text-center">
              Skill Importance for {selectedRole?.title || 'Top Role'}
            </h2>
            
            <div className="h-80">
              <PieResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={results.donut_data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {results.donut_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}% importance`, name]}
                    contentStyle={{ 
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                </PieChart>
              </PieResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar Chart Card */}
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-amber-400 mb-6 text-center">
              Your Skills vs Required Skills
            </h2>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={results.radar_data.skills.map((skill, index) => ({
                  skill,
                  user: results.radar_data.user_levels[index],
                  required: results.radar_data.required_levels[index]
                }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="Your Skills"
                    dataKey="user"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Required Skills"
                    dataKey="required"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => navigate('/profile')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl mr-4 transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-teal-400 to-purple-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-teal-500 hover:to-purple-600 transition-all duration-300"
          >
            Start Over
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;