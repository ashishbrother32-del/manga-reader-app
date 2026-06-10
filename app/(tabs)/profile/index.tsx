import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, signOut, isSignedIn } = useAuth();
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === "dark");

  const statsQuery = trpc.user.getReadingStats.useQuery();
  const meQuery = trpc.auth.me.useQuery();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await signOut();
            (router.replace as any)("/auth/login");
          } catch (err) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  if (!isSignedIn) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-foreground mb-2">Sign In Required</Text>
          <Text className="text-muted text-center mb-6">
            Please sign in to view your profile
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-lg px-6 py-3"
            onPress={() => (router.push as any)("/auth/login")}
          >
            <Text className="text-background font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-foreground">Profile</Text>
        </View>

        {/* User Info Card */}
        <View className="mx-6 mb-6 bg-surface rounded-lg p-4">
          <View className="w-16 h-16 bg-primary rounded-full mb-3" />
          <Text className="text-xl font-bold text-foreground">{user?.name || "User"}</Text>
          <Text className="text-sm text-muted mt-1">{user?.email}</Text>
          {user?.subscriptionStatus === "active" && (
            <View className="mt-3 bg-warning/10 rounded-lg px-3 py-2">
              <Text className="text-xs font-semibold text-warning">Premium Member</Text>
            </View>
          )}
        </View>

        {/* Reading Stats */}
        {statsQuery.data && (
          <View className="mx-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Reading Stats</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-primary">
                  {statsQuery.data.totalChaptersRead}
                </Text>
                <Text className="text-xs text-muted mt-1">Chapters Read</Text>
              </View>
              <View className="flex-1 bg-surface rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-primary">
                  {statsQuery.data.totalSeriesRead}
                </Text>
                <Text className="text-xs text-muted mt-1">Series</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Settings</Text>

          {/* Dark Mode */}
          <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between mb-2">
            <Text className="text-foreground font-semibold">Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Notifications */}
          <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between mb-2">
            <Text className="text-foreground font-semibold">Notifications</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Premium */}
          {user?.subscriptionStatus !== "active" && (
            <TouchableOpacity className="bg-primary rounded-lg p-4 flex-row items-center justify-between">
              <Text className="text-background font-bold">Upgrade to Premium</Text>
              <Text className="text-background text-lg">→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Account</Text>

          <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between mb-2">
            <Text className="text-foreground font-semibold">Change Password</Text>
            <Text className="text-muted">→</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between mb-2">
            <Text className="text-foreground font-semibold">Privacy Policy</Text>
            <Text className="text-muted">→</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
            <Text className="text-foreground font-semibold">Terms of Service</Text>
            <Text className="text-muted">→</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View className="mx-6 mb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-error/10 rounded-lg p-4 flex-row items-center justify-center"
          >
            <Text className="text-error font-bold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
