import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      clearError();
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Login Failed", error || "Please try again");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Google Sign In Failed", "Please try again");
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-2">Welcome Back</Text>
            <Text className="text-base text-muted">Sign in to your manga reader account</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3 mb-6">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
            <View className="flex-row items-center bg-surface border border-border rounded-lg px-4 py-3">
              <TextInput
                className="flex-1 text-foreground"
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text className="text-primary text-sm font-semibold">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity className="mb-6" disabled={isLoading}>
            <Text className="text-primary text-sm font-semibold">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-4 mb-4 flex-row items-center justify-center"
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-border" />
            <Text className="px-3 text-muted text-sm">or continue with</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            className="bg-surface border border-border rounded-lg py-4 flex-row items-center justify-center mb-6"
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text className="text-foreground font-semibold text-base">Google Sign In</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text className="text-muted">Don't have an account? </Text>
            <Link href="/auth/signup" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text className="text-primary font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
