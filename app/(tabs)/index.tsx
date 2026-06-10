import { ScrollView, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const featuredQuery = trpc.series.getFeatured.useQuery({ limit: 10 });
  const trendingQuery = trpc.series.getTrending.useQuery({ limit: 10 });
  const continueReadingQuery = trpc.library.getContinueReading.useQuery({ limit: 5 });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      featuredQuery.refetch(),
      trendingQuery.refetch(),
      continueReadingQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const SeriesCard = ({ item, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="mr-3 rounded-lg overflow-hidden"
      activeOpacity={0.7}
    >
      <View className="w-32 h-48 bg-surface rounded-lg overflow-hidden">
        {item.coverImageUrl ? (
          <Image
            source={{ uri: item.coverImageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-border flex items-center justify-center">
            <Text className="text-muted text-xs text-center px-2">{item.title}</Text>
          </View>
        )}
      </View>
      <Text className="text-sm font-semibold text-foreground mt-2 w-32" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-xs text-muted">{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-foreground">Manga Reader</Text>
          <Text className="text-sm text-muted mt-1">Discover your next favorite series</Text>
        </View>

        {/* Continue Reading Section */}
        {continueReadingQuery.data && continueReadingQuery.data.length > 0 && (
          <View className="mb-6">
            <View className="px-6 flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Continue Reading</Text>
              <Link href={("/library" as any)} asChild>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-semibold">See All</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <FlatList
              horizontal
              data={continueReadingQuery.data}
              keyExtractor={(item) => `continue-${item.id}`}
              renderItem={({ item }) => (
                <View className="ml-6 first:ml-6">
                  <Link href={`/series/${item.id}` as any} asChild>
                    <TouchableOpacity>
                      <SeriesCard item={item} />
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingRight: 24 }}
            />
          </View>
        )}

        {/* Trending Section */}
        {trendingQuery.isLoading ? (
          <View className="px-6 py-8 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View className="mb-6">
            <View className="px-6 flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Trending Now</Text>
              <Link href={("/search" as any)} asChild>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-semibold">Browse All</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <FlatList
              horizontal
              data={trendingQuery.data || []}
              keyExtractor={(item) => `trending-${item.id}`}
              renderItem={({ item }) => (
                <View className="ml-6 first:ml-6">
                  <Link href={`/series/${item.id}` as any} asChild>
                    <TouchableOpacity>
                      <SeriesCard item={item} />
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingRight: 24 }}
            />
          </View>
        )}

        {/* Featured Section */}
        {featuredQuery.data && featuredQuery.data.length > 0 && (
          <View className="mb-6">
            <View className="px-6 mb-3">
              <Text className="text-lg font-bold text-foreground">Featured</Text>
            </View>
            <FlatList
              horizontal
              data={featuredQuery.data}
              keyExtractor={(item) => `featured-${item.id}`}
              renderItem={({ item }) => (
                <View className="ml-6 first:ml-6">
                  <Link href={`/series/${item.id}` as any} asChild>
                    <TouchableOpacity>
                      <SeriesCard item={item} />
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingRight: 24 }}
            />
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
