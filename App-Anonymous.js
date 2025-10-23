import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, useWindowDimensions, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/styles/theme';
import TopBar from './src/components/TopBar';
import Sidebar, { MainContentWrapper } from './src/components/Sidebar';
import { AuthProvider } from './src/context/AuthContext';
import AuthWrapper from './src/components/AuthWrapper';

function MainApp() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(!isMobile); // Mobile: expanded by default, Desktop: collapsed
  const [sidebarVisible, setSidebarVisible] = useState(false); // For mobile overlay visibility
  
  // Web-specific CSS injection for padding removal
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        /* Force remove all padding-top from containers */
        .r-paddingBlock-11f147o {
          padding-top: 0px !important;
          padding-bottom: 8px !important;
        }
        
        .css-view-g5y9jx.r-backgroundColor-11j01x2.r-borderBottomLeftRadius-pm2fo.r-borderTopLeftRadius-ou6ah9.r-boxShadow-17b9qp5.r-flex-13awgt0.r-overflow-1udh08x.r-position-bnwqim.r-transition-1fgtn9uv {
          padding-top: 0px !important;
        }
        
        /* Remove any auto-generated padding-top */
        [class*="r-paddingTop"],
        [style*="padding-top: 80px"],
        [style*="padding-top: 72px"],
        [style*="padding-top: 50px"] {
          padding-top: 0px !important;
        }
        
        .css-1dbjc4n,
        .css-view-1dbjc4n,
        .css-view-175oi2r {
          padding-top: 0px !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  
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

  const navigationRef = useRef();

  const handleNavigate = (screenName) => {
    if (screenName === 'closeSidebar') {
      closeSidebar();
      return;
    }
    
    if (navigationRef.current) {
      navigationRef.current.navigate(screenName);
    }
    
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleProfilePress = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate('Profile');
    }
  };

  const handleStatisticsPress = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate('Statistics');
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
        onStatisticsPress={handleStatisticsPress}
      />
      
      {/* Main content area */}
      <MainContentWrapper 
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
      >
        <AppNavigator ref={navigationRef} />
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
  return (
    <AuthProvider>
      <AuthWrapper>
        <MainApp />
      </AuthWrapper>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      paddingTop: 0,
      marginTop: 0,
    }),
  },
});