import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

const { width } = Dimensions.get("window");

export default function ReaderScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { isSignedIn } = useAuth();
  const [brightness, setBrightness] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const chapterQuery = trpc.chapters.getById.useQuery({ id: parseInt(id as string) });
  const updateProgressMutation = trpc.library.updateProgress.useMutation();

  const pages = chapterQuery.data?.pages || [];

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pages.length) {
      setCurrentPage(newPage);
      if (isSignedIn) {
        updateProgressMutation.mutate({
          chapterId: parseInt(id as string),
          currentPage: newPage,
          totalPages: pages.length,
          seriesId: 0,
        });
      }
    }
  };

  if (chapterQuery.isLoading) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const chapter = chapterQuery.data;
  if (!chapter || !pages.length) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">Chapter not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const currentPageUrl = pages[currentPage];

  return (
    <ScreenContainer
      className="bg-black"
      edges={["top", "left", "right", "bottom"]}
      containerClassName="bg-black"
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
        className="flex-1"
      >
        <ScrollView
          scrollEnabled={false}
          contentContainerStyle={{ flex: 1, justifyContent: "center" }}
        >
          {/* Page Image */}
          <View className="w-full flex-1 bg-black items-center justify-center">
            {currentPageUrl ? (
              <Image
                source={{ uri: currentPageUrl }}
                className="w-full h-full"
                resizeMode="contain"
                style={{ opacity: brightness / 100 }}
              />
            ) : (
              <ActivityIndicator color={colors.primary} size="large" />
            )}
          </View>
        </ScrollView>

        {/* Controls */}
        {showControls && (
          <View className="absolute inset-0 bg-black/30 flex-row items-center justify-between px-4">
            {/* Previous Button */}
            <TouchableOpacity
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-4"
            >
              <Text className="text-white text-2xl font-bold">‹</Text>
            </TouchableOpacity>

            {/* Center Info */}
            <View className="items-center">
              <Text className="text-white text-sm">
                {currentPage + 1} / {pages.length}
              </Text>
            </View>

            {/* Next Button */}
            <TouchableOpacity
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pages.length - 1}
              className="p-4"
            >
              <Text className="text-white text-2xl font-bold">›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Controls Bar */}
        {showControls && (
          <View className="bg-black/80 px-4 py-3 border-t border-white/10">
            {/* Brightness Control */}
            <View className="mb-3">
              <Text className="text-white text-xs mb-2">Brightness</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-white text-xs">☀</Text>
                <View className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary"
                    style={{ width: `${brightness}%` }}
                  />
                </View>
                <Text className="text-white text-xs">{brightness}%</Text>
              </View>
            </View>

            {/* Page Slider */}
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-xs">{currentPage + 1}</Text>
              <View className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                />
              </View>
              <Text className="text-white text-xs">{pages.length}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </ScreenContainer>
  );
}
