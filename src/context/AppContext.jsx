import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

const AppContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const user = authService.getCurrentUser();
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const login = async (email, password) => {
    const { user } = await authService.login(email, password);
    dispatch({ type: 'SET_USER', payload: user });
    showToast('Welcome back, ' + user.name + '!', 'success');
    return user;
  };

  const register = async (data) => {
    const { user } = await authService.register(data);
    dispatch({ type: 'SET_USER', payload: user });
    showToast('Account created successfully!', 'success');
    return user;
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    showToast('Logged out successfully', 'info');
  };

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500);
  };

  return (
    <AppContext.Provider value={{ ...state, login, register, logout, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
