import React, { useState, useRef } from 'react';
import { View, Sty      <MainContentWrapper 
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        sidebarVisible={sidebarVisible}
      >
        <AppNavigator />
      </MainContentWrapper>
      
      {/* Floating Compose Button */}
      <TouchableOpacity 
        style={[styles.floatingButton, isMobile && styles.floatingButtonMobile]}
        onPress={() => handleNavigate('Compose')}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonIcon}>✏️</Text>
      </TouchableOpacity>
      
      {/* Floating Sidebar - rendered last to be on top */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        isVisible={isMobile ? sidebarVisible : true}
        isMobile={isMobile}
        onNavigate={handleNavigate}
      />Bar, useWindowDimensions, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/styles/theme';
import TopBar from './src/components/TopBar';
import Sidebar, { MainContentWrapper } from './src/components/Sidebar';
import { AuthProvider } from './src/context/AuthContext';
import AuthWrapper from './src/components/AuthWrapper';

function MainApp({ navigationRef }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(!isMobile); // Mobile: expanded by default, Desktop: collapsed
  const [sidebarVisible, setSidebarVisible] = useState(false); // For mobile overlay visibility
  
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const handleNavigate = (screenName) => {
    if (screenName === 'closeSidebar') {
      closeSidebar();
      return;
    }
    
    if (navigationRef?.current) {
      navigationRef.current.navigate(screenName);
    }
    
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleProfilePress = () => {
    if (navigationRef?.current) {
      navigationRef.current.navigate('Profile');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primary}
        translucent={false}
      />
      
      {/* TopBar always on top */}
      <TopBar 
        onMenuPress={toggleSidebar} 
        onProfilePress={handleProfilePress}
      />
      
      {/* Main content area */}
      <MainContentWrapper 
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
        sidebarVisible={sidebarVisible}
      >
        <AppNavigator />
      </MainContentWrapper>
      
      {/* Floating Sidebar - rendered last to be on top */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        isVisible={isMobile ? sidebarVisible : true}
        isMobile={isMobile}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

export default function App() {
  const navigationRef = useRef();

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AuthWrapper navigationRef={navigationRef}>
          <MainApp navigationRef={navigationRef} />
        </AuthWrapper>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',   // TopBar absolute positioning uchun
  },
});