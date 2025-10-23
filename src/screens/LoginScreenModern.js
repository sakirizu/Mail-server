import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreenModern({ navigation }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleLogin = async () => {
    // ログイン処理（既存のコード）
    Alert.alert('ログイン', 'ログイン機能は既存のLoginScreen.jsを参照してください');
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className={`flex-1 items-center justify-center ${isMobile ? 'px-6 py-12' : 'px-8 py-16'}`}>
        {/* カード */}
        <View className={`bg-white rounded-2xl shadow-lg ${isMobile ? 'w-full max-w-md' : 'w-full max-w-lg'} p-8`}>
          {/* ヘッダー */}
          <View className="items-center mb-8">
            <View className="bg-blue-500 w-16 h-16 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">📧</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">SMAIL</Text>
            <Text className="text-lg text-gray-600">
              {isSignup ? '新規アカウント作成' : 'アカウントにログイン'}
            </Text>
          </View>

          {/* フォーム */}
          <View className="space-y-4">
            {isSignup && (
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">お名前</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-900"
                  placeholder="お名前を入力"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}
            
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">ユーザー名</Text>
              <TextInput
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-900"
                placeholder="ユーザー名またはメールアドレス"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">パスワード</Text>
              <TextInput
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-900"
                placeholder="パスワードを入力"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {isSignup && (
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">パスワード確認</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-900"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}

            {!isSignup && (
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => setStayLoggedIn(!stayLoggedIn)}
              >
                <View className={`w-5 h-5 rounded border-2 ${stayLoggedIn ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} items-center justify-center mr-2`}>
                  {stayLoggedIn && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className="text-gray-700">ログイン状態を保持</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* メインボタン */}
          <TouchableOpacity 
            className={`w-full py-4 rounded-lg mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
            onPress={isSignup ? () => Alert.alert('登録') : handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? '処理中...' : isSignup ? 'アカウント作成' : 'ログイン'}
            </Text>
          </TouchableOpacity>

          {/* トグル */}
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-gray-600 mr-2">
              {isSignup ? 'アカウントをお持ちですか？' : 'アカウントをお持ちでない方'}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text className="text-blue-500 font-semibold">
                {isSignup ? 'ログイン' : 'アカウント作成'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
