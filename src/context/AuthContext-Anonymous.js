import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const USER_KEY = 'ssm_user';
const ACCOUNTS_KEY = 'ssm_accounts'; // Store multiple accounts
const CURRENT_ACCOUNT_KEY = 'ssm_current_account';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]); // Multiple saved accounts
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user and accounts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load saved accounts
        const storedAccounts = window.localStorage?.getItem(ACCOUNTS_KEY);
        if (storedAccounts) {
          setAccounts(JSON.parse(storedAccounts));
        }

        // Load current user
        const storedUser = window.localStorage?.getItem(USER_KEY);
        const currentAccountId = window.localStorage?.getItem(CURRENT_ACCOUNT_KEY);
        
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
    }
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.localStorage.setItem(CURRENT_ACCOUNT_KEY, user.id);
      } else {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.removeItem(CURRENT_ACCOUNT_KEY);
      }
    }
  }, [user]);

  // Save accounts to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
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
      const response = await fetch('http://10.2.145.211:4000/api/auth/verify', {
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

  const signOutAll = () => {
    // Sign out from all accounts
    setUser(null);
    setIsAuthenticated(false);
    setAccounts([]);
    
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.removeItem(ACCOUNTS_KEY);
      window.localStorage.removeItem(CURRENT_ACCOUNT_KEY);
      window.localStorage.removeItem('ssm_user_token');
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


