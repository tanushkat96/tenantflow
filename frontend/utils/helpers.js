export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If already full URL, return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Build full URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${avatarPath}`;
};