import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function SearchScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const searchQuery_trpc = trpc.series.search.useQuery(
    {
      query: searchQuery || "",
      status: selectedStatus as any,
      limit: 20,
    },
    { enabled: searchQuery.length > 0 }
  );

  const statuses = ["ongoing", "completed", "hiatus", "cancelled"];

  const SeriesItem = ({ item }: any) => (
    <Link href={(`/series/${item.id}` as any)} asChild>
      <TouchableOpacity className="flex-row mb-4 bg-surface rounded-lg overflow-hidden">
        <View className="w-24 h-32 bg-border">
          {item.coverImageUrl && (
            <Image
              source={{ uri: item.coverImageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
        </View>
        <View className="flex-1 p-3">
          <Text className="text-base font-bold text-foreground" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-sm text-muted mt-1">{item.author}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {item.status}
            </Text>
            {item.isPremium && (
              <Text className="text-xs bg-warning/10 text-warning px-2 py-1 rounded ml-2">
                Premium
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <FlatList
        data={searchQuery_trpc.data || []}
        keyExtractor={(item) => `search-${item.id}`}
        renderItem={({ item }) => <SeriesItem item={item} />}
        ListHeaderComponent={
          <View>
            {/* Search Bar */}
            <View className="px-6 py-4">
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="Search manga..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Status Filters */}
            <View className="px-6 mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Filter by Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
                    className={`px-3 py-2 rounded-full ${
                      selectedStatus === status
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold capitalize ${
                        selectedStatus === status ? "text-background" : "text-foreground"
                      }`}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Results Header */}
            {searchQuery && (
              <View className="px-6 mb-4">
                <Text className="text-sm text-muted">
                  {searchQuery_trpc.isLoading
                    ? "Searching..."
                    : `Found ${searchQuery_trpc.data?.length || 0} results`}
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          searchQuery ? (
            <View className="px-6 py-8 items-center">
              {searchQuery_trpc.isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text className="text-muted">No results found</Text>
              )}
            </View>
          ) : (
            <View className="px-6 py-8 items-center">
              <Text className="text-muted">Start typing to search</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
