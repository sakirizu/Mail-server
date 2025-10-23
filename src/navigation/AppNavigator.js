import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import InboxScreen from '../screens/InboxScreen';
import SentScreen from '../screens/SentScreen';
import ComposeScreen from '../screens/ComposeScreen';
import DraftsScreen from '../screens/DraftsScreen';
import SpamScreen from '../screens/SpamScreen';
import MailDetailScreen from '../screens/MailDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import TwoFactorAuthScreen from '../screens/TwoFactorAuthScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import HelpScreen from '../screens/HelpScreen';
import SupportScreen from '../screens/SupportScreen';
import UserGuideScreen from '../screens/UserGuideScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Inbox"
      screenOptions={{
        headerShown: false, // Hide headers since we have TopBar
      }}
    >
        <Stack.Screen 
          name="Inbox" 
          component={InboxScreen}
        />
        <Stack.Screen 
          name="Sent" 
          component={SentScreen}
        />
        <Stack.Screen 
          name="Compose" 
          component={ComposeScreen}
        />
        <Stack.Screen 
          name="Drafts" 
          component={DraftsScreen}
        />
        <Stack.Screen 
          name="Spam" 
          component={SpamScreen}
        />
        <Stack.Screen 
          name="MailDetail" 
          component={MailDetailScreen}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
        />
        <Stack.Screen 
          name="TwoFactorAuth" 
          component={TwoFactorAuthScreen}
        />
        <Stack.Screen 
          name="Statistics" 
          component={StatisticsScreen}
        />
        <Stack.Screen 
          name="HelpSupport" 
          component={HelpSupportScreen}
        />
        <Stack.Screen 
          name="UserGuide" 
          component={UserGuideScreen}
        />
        <Stack.Screen 
          name="Help" 
          component={HelpScreen}
        />
        <Stack.Screen 
          name="Support" 
          component={SupportScreen}
        />
        <Stack.Screen 
          name="DeleteAccount" 
          component={DeleteAccountScreen}
        />
      </Stack.Navigator>
  );
};

export default AppNavigator;