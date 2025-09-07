export const normalizeSkills = (skills, taxonomy) => {
  return skills.map(skill => {
    const lowerSkill = skill.toLowerCase().trim();
    
    for (const [canonical, variants] of Object.entries(taxonomy)) {
      if (variants.includes(lowerSkill) || canonical.toLowerCase() === lowerSkill) {
        return canonical;
      }
    }
    
    return skill;
  });
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const formatPercentage = (value) => {
  return `${Math.round(value * 100)}%`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};