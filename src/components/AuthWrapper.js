import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';
import LoginScreen from '../screens/LoginScreen';
import TwoFactorVerifyScreen from '../screens/TwoFactorVerifyScreen';

const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="TwoFactorVerify" component={TwoFactorVerifyScreen} />
    </AuthStack.Navigator>
  );
};

const AuthWrapper = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: colors.text,
          fontWeight: '500'
        }}>
          Loading SSM Mail...
        </Text>
      </View>
    );
  }

  if (!user || !isAuthenticated) {
    return <AuthNavigator />;
  }

  return children;
};

export default AuthWrapper;

