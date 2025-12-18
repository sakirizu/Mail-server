import React, { useState, useRef } from "react";
import { View, StyleSheet, StatusBar, useWindowDimensions, Platform, TouchableOpacity, Text, Animated } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/styles/theme";
import TopBar from "./src/components/TopBar";
import Sidebar, { MainContentWrapper } from "./src/components/Sidebar";
import { AuthProvider } from "./src/context/AuthContext";
import { SearchProvider } from "./src/context/SearchContext";
import AuthWrapper from "./src/components/AuthWrapper";
import ComposeModal from "./src/components/ComposeModal";

function MainApp({ navigationRef }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(!isMobile);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);
  const [hoverLeft, setHoverLeft] = useState(false);
  const [composeModalVisible, setComposeModalVisible] = useState(false);
  const labelOpacityRight = useRef(new Animated.Value(0)).current;
  const labelOpacityLeft = useRef(new Animated.Value(0)).current;
  
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
    if (screenName === "closeSidebar") {
      closeSidebar();
      return;
    }
    
    // Handle Compose modal instead of navigation
    if (screenName === "Compose") {
      setComposeModalVisible(true);
      if (isMobile) {
        closeSidebar();
      }
      return;
    }
    
    if (navigationRef.current) {
      navigationRef.current.navigate(screenName);
    }
    
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleProfilePress = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate("Profile");
    }
  };

  const handleStatisticsPress = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate("Statistics");
    }
  };

  const handleHoverIn = (side) => {
    if (Platform.OS === 'web') {
      if (side === 'right') {
        setHoverRight(true);
        Animated.timing(labelOpacityRight, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        setHoverLeft(true);
        Animated.timing(labelOpacityLeft, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleHoverOut = (side) => {
    if (Platform.OS === 'web') {
      if (side === 'right') {
        setHoverRight(false);
        Animated.timing(labelOpacityRight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        setHoverLeft(false);
        Animated.timing(labelOpacityLeft, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primary}
        translucent={false}
      />
      
      <TopBar 
        onMenuPress={toggleSidebar} 
        onProfilePress={handleProfilePress}
        onStatisticsPress={handleStatisticsPress}
      />
      
      <MainContentWrapper 
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
      >
        <AppNavigator />
      </MainContentWrapper>
      
      <TouchableOpacity 
        style={[styles.floatingButton, isMobile && styles.floatingButtonMobile]}
        onPress={() => setComposeModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
    
      
      <Sidebar 
        collapsed={sidebarCollapsed}
        isVisible={isMobile ? sidebarVisible : true}
        isMobile={isMobile}
        onNavigate={handleNavigate}
      />

      {/* Compose Modal */}
      <ComposeModal
        visible={composeModalVisible}
        onClose={() => setComposeModalVisible(false)}
      />
    </View>
  );
}

export default function App() {
  const navigationRef = useRef();

  return (
    <AuthProvider>
      <SearchProvider>
        <NavigationContainer ref={navigationRef}>
          <AuthWrapper>
            <MainApp navigationRef={navigationRef} />
          </AuthWrapper>
        </NavigationContainer>
      </SearchProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  
  floatingButtonMobile: {
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 10,
  },
  
  floatingButtonLeft: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  
  floatingButtonLeftMobile: {
    bottom: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 10,
  },
  
  floatingButtonIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
});
