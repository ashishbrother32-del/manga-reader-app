import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

export default function LibraryScreen() {
  const colors = useColors();
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"favorites" | "history" | "continue">("continue");

  const continueReadingQuery = trpc.library.getContinueReading.useQuery({ limit: 50 });
  const favoritesQuery = trpc.library.getFavorites.useQuery({ limit: 50 });
  const historyQuery = trpc.library.getReadingHistory.useQuery({ limit: 50 });

  if (!isSignedIn) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-foreground mb-2">Sign In Required</Text>
          <Text className="text-muted text-center mb-6">
            Please sign in to access your library
          </Text>
          <Link href={("/auth/login" as any)} asChild>
            <TouchableOpacity className="bg-primary rounded-lg px-6 py-3">
              <Text className="text-background font-bold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScreenContainer>
    );
  }

  const tabs = [
    { id: "continue", label: "Continue Reading" },
    { id: "favorites", label: "Favorites" },
    { id: "history", label: "History" },
  ] as const;

  const currentData =
    activeTab === "continue"
      ? continueReadingQuery.data
      : activeTab === "favorites"
        ? favoritesQuery.data
        : historyQuery.data;

  const isLoading =
    activeTab === "continue"
      ? continueReadingQuery.isLoading
      : activeTab === "favorites"
        ? favoritesQuery.isLoading
        : historyQuery.isLoading;

  const SeriesCard = ({ item }: any) => (
    <Link href={(`/series/${item.seriesId || item.id}` as any)} asChild>
      <TouchableOpacity className="flex-1 m-2">
        <View className="bg-surface rounded-lg overflow-hidden">
          <View className="w-full h-40 bg-border">
            {item.coverImageUrl && (
              <Image
                source={{ uri: item.coverImageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>
          <View className="p-2">
            <Text className="text-xs font-semibold text-foreground" numberOfLines={2}>
              {item.title}
            </Text>
            {item.readPercentage && (
              <View className="mt-2 bg-border rounded-full h-1 overflow-hidden">
                <View
                  className="bg-primary h-full"
                  style={{ width: `${Math.min(item.readPercentage, 100)}%` }}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <FlatList
        data={currentData || []}
        keyExtractor={(item, idx) => `${activeTab}-${item.id}-${idx}`}
        renderItem={({ item }) => <SeriesCard item={item} />}
        numColumns={2}
        columnWrapperStyle={{ flex: 1 }}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="px-6 py-4">
              <Text className="text-3xl font-bold text-foreground">My Library</Text>
            </View>

            {/* Tabs */}
            <View className="px-6 mb-4 flex-row gap-2">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full ${
                    activeTab === tab.id ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      activeTab === tab.id ? "text-background" : "text-foreground"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-6 py-12 items-center">
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text className="text-muted">No items in this section yet</Text>
            )}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
