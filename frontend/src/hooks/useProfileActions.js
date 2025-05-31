import { useApi } from './useApi';
import { useNavigate } from 'react-router-dom';

export const useProfileActions = () => {
  const { authFetch } = useApi();
  const navigate = useNavigate();

  const handleDeleteProfile = async () => {
    try {
      await authFetch('/users/delete', {
        method: 'DELETE',
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
    } catch (err) {
      throw new Error('Failed to delete profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  return { handleDeleteProfile, handleLogout };
};