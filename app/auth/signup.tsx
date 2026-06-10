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
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function SignupScreen() {
  const router = useRouter();
  const colors = useColors();
  const { signUp, isLoading, error, clearError } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      clearError();
      await signUp(email, password, name);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Sign Up Failed", error || "Please try again");
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-2">Create Account</Text>
            <Text className="text-base text-muted">Join our manga community</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3 mb-6">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="John Doe"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
              autoCapitalize="words"
            />
          </View>

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
          <View className="mb-4">
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

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Confirm Password</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              secureTextEntry={true}
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-4 mb-4 flex-row items-center justify-center"
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-bold text-base">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center">
            <Text className="text-muted">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text className="text-primary font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
