/**
 * useFetch Hook
 * 
 * @author Sara Bellaly - Implementation
 * @author Reda Karrach - Architecture
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data from API
 * Handles loading, error, and data states
 */
const useFetch = (fetchFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      console.error('Fetch error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = (...args) => {
    return fetchData(...args);
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    fetchData,
  };
};

export default useFetch;
