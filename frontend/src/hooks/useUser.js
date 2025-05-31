import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useUser = () => {
  const { authFetch } = useApi();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await authFetch('/users/me');
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = await authFetch('/users/update', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, updateUser, fetchUser };
};