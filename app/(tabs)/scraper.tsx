import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

interface ScrapedChannel {
  id: string;
  channelUrl: string;
  channelName: string;
  seriesName: string;
  lastSync: Date;
  chaptersCount: number;
  status: "active" | "syncing" | "error";
}

export default function ScraperScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [channelUrl, setChannelUrl] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [activeTab, setActiveTab] = useState<"add" | "manage" | "sync">("add");

  const addChannelMutation = trpc.telegram.addChannel.useMutation();
  const scrapeChannelMutation = trpc.telegram.scrapeChannel.useMutation();
  const importChaptersMutation = trpc.telegram.importChapters.useMutation();
  const getChannelsQuery = trpc.telegram.getChannels.useQuery();
  const syncStatusQuery = trpc.telegram.getSyncStatus.useQuery();

  // Check if user is Super Admin
  const isSuperAdmin = user?.email === "ashishbrother32@gmail.com";

  if (!isSuperAdmin) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-foreground mb-2">Access Denied</Text>
          <Text className="text-muted text-center">
            Only Super Admins can access the Telegram scraper
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleAddChannel = async () => {
    if (!channelUrl || !seriesName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await addChannelMutation.mutateAsync({
        channelUrl,
        channelName: channelUrl,
        seriesName,
        isPrivate,
      });

      Alert.alert("Success", "Channel added successfully");
      setChannelUrl("");
      setSeriesName("");
      setIsPrivate(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add channel");
    }
  };

  const handleScrapeChannel = async () => {
    if (!channelUrl) {
      Alert.alert("Error", "Please enter a channel URL");
      return;
    }

    try {
      const result = await scrapeChannelMutation.mutateAsync({
        channelUrl,
      });

      Alert.alert(
        "Success",
        `Found ${result.chaptersFound} chapters in ${result.channelUsername}`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to scrape channel");
    }
  };

  const handleImportChapters = async () => {
    if (!channelUrl || !seriesName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const result = await importChaptersMutation.mutateAsync({
        channelUrl,
        seriesName,
      });

      Alert.alert("Success", result.message);
      setChannelUrl("");
      setSeriesName("");
    } catch (error) {
      Alert.alert("Error", "Failed to import chapters");
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-foreground">Telegram Scraper</Text>
          <Text className="text-sm text-muted mt-1">Import manga from Telegram channels</Text>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-4 flex-row gap-2">
          {["add", "manage", "sync"].map((tab) => (
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
                {tab === "add" ? "Add Channel" : tab === "manage" ? "Manage" : "Sync"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Channel Tab */}
        {activeTab === "add" && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Add Telegram Channel</Text>

            <Text className="text-sm text-muted mb-2">Channel URL or Username</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-4"
              placeholder="https://t.me/channel_name or @channel_name"
              placeholderTextColor={colors.muted}
              value={channelUrl}
              onChangeText={setChannelUrl}
            />

            <Text className="text-sm text-muted mb-2">Series Name</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-4"
              placeholder="Enter series name"
              placeholderTextColor={colors.muted}
              value={seriesName}
              onChangeText={setSeriesName}
            />

            {/* Private Channel Toggle */}
            <View className="flex-row items-center mb-4">
              <TouchableOpacity
                onPress={() => setIsPrivate(!isPrivate)}
                className={`w-6 h-6 rounded border-2 items-center justify-center ${
                  isPrivate ? "bg-primary border-primary" : "border-border"
                }`}
              >
                {isPrivate && <Text className="text-background font-bold">✓</Text>}
              </TouchableOpacity>
              <Text className="text-sm text-foreground ml-3">Private Channel</Text>
            </View>

            {/* Preview Button */}
            <TouchableOpacity
              onPress={handleScrapeChannel}
              disabled={scrapeChannelMutation.isPending}
              className="bg-surface border border-border rounded-lg py-3 flex-row items-center justify-center mb-3"
            >
              {scrapeChannelMutation.isPending ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text className="text-primary font-bold">Preview Chapters</Text>
              )}
            </TouchableOpacity>

            {/* Import Button */}
            <TouchableOpacity
              onPress={handleImportChapters}
              disabled={importChaptersMutation.isPending}
              className="bg-primary rounded-lg py-3 flex-row items-center justify-center"
            >
              {importChaptersMutation.isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-bold">Import Chapters</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Manage Channels Tab */}
        {activeTab === "manage" && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Configured Channels</Text>

            {getChannelsQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : getChannelsQuery.data && getChannelsQuery.data.channels.length > 0 ? (
              <FlatList
                data={getChannelsQuery.data.channels}
                keyExtractor={(item: any) => item.id}
                scrollEnabled={false}
                renderItem={({ item }: { item: any }) => (
                  <View className="bg-surface rounded-lg p-4 mb-3">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {item.seriesName}
                        </Text>
                        <Text className="text-xs text-muted mt-1">{item.channelUrl}</Text>
                      </View>
                      <View
                        className={`px-2 py-1 rounded ${
                          item.status === "active"
                            ? "bg-success/10"
                            : item.status === "syncing"
                            ? "bg-warning/10"
                            : "bg-error/10"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            item.status === "active"
                              ? "text-success"
                              : item.status === "syncing"
                              ? "text-warning"
                              : "text-error"
                          }`}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between text-xs text-muted">
                      <Text>{item.chaptersCount} chapters</Text>
                      <Text>Last sync: {new Date(item.lastSync).toLocaleDateString()}</Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View className="bg-surface rounded-lg p-4">
                <Text className="text-sm text-muted">No channels configured yet</Text>
              </View>
            )}
          </View>
        )}

        {/* Sync Status Tab */}
        {activeTab === "sync" && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Sync Status</Text>

            {syncStatusQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : syncStatusQuery.data ? (
              <View>
                <View className="bg-surface rounded-lg p-4 mb-4">
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-sm text-muted">Status</Text>
                    <Text className="text-sm font-semibold text-foreground capitalize">
                      {syncStatusQuery.data.status}
                    </Text>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <Text className="text-sm text-muted">Total Channels</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {syncStatusQuery.data.channelsTotal}
                    </Text>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <Text className="text-sm text-muted">Synced</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {syncStatusQuery.data.channelsSynced}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Last Sync</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {new Date(syncStatusQuery.data.lastSync).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity className="bg-primary rounded-lg py-3 flex-row items-center justify-center">
                  <Text className="text-background font-bold">Sync Now</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
