import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  getSelectedPhotos,
  PhotoItem,
} from "../../lib/photoStore";
import {
  getSelectedPrompts,
  PromptItem,
} from "../../lib/promptStore";
import { getSelectedLookingFor } from "../../lib/lookingForStore";
import {
  getProfileBasics,
  getSelectedInterests,
} from "../../lib/profileStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PHOTO_WIDTH = SCREEN_WIDTH - 44;
const PHOTO_HEIGHT = 500;

export default function PreviewScreen() {
  const photos = getSelectedPhotos();
  const prompts = getSelectedPrompts();
  const lookingFor = getSelectedLookingFor();
  const profileBasics = getProfileBasics();
  const selectedInterests = getSelectedInterests();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  const handleContinue = () => {
    console.log("🔥 PREVIEW → COMPLETE");
    console.log("🔥 PREVIEW PHOTOS:", photos.map((p) => p.uri));
    console.log("🔥 PREVIEW PROMPTS:", prompts);
    console.log("🔥 LOOKING FOR:", lookingFor);
    router.push("/onboarding");
  };

  const handlePhotoScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / PHOTO_WIDTH);
    if (index >= 0 && index < photos.length) {
      setCurrentIndex(index);
    }
  };

  const handleFullScreenScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const screenWidth = event.nativeEvent.layoutMeasurement.width;
    const offsetX = event.nativeEvent.contentOffset.x;
    if (!screenWidth) return;
    const index = Math.round(offsetX / screenWidth);
    if (index >= 0 && index < photos.length) {
      setFullScreenIndex(index);
      setCurrentIndex(index);
    }
  };

  const openFullScreen = (index?: number) => {
    if (photos.length === 0) return;
    setFullScreenIndex(index ?? currentIndex);
    setFullScreenVisible(true);
  };

  const handleCommentOnPrompt = (prompt: PromptItem) => {
    Alert.alert(
      "Reply to Prompt",
      `Reply on: "${prompt.question}"\n\n(Backend connect hone ke baad ye message dusre user ko jayega)`
    );
  };

  const handleCommentOnPhoto = (photoIndex: number) => {
    Alert.alert(
      "Compliment",
      `Send a compliment on Photo ${photoIndex + 1}\n\n(Backend connect hone ke baad ye message dusre user ko jayega)`
    );
  };

  // Smart interleaving - START FROM 2nd PHOTO
  const buildFeedItems = () => {
    const items: Array<{ type: "photo" | "prompt"; data: any; index?: number }> = [];
    let photoIndex = 1;
    let promptIndex = 0;

    while (photoIndex < Math.min(3, photos.length)) {
      items.push({ type: "photo", data: photos[photoIndex], index: photoIndex });
      photoIndex++;
    }

    while (promptIndex < prompts.length || photoIndex < photos.length) {
      if (promptIndex < prompts.length) {
        items.push({ type: "prompt", data: prompts[promptIndex] });
        promptIndex++;
      }
      if (photoIndex < photos.length) {
        items.push({ type: "photo", data: photos[photoIndex], index: photoIndex });
        photoIndex++;
      }
    }

    return items;
  };

  const feedItems = buildFeedItems();

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 24;
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return 24;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age > 0 && age < 100 ? age : 24;
  };

  const renderPhoto = ({ item }: { item: PhotoItem }) => {
    return (
      <Pressable style={styles.photoSlide} onPress={() => openFullScreen()}>
        <Image
          source={{ uri: item.uri }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.48)"]}
          style={styles.imageGradient}
        />
      </Pressable>
    );
  };

  const renderFullScreenPhoto = ({ item }: { item: PhotoItem }) => {
    return (
      <View style={styles.fullScreenSlide}>
        <Image source={{ uri: item.uri }} style={styles.fullScreenImage} resizeMode="contain" />
      </View>
    );
  };

  const getInterestEmoji = (name: string) => {
    const key = name.trim().toLowerCase();
    const emojiMap: Record<string, string> = {
      art: "🎨",
      books: "📚",
      cooking: "🍳",
      dancing: "💃",
      fitness: "🏋️",
      food: "🍴",
      gaming: "🎮",
      music: "🎵",
      nature: "🌿",
      photography: "📷",
      sports: "⚽",
      technology: "💻",
      travel: "✈️",
      movies: "🎬",
      fashion: "👗",
      coffee: "☕",
      pets: "🐾",
      yoga: "🧘",
    };
    return emojiMap[key] ?? "✦";
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F5EE" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* PREVIEW INTRO — kept aligned to the reference image */}
            <View style={styles.topHeader}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>

              <View style={styles.brandBlock}>
                <Text style={styles.brandName}>NEXORA</Text>
                <Text style={styles.brandTagline}>REAL PEOPLE • REAL VIBES</Text>
              </View>

              <View style={styles.progressBadge}>
                <Text style={styles.progressNumber}>05<Text style={styles.progressSlash}>/10</Text></Text>
                <Text style={styles.gearIcon}>⚙</Text>
              </View>
            </View>

            <View style={styles.introRow}>
              <View style={styles.introCopy}>
                <Text style={styles.kicker}>PREVIEW MODE</Text>
                <Text style={styles.title}>This is how{'\n'}you'll be seen.</Text>
                <Text style={styles.subtitle}>
                  A little scroll. A little vibe check. Everything here can still be edited.
                </Text>
              </View>

              <View style={styles.previewSeal}>
                <Text style={styles.sealHeart}>♡</Text>
                <Text style={styles.sealText}>YOUR{'\n'}VIBE</Text>
              </View>
            </View>

            {/* HERO PROFILE */}
            <View style={styles.heroCard}>
              {photos.length > 0 ? (
                <FlatList
                  data={photos}
                  keyExtractor={(item) => item.id}
                  renderItem={renderPhoto}
                  horizontal
                  snapToInterval={PHOTO_WIDTH}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handlePhotoScroll}
                  contentContainerStyle={styles.carouselContent}
                  getItemLayout={(_data, index) => ({
                    length: PHOTO_WIDTH,
                    offset: PHOTO_WIDTH * index,
                    index,
                  })}
                  nestedScrollEnabled
                />
              ) : (
                <View style={styles.emptyPhoto}>
                  <View style={styles.emptyIcon}>
                    <Text style={styles.emptyIconText}>+</Text>
                  </View>
                  <Text style={styles.emptyPhotoText}>Add a photo to complete your profile</Text>
                </View>
              )}

              <View style={styles.heroBottom}>
                <View style={styles.heroIdentity}>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                  <View style={styles.identityCopy}>
                    <Text style={styles.name}>{profileBasics.fullName || "Jay"}{profileBasics.dateOfBirth ? `, ${getAge(profileBasics.dateOfBirth)}` : ", 24"}</Text>
                    <Text style={styles.location}>Jabalpur · Madhya Pradesh</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => openFullScreen()}
                  style={({ pressed }) => [
                    styles.galleryButton,
                    pressed && styles.iconPressed,
                  ]}
                >
                  <Text style={styles.galleryIcon}>⛶</Text>
                </Pressable>
              </View>
            </View>

            {/* PHOTO POSITION */}
            {photos.length > 1 && (
              <View style={styles.photoMeta}>
                <View style={styles.indicators}>
                  {photos.map((photo, index) => (
                    <View
                      key={photo.id}
                      style={[
                        styles.indicator,
                        index === currentIndex && styles.activeIndicator,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.photoCounter}>
                  {currentIndex + 1} / {photos.length}
                </Text>
              </View>
            )}

            {/* SMART FEED */}
            {feedItems.length > 0 && (
              <View style={styles.feedSection}>
                {feedItems.map((item) => {
                  if (item.type === "photo") {
                    return (
                      <View key={`photo-${item.data.id}`} style={styles.verticalPhotoWrapper}>
                        <Pressable
                          onPress={() => openFullScreen(item.index)}
                          style={styles.verticalPhoto}
                        >
                          <Image
                            source={{ uri: item.data.uri }}
                            style={styles.verticalPhotoImage}
                            resizeMode="cover"
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => handleCommentOnPhoto(item.index ?? 0)}
                          style={({ pressed }) => [
                            styles.photoCommentButton,
                            pressed && styles.commentButtonPressed,
                          ]}
                        >
                          <Text style={styles.commentIcon}>✦</Text>
                        </Pressable>
                      </View>
                    );
                  }

                  return (
                    <View key={`prompt-${item.data.id}`} style={styles.promptCard}>
                      <View style={styles.promptContent}>
                        <Text style={styles.promptQuestion}>{item.data.question}</Text>
                        <Text style={styles.promptAnswer}>{item.data.answer}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleCommentOnPrompt(item.data)}
                        style={({ pressed }) => [
                          styles.commentButton,
                          pressed && styles.commentButtonPressed,
                        ]}
                      >
                        <Text style={styles.commentIcon}>✦</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ABOUT ME */}
            {Object.keys(profileBasics).some((key) => Boolean((profileBasics as any)[key])) && (
              <View style={styles.aboutMeCard}>
                <Text style={styles.profileSectionTitle}>About me</Text>

                <View style={styles.aboutMeChips}>
                  {[
                    { key: "height", label: profileBasics.height, icon: "↕" },
                    { key: "exercise", label: profileBasics.exercise, icon: "⌁" },
                    { key: "education", label: profileBasics.education, icon: "⌂" },
                    { key: "drinking", label: profileBasics.drinking, icon: "◌" },
                    { key: "smoking", label: profileBasics.smoking, icon: "◐" },
                    { key: "zodiac", label: profileBasics.zodiac, icon: "✦" },
                    { key: "religion", label: profileBasics.religion, icon: "◡" },
                    { key: "gender", label: profileBasics.gender, icon: "◉" },
                  ]
                    .filter((item) => Boolean(item.label))
                    .map((item) => (
                      <View key={item.key} style={styles.aboutMeChip}>
                        <Text style={styles.aboutMeChipIcon}>{item.icon}</Text>
                        <Text style={styles.aboutMeChipText}>{item.label}</Text>
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* LOOKING FOR */}
            {(lookingFor.length > 0 || profileBasics.lookingForGender) && (
              <View style={styles.profileInfoCard}>
                <Text style={styles.profileSectionTitle}>I’m looking for</Text>

                <View style={styles.profileChipWrap}>
                  {profileBasics.lookingForGender && (
                    <View style={styles.profileChip}>
                      <Text style={styles.profileChipText}>
                        {profileBasics.lookingForGender}
                      </Text>
                    </View>
                  )}

                  {lookingFor.map((item) => (
                    <View key={item.id} style={styles.profileChip}>
                      <Text style={styles.profileChipText}>{item.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* MY INTERESTS */}
            {selectedInterests.length > 0 && (
              <View style={styles.profileInfoCard}>
                <Text style={styles.profileSectionTitle}>My interests</Text>

                <View style={styles.profileChipWrap}>
                  {selectedInterests.map((interest) => (
                    <View key={interest.id} style={styles.interestProfileChip}>
                      <Text style={styles.interestEmoji}>
                        {getInterestEmoji(interest.name)}
                      </Text>
                      <Text style={styles.profileChipText}>{interest.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* LOCATION */}
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Text style={styles.locationEmoji}>📍</Text>
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationTitle}>Jabalpur, Madhya Pradesh</Text>
                <Text style={styles.locationSub}>You are here · Distance will show to others</Text>
              </View>
            </View>

            {/* PRIVACY */}
            <View style={styles.privacyCard}>
              <View style={styles.privacyIcon}>
                <Text style={styles.lock}>✓</Text>
              </View>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>You're in control</Text>
                <Text style={styles.privacyText}>
                  You can edit your profile, photos and preferences anytime.
                </Text>
              </View>
            </View>

            {/* CONTINUE */}
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={["#174D3A", "#0F382A"]}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>Enter Nexora</Text>
                <Text style={styles.arrow}>→</Text>
              </LinearGradient>
            </Pressable>

            <Text style={styles.footer}>
              Your journey to meaningful connections starts here.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* FULL SCREEN */}
      <Modal
        visible={fullScreenVisible}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => setFullScreenVisible(false)}
      >
        <View style={styles.fullScreenContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <Pressable onPress={() => setFullScreenVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
          {photos.length > 0 && (
            <View style={styles.fullScreenCounter}>
              <Text style={styles.fullScreenCounterText}>
                {fullScreenIndex + 1} / {photos.length}
              </Text>
            </View>
          )}
          <FlatList
            data={photos}
            keyExtractor={(item) => `fullscreen-${item.id}`}
            renderItem={renderFullScreenPhoto}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={fullScreenIndex}
            getItemLayout={(_data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={handleFullScreenScroll}
            extraData={fullScreenIndex}
            style={styles.fullScreenList}
          />
          {photos.length > 1 && (
            <View style={styles.fullScreenIndicators}>
              {photos.map((photo, index) => (
                <View
                  key={`dot-${photo.id}`}
                  style={[
                    styles.fullScreenDot,
                    index === fullScreenIndex && styles.fullScreenActiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F5EE" },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  container: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  eyebrow: { fontSize: 12, letterSpacing: 3, color: "#B88955", fontWeight: "800", marginBottom: 8 },
  title: { fontSize: 32, lineHeight: 38, color: "#173C2E", fontWeight: "800" },
  subtitle: { marginTop: 9, fontSize: 14, lineHeight: 21, color: "#77736B", maxWidth: 338 },
  stepBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8E0D0", alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 13, fontWeight: "800", color: "#174D3A" },
  carouselWrapper: { marginTop: 18, width: PHOTO_WIDTH, height: PHOTO_HEIGHT, borderRadius: 28, overflow: "hidden", backgroundColor: "#E8E3D8" },
  carouselContent: { padding: 0 },
  photoSlide: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT, position: "relative", backgroundColor: "#E8E3D8" },
  profileImage: { width: "100%", height: "100%" },
  imageGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 180 },
  profileInfo: { position: "absolute", left: 22, right: 22, bottom: 20 },
  name: { color: "#FFFFFF", fontSize: 30, fontWeight: "800" },
  location: { color: "#F4EFE6", fontSize: 14, marginTop: 5 },
  expandHint: { position: "absolute", right: 15, top: 15, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  expandIcon: { color: "#FFFFFF", fontSize: 21, fontWeight: "700" },
  emptyPhoto: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E8E3D8" },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#DCE7D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyIconText: {
    color: "#244735",
    fontSize: 28,
    fontWeight: "300",
  },
  emptyPhotoText: { color: "#77736B", fontSize: 14, fontWeight: "600" },
  indicatorSection: { marginTop: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 18 },
  indicators: { flexDirection: "row", alignItems: "center", gap: 5 },
  indicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D6CF" },
  activeIndicator: { width: 18, backgroundColor: "#174D3A" },
  photoCounter: { marginLeft: 10, fontSize: 10, color: "#77736B", fontWeight: "700" },
  swipeHint: { marginTop: 7, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  swipeArrow: { color: "#B88955", fontSize: 15, fontWeight: "700", marginHorizontal: 6 },
  swipeText: { color: "#918D84", fontSize: 10, fontWeight: "600" },

  // PREVIEW INTRO + HERO
  topHeader: {
    marginTop: 2,
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7DED1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#173C2E",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  backIcon: {
    color: "#174D3A",
    fontSize: 40,
    lineHeight: 43,
    fontWeight: "300",
    marginTop: -2,
  },
  brandBlock: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
    paddingTop: 2,
  },
  brandName: {
    color: "#173C2E",
    fontSize: 21,
    lineHeight: 23,
    letterSpacing: 4.4,
    fontWeight: "900",
    marginLeft: 4,
  },
  brandTagline: {
    marginTop: 5,
    color: "#8D857A",
    fontSize: 8.5,
    lineHeight: 11,
    letterSpacing: 2.1,
    fontWeight: "800",
  },
  progressBadge: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#E5E0D5",
    borderWidth: 1,
    borderColor: "#DAD4C8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#173C2E",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  progressNumber: {
    position: "absolute",
    top: 15,
    left: 10,
    color: "#315C4B",
    fontSize: 18,
    fontWeight: "900",
    zIndex: 2,
  },
  progressSlash: {
    color: "#7A817B",
    fontSize: 10,
    fontWeight: "800",
  },
  gearIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    marginTop: 12,
    opacity: 0.96,
  },
  introRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  introCopy: {
    flex: 1,
    paddingRight: 12,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 2.6,
    color: "#B88955",
    fontWeight: "800",
    marginBottom: 9,
  },
  previewSeal: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: "#174D3A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    transform: [{ rotate: "4deg" }],
    shadowColor: "#173C2E",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sealHeart: {
    color: "#F1C9AB",
    fontSize: 26,
    lineHeight: 27,
    marginBottom: 3,
  },
  sealText: {
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    textAlign: "center",
  },
  heroCard: {
    marginTop: 18,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E2D6",
    shadowColor: "#173C2E",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  heroBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 92,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(9, 48, 35, 0.90)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  heroIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
  verifiedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3B896",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  verifiedText: {
    color: "#174D3A",
    fontSize: 18,
    fontWeight: "900",
  },
  identityCopy: {
    flex: 1,
    paddingBottom: 1,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  galleryIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  iconPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  photoMeta: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  // FEED
  feedSection: { marginTop: 18 },
  verticalPhotoWrapper: {
    marginBottom: 18,
    position: "relative",
  },
  verticalPhoto: {
    width: "100%",
    height: 420,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#E8E3D8",
  },
  verticalPhotoImage: { width: "100%", height: "100%" },
  photoCommentButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  promptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#173C2E",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  promptContent: { flex: 1, paddingRight: 16 },
  promptQuestion: {
    color: "#B88955",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  promptAnswer: {
    color: "#20382B",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 25,
  },
  commentButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF3ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D5E4D7",
  },
  commentButtonPressed: { backgroundColor: "#DCE7D8", transform: [{ scale: 0.94 }] },
  commentIcon: { color: "#244735", fontSize: 20, fontWeight: "700" },

  // LOOKING FOR
  lookingForCard: {
    marginTop: 16,
    backgroundColor: "#FFFDF8",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEE5D6",
    shadowColor: "#173C2E",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lookingForHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  lookingForHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  lookingForHeadline: {
    marginTop: 1,
    color: "#173C2E",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
  },
  lookingForCountBadge: {
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F4E7DA",
    alignItems: "center",
    justifyContent: "center",
  },
  lookingForCountNumber: {
    color: "#A56D3E",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 17,
  },
  lookingForCountLabel: {
    marginTop: 1,
    color: "#A56D3E",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lookingForList: {
    marginTop: 14,
    gap: 9,
  },
  lookingForItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#F7F4ED",
    borderWidth: 1,
    borderColor: "#ECE5D9",
  },
  lookingForNumberCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCE7D8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lookingForNumber: {
    color: "#244735",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  lookingForTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  lookingForTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#20382B",
  },
  lookingForSub: {
    fontSize: 12,
    color: "#7A817B",
    marginTop: 3,
    lineHeight: 17,
  },
  lookingForSpark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E0D6",
  },
  lookingForSparkText: {
    color: "#B88955",
    fontSize: 13,
    fontWeight: "900",
  },
  lookingForFooter: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE8DE",
    flexDirection: "row",
    alignItems: "center",
  },
  lookingForFooterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B88955",
    marginRight: 8,
  },
  lookingForFooterText: {
    flex: 1,
    color: "#8B877E",
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.1,
  },


  // INTERESTS
  profileCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#173C2E",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  sectionLabel: { fontSize: 10, letterSpacing: 2, color: "#B88955", fontWeight: "800", marginBottom: 10 },
  tagsSection: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 16 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: "#EDF3ED" },
  tagText: { fontSize: 11, color: "#28533F", fontWeight: "600" },

  // PROFILE INFO
  aboutMeCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#173C2E",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileInfoCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#173C2E",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileSectionTitle: {
    color: "#20382B",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  aboutMeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  aboutMeChip: {
    minHeight: 40,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F2F1",
    flexDirection: "row",
    alignItems: "center",
  },
  aboutMeChipIcon: {
    color: "#315344",
    fontSize: 14,
    marginRight: 7,
    fontWeight: "700",
  },
  aboutMeChipText: {
    color: "#25382F",
    fontSize: 12.5,
    fontWeight: "600",
  },
  profileChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  profileChip: {
    minHeight: 40,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F1F2F1",
    justifyContent: "center",
  },
  interestProfileChip: {
    minHeight: 40,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F2F1",
    flexDirection: "row",
    alignItems: "center",
  },
  interestEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  profileChipText: {
    color: "#25382F",
    fontSize: 12.5,
    fontWeight: "600",
  },

  // LOCATION
  locationCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#173C2E",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#EEF3ED",
    alignItems: "center",
    justifyContent: "center",
  },
  locationEmoji: { fontSize: 18 },
  locationContent: { flex: 1, marginLeft: 12 },
  locationTitle: { fontSize: 14, fontWeight: "700", color: "#20382B" },
  locationSub: { fontSize: 11, color: "#7A817B", marginTop: 3 },

  // PRIVACY
  privacyCard: { marginTop: 12, padding: 12, borderRadius: 18, backgroundColor: "#EEF3ED", flexDirection: "row", alignItems: "center" },
  privacyIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#D5E4D7", alignItems: "center", justifyContent: "center" },
  lock: { fontSize: 16, fontWeight: "900", color: "#174D3A" },
  privacyContent: { flex: 1, marginLeft: 10 },
  privacyTitle: { fontSize: 12, fontWeight: "800", color: "#173C2E" },
  privacyText: { marginTop: 2, fontSize: 10, lineHeight: 15, color: "#687269" },

  continueButton: { marginTop: 14, borderRadius: 18, overflow: "hidden" },
  continueGradient: { height: 52, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  continueText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  arrow: { color: "#FFFFFF", fontSize: 23, fontWeight: "400" },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  footer: { textAlign: "center", marginTop: 7, fontSize: 9, color: "#9A968D" },

  // FULL SCREEN
  fullScreenContainer: { flex: 1, backgroundColor: "#000000" },
  fullScreenList: { flex: 1 },
  fullScreenSlide: { width: SCREEN_WIDTH, flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center" },
  fullScreenImage: { width: SCREEN_WIDTH, height: "100%" },
  closeButton: { position: "absolute", zIndex: 20, top: 55, left: 18, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  closeButtonText: { color: "#FFFFFF", fontSize: 32, lineHeight: 34, fontWeight: "300" },
  fullScreenCounter: { position: "absolute", zIndex: 20, top: 65, right: 20, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.16)" },
  fullScreenCounterText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  fullScreenIndicators: { position: "absolute", left: 0, right: 0, bottom: 35, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  fullScreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  fullScreenActiveDot: { width: 18, backgroundColor: "#FFFFFF" },
});

