import React from 'react';
import { FlatList, View, StyleSheet, useWindowDimensions } from 'react-native';
import MailItem from './MailItem';
import { colors } from '../styles/theme';

// Fallback example emails if no data is passed
const exampleMails = [
  { id: 1, subject: 'Welcome to Pro Mail!', sender: 'admin@promail.com', snippet: 'Thanks for joining our professional email platform. Explore all the features.' },
  { id: 2, subject: 'Your account setup', sender: 'support@promail.com', snippet: 'Your professional email account has been successfully configured.' },
  { id: 3, subject: 'Team meeting reminder', sender: 'calendar@promail.com', snippet: 'Don\'t forget about our team meeting scheduled for today at 10 AM.' },
];

const MailList = ({ mails }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;

  const data = mails && mails.length > 0 ? mails : exampleMails;
  const renderItem = ({ item }) => <MailItem mail={item} />;

  return (
    <View style={[
      styles.container, 
      isDesktop && styles.containerDesktop,
      isMobile && styles.containerMobile
    ]}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          isMobile && styles.listContentMobile
        ]}
        style={styles.list}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        getItemLayout={(data, index) => (
          { length: isMobile ? 88 : 72, offset: (isMobile ? 88 : 72) * index, index }
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDesktop: {
    backgroundColor: colors.surface,
  },
  containerMobile: {
    backgroundColor: colors.background,
    paddingTop: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
  },
  listContentMobile: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
});

export default MailList;

