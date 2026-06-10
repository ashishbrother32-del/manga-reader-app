import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { isSignedIn } = useAuth();
  const [isFav, setIsFav] = useState(false);

  const seriesQuery = trpc.series.getById.useQuery({ id: parseInt(id as string) });
  const chaptersQuery = trpc.chapters.getBySeriesId.useQuery({
    seriesId: parseInt(id as string),
    limit: 50,
  });
  const isFavQuery = trpc.library.isFavorite.useQuery(
    { seriesId: parseInt(id as string) },
    { enabled: isSignedIn }
  );
  const addFavMutation = trpc.library.addFavorite.useMutation();
  const removeFavMutation = trpc.library.removeFavorite.useMutation();

  const handleToggleFavorite = async () => {
    if (!isSignedIn) {
      Alert.alert("Sign In Required", "Please sign in to add favorites");
      return;
    }

    try {
      if (isFav) {
        await removeFavMutation.mutateAsync({ seriesId: parseInt(id as string) });
      } else {
        await addFavMutation.mutateAsync({ seriesId: parseInt(id as string) });
      }
      setIsFav(!isFav);
    } catch (err) {
      Alert.alert("Error", "Failed to update favorite");
    }
  };

  if (seriesQuery.isLoading) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const series = seriesQuery.data;
  if (!series) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">Series not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View className="w-full h-64 bg-border">
          {series.coverImageUrl && (
            <Image
              source={{ uri: series.coverImageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
        </View>

        {/* Info */}
        <View className="px-6 py-4">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{series.title}</Text>
              <Text className="text-sm text-muted mt-1">{series.author}</Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className={`p-2 rounded-full ${isFav ? "bg-warning" : "bg-surface"}`}
            >
              <Text className={isFav ? "text-background" : "text-foreground"}>♥</Text>
            </TouchableOpacity>
          </View>

          {/* Status & Year */}
          <View className="flex-row gap-2 mb-4">
            <View className="bg-primary/10 rounded-full px-3 py-1">
              <Text className="text-xs font-semibold text-primary capitalize">{series.status}</Text>
            </View>
            {series.releaseYear && (
              <View className="bg-border rounded-full px-3 py-1">
                <Text className="text-xs text-muted">{series.releaseYear}</Text>
              </View>
            )}
            {series.isPremium && (
              <View className="bg-warning/10 rounded-full px-3 py-1">
                <Text className="text-xs font-semibold text-warning">Premium</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {series.description && (
            <View className="mb-4">
              <Text className="text-sm text-muted leading-relaxed">{series.description}</Text>
            </View>
          )}

          {/* Rating */}
          {series.rating && (
            <View className="flex-row items-center mb-4">
              <Text className="text-lg font-bold text-foreground">{series.rating}</Text>
              <Text className="text-xs text-muted ml-2">({series.ratingCount} ratings)</Text>
            </View>
          )}
        </View>

        {/* Chapters */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Chapters</Text>
          {chaptersQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <FlatList
              data={chaptersQuery.data || []}
              keyExtractor={(item) => `chapter-${item.id}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Link href={(`/reader/${item.id}` as any)} asChild>
                  <TouchableOpacity className="bg-surface rounded-lg p-3 mb-2 flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm font-semibold text-foreground">
                        Chapter {item.chapterNumber}
                      </Text>
                      {item.title && (
                        <Text className="text-xs text-muted mt-1">{item.title}</Text>
                      )}
                    </View>
                    <Text className="text-xs text-muted">{item.pageCount} pages</Text>
                  </TouchableOpacity>
                </Link>
              )}
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
