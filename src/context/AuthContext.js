import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const USER_KEY = 'ssm_user';
const ACCOUNTS_KEY = 'ssm_accounts'; // Store multiple accounts
const CURRENT_ACCOUNT_KEY = 'ssm_current_account';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]); // Multiple saved accounts
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Load user and accounts from AsyncStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Check for stay logged in preference
        const stayLoggedIn = await AsyncStorage.getItem('stayLoggedIn');
        const userCredentials = await AsyncStorage.getItem('userCredentials');
        
        if (stayLoggedIn === 'true' && userCredentials) {
          // Auto-login with saved credentials
          const { username, password } = JSON.parse(userCredentials);
          await performAutoLogin(username, password);
          return; // Exit early if auto-login is attempted
        }

        // Load saved accounts
        const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
        if (storedAccounts) {
          setAccounts(JSON.parse(storedAccounts));
        }

        // Load current user
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const currentAccountId = await AsyncStorage.getItem(CURRENT_ACCOUNT_KEY);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } else if (currentAccountId && storedAccounts) {
          // Auto-login with last account if available
          const savedAccounts = JSON.parse(storedAccounts);
          const lastAccount = savedAccounts.find(acc => acc.id === currentAccountId);
          if (lastAccount) {
            autoLogin(lastAccount);
          }
        }
      } catch (error) {
        console.error('Error loading authentication data:', error);
      }
    };

    loadStoredData();
  }, []);

  const performAutoLogin = async (username, password) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.token && data.user && !data.requires2FA) {
          const userWithToken = { ...data.user, token: data.token };
          setUser(userWithToken);
          setIsAuthenticated(true);
          
          // Save user data
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithToken));
          
          console.log('✅ Auto-login successful');
        } else {
          // If 2FA required or other issues, remove auto-login
          await AsyncStorage.removeItem('stayLoggedIn');
          await AsyncStorage.removeItem('userCredentials');
        }
      } else {
        // Login failed, remove saved credentials
        await AsyncStorage.removeItem('stayLoggedIn');
        await AsyncStorage.removeItem('userCredentials');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      await AsyncStorage.removeItem('stayLoggedIn');
      await AsyncStorage.removeItem('userCredentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Save user to AsyncStorage on change
  useEffect(() => {
    const saveUserData = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
          await AsyncStorage.setItem(CURRENT_ACCOUNT_KEY, user.id);
        } else {
          await AsyncStorage.removeItem(USER_KEY);
          await AsyncStorage.removeItem(CURRENT_ACCOUNT_KEY);
        }
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    };

    saveUserData();
  }, [user]);

  // Save accounts to AsyncStorage
  useEffect(() => {
    const saveAccountsData = async () => {
      try {
        await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      } catch (error) {
        console.error('Error saving accounts data:', error);
      }
    };

    saveAccountsData();
  }, [accounts]);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Add or update account in saved accounts
    setAccounts(prevAccounts => {
      const existingIndex = prevAccounts.findIndex(acc => acc.id === userData.id);
      const accountData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        token: userData.token,
        lastLogin: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Update existing account
        const updated = [...prevAccounts];
        updated[existingIndex] = accountData;
        return updated;
      } else {
        // Add new account
        return [...prevAccounts, accountData];
      }
    });
  };

  const autoLogin = async (accountData) => {
    try {
      // Verify token is still valid
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accountData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUser(accountData);
        setIsAuthenticated(true);
      } else {
        // Token expired, remove from saved accounts
        removeAccount(accountData.id);
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      removeAccount(accountData.id);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Check if there are other accounts to auto-login
    const otherAccounts = accounts.filter(acc => acc.id !== user?.id);
    
    if (otherAccounts.length > 0) {
      // Auto-login with the most recently used account
      const mostRecentAccount = otherAccounts.reduce((latest, current) => {
        return new Date(current.lastLogin) > new Date(latest.lastLogin) ? current : latest;
      });
      
      setTimeout(() => {
        autoLogin(mostRecentAccount);
      }, 500); // Small delay for better UX
    }
  };

  const signOut = () => {
    // Complete sign out - remove current user but keep accounts for quick switching
    setUser(null);
    setIsAuthenticated(false);
  };

  const signOutAll = async () => {
    // Sign out from all accounts
    setUser(null);
    setIsAuthenticated(false);
    setAccounts([]);
    
    try {
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(ACCOUNTS_KEY);
      await AsyncStorage.removeItem(CURRENT_ACCOUNT_KEY);
      await AsyncStorage.removeItem('ssm_user_token');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const switchAccount = (accountData) => {
    autoLogin(accountData);
  };

  const removeAccount = (accountId) => {
    setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
    
    // If removing current user, logout
    if (user?.id === accountId) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accounts,
      isAuthenticated,
      isLoading,
      login, 
      logout, 
      signOut,
      signOutAll,
      switchAccount,
      removeAccount,
      autoLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
