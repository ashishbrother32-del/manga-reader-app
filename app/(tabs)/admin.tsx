import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

export default function AdminScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"series" | "analytics" | "moderation">("series");
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesAuthor, setNewSeriesAuthor] = useState("");

  const analyticsQuery = trpc.analytics.getDashboard.useQuery();
  const createSeriesMutation = trpc.series.create.useMutation();

  // Check if user is Super Admin
  const isSuperAdmin = user?.email === "ashishbrother32@gmail.com";

  if (!isSuperAdmin) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-foreground mb-2">Access Denied</Text>
          <Text className="text-muted text-center">
            Only Super Admins can access the dashboard
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleCreateSeries = async () => {
    if (!newSeriesTitle || !newSeriesAuthor) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await createSeriesMutation.mutateAsync({
        title: newSeriesTitle,
        author: newSeriesAuthor,
        description: "",
        slug: newSeriesTitle.toLowerCase().replace(/\s+/g, "-"),
      });
      setNewSeriesTitle("");
      setNewSeriesAuthor("");
      Alert.alert("Success", "Series created successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to create series");
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-foreground">Admin Dashboard</Text>
          <Text className="text-sm text-muted mt-1">Super Admin Controls</Text>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-4 flex-row gap-2">
          {["series", "analytics", "moderation"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-xs font-semibold capitalize ${
                  activeTab === tab ? "text-background" : "text-foreground"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === "series" && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Add New Series</Text>

            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
              placeholder="Series Title"
              placeholderTextColor={colors.muted}
              value={newSeriesTitle}
              onChangeText={setNewSeriesTitle}
            />

            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-4"
              placeholder="Author Name"
              placeholderTextColor={colors.muted}
              value={newSeriesAuthor}
              onChangeText={setNewSeriesAuthor}
            />

            <TouchableOpacity
              onPress={handleCreateSeries}
              disabled={createSeriesMutation.isPending}
              className="bg-primary rounded-lg py-3 flex-row items-center justify-center"
            >
              {createSeriesMutation.isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-bold">Create Series</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "analytics" && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Dashboard Metrics</Text>

            {analyticsQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : analyticsQuery.data ? (
              <View>
                <View className="bg-surface rounded-lg p-4 mb-3">
                  <Text className="text-sm text-muted">Total Users</Text>
                  <Text className="text-3xl font-bold text-primary">
                    {analyticsQuery.data.totalUsers}
                  </Text>
                </View>

                <View className="bg-surface rounded-lg p-4 mb-3">
                  <Text className="text-sm text-muted">Premium Subscribers</Text>
                  <Text className="text-3xl font-bold text-primary">
                    {analyticsQuery.data.premiumSubscribers}
                  </Text>
                </View>

                <View className="bg-surface rounded-lg p-4">
                  <Text className="text-sm text-muted">Most Read Series</Text>
                  {analyticsQuery.data.mostReadSeries?.map((series: any) => (
                    <View key={series.id} className="mt-2 flex-row justify-between">
                      <Text className="text-sm text-foreground">{series.title}</Text>
                      <Text className="text-sm text-muted">{series.viewCount} views</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {activeTab === "moderation" && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Moderation Tools</Text>
            <View className="bg-surface rounded-lg p-4">
              <Text className="text-sm text-muted">
                Moderation features coming soon...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
