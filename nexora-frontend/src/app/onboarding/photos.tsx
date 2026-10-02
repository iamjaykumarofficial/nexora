import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type PhotoItem = {
  id: string;
  uri: string;
};

const MAX_PHOTOS = 6;

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const pickPhotos = async () => {
    try {
      if (photos.length >= MAX_PHOTOS) {
        Alert.alert(
          "Maximum photos reached",
          "You can add up to 6 photos."
        );
        return;
      }

      setLoading(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo access needed",
          "Please allow photo access to add pictures to your profile."
        );
        return;
      }

      const remaining =
        MAX_PHOTOS - photos.length;

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: remaining > 1,
          selectionLimit: remaining,
          quality: 0.9,
          allowsEditing: false,
        });

      if (result.canceled) {
        return;
      }

      const newPhotos: PhotoItem[] =
        result.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}-${Math.random()}`,
          uri: asset.uri,
        }));

      setPhotos((current) => {
        const combined = [
          ...current,
          ...newPhotos,
        ];

        return combined.slice(0, MAX_PHOTOS);
      });
    } catch (error) {
      console.log(
        "❌ PHOTO PICKER ERROR:",
        error
      );

      Alert.alert(
        "Something went wrong",
        "We couldn't open your photo library. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((current) =>
      current.filter(
        (photo) => photo.id !== id
      )
    );
  };

  const makePrimary = (id: string) => {
    setPhotos((current) => {
      const selected = current.find(
        (photo) => photo.id === id
      );

      if (!selected) {
        return current;
      }

      return [
        selected,
        ...current.filter(
          (photo) => photo.id !== id
        ),
      ];
    });
  };

  const handleContinue = () => {
    if (photos.length === 0) {
      Alert.alert(
        "Add a photo",
        "Please add at least one photo to continue."
      );
      return;
    }

    console.log(
      "🔥 PHOTOS SELECTED:",
      photos.map((photo) => photo.uri)
    );

    /*
      Photo upload API will be connected here
      after JWT/auth storage is connected.

      The first photo in `photos` is always
      considered the primary profile photo.
    */

    router.push("/onboarding/preview");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[
          "#F8F3E9",
          "#F5EEE2",
          "#E9F0E7",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.progressWrapper}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.progressText}>
              4 of 4
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* Heading */}
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>
              SHOW YOURSELF
            </Text>

            <Text style={styles.title}>
              Your photos,{"\n"}
              <Text style={styles.titleAccent}>
                your story.
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Add photos that feel like you.
              Your first photo will be your
              main profile picture.
            </Text>
          </View>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            {/* Main photo */}
            <Pressable
              onPress={pickPhotos}
              style={({ pressed }) => [
                styles.mainPhoto,
                pressed && styles.photoPressed,
              ]}
            >
              {photos[0] ? (
                <>
                  <Image
                    source={{
                      uri: photos[0].uri,
                    }}
                    style={styles.photoImage}
                  />

                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>
                      MAIN PHOTO
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      removePhoto(
                        photos[0].id
                      )
                    }
                    style={styles.removeButton}
                  >
                    <Text
                      style={styles.removeText}
                    >
                      ×
                    </Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.emptyMain}>
                  <View style={styles.addCircle}>
                    <Text style={styles.plus}>
                      +
                    </Text>
                  </View>

                  <Text style={styles.addTitle}>
                    Add your main photo
                  </Text>

                  <Text style={styles.addHint}>
                    A clear photo works best
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Secondary photos */}
            {Array.from({
              length: MAX_PHOTOS - 1,
            }).map((_, index) => {
              const photo =
                photos[index + 1];

              return (
                <Pressable
                  key={`slot-${index}`}
                  onPress={pickPhotos}
                  style={({ pressed }) => [
                    styles.smallPhoto,
                    pressed &&
                      styles.photoPressed,
                  ]}
                >
                  {photo ? (
                    <>
                      <Image
                        source={{
                          uri: photo.uri,
                        }}
                        style={styles.photoImage}
                      />

                      <Pressable
                        onPress={() =>
                          removePhoto(
                            photo.id
                          )
                        }
                        style={
                          styles.smallRemoveButton
                        }
                      >
                        <Text
                          style={
                            styles.smallRemoveText
                          }
                        >
                          ×
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <View style={styles.emptySmall}>
                      <Text style={styles.smallPlus}>
                        +
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Counter */}
          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>
              YOUR PHOTOS
            </Text>

            <Text style={styles.counterValue}>
              {photos.length}/{MAX_PHOTOS}
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipIcon}>
              <Text style={styles.tipIconText}>
                ✦
              </Text>
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>
                Make a good first impression
              </Text>

              <Text style={styles.tipText}>
                Use recent photos where your face
                is clearly visible. Add a mix of
                portraits, hobbies and moments
                that show your personality.
              </Text>
            </View>
          </View>

          {/* Add more */}
          {photos.length > 0 &&
            photos.length < MAX_PHOTOS && (
              <Pressable
                onPress={pickPhotos}
                style={({ pressed }) => [
                  styles.addMoreButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text style={styles.addMorePlus}>
                  +
                </Text>

                <Text style={styles.addMoreText}>
                  Add more photos
                </Text>
              </Pressable>
            )}
        </ScrollView>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={({ pressed }) => [
              styles.continueButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={[
                "#244735",
                "#315C43",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />
              ) : (
                <>
                  <Text
                    style={styles.continueText}
                  >
                    Continue
                  </Text>

                  <View
                    style={styles.arrowCircle}
                  >
                    <Text
                      style={styles.arrow}
                    >
                      →
                    </Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.bottomText}>
            You can change your photos anytime.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F3E9",
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    overflow: "hidden",
  },

  backgroundCircleTop: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor:
      "rgba(190,211,190,0.22)",
    top: -130,
    right: -90,
  },

  backgroundCircleBottom: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor:
      "rgba(226,177,138,0.13)",
    bottom: -100,
    left: -100,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    color: "#244735",
    fontSize: 34,
    lineHeight: 36,
    marginTop: -4,
  },

  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  progressTrack: {
    width: 90,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#DDE3DA",
    overflow: "hidden",
  },

  progressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#244735",
    borderRadius: 5,
  },

  progressText: {
    color: "#7D867E",
    fontSize: 11,
    fontWeight: "600",
  },

  headerSpacer: {
    width: 42,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  heading: {
    paddingTop: 26,
    marginBottom: 25,
  },

  eyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 9,
  },

  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 39,
    lineHeight: 43,
    fontWeight: "600",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  subtitle: {
    color: "#737C75",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 350,
  },

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  mainPhoto: {
    width: "100%",
    height: 255,
    borderRadius: 24,
    backgroundColor:
      "rgba(255,255,255,0.72)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E4E8E1",
  },

  smallPhoto: {
    width: "31.8%",
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.72)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E4E8E1",
  },

  photoImage: {
    width: "100%",
    height: "100%",
  },

  emptyMain: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  addCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#DCE7D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  plus: {
    color: "#244735",
    fontSize: 32,
    fontWeight: "300",
    marginTop: -2,
  },

  addTitle: {
    color: "#31503C",
    fontSize: 14,
    fontWeight: "800",
  },

  addHint: {
    color: "#8B958C",
    fontSize: 10,
    marginTop: 5,
  },

  emptySmall: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  smallPlus: {
    color: "#7C8A7E",
    fontSize: 28,
    fontWeight: "300",
  },

  mainBadge: {
    position: "absolute",
    left: 13,
    bottom: 13,
    paddingHorizontal: 10,
    height: 27,
    borderRadius: 14,
    backgroundColor:
      "rgba(36,71,53,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  mainBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  removeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor:
      "rgba(20,30,24,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
  },

  smallRemoveButton: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor:
      "rgba(20,30,24,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  smallRemoveText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 20,
    marginTop: -1,
  },

  photoPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  counterRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  counterLabel: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
  },

  counterValue: {
    color: "#244735",
    fontSize: 11,
    fontWeight: "800",
  },

  tipsCard: {
    marginTop: 13,
    borderRadius: 19,
    backgroundColor:
      "rgba(255,255,255,0.68)",
    padding: 14,
    flexDirection: "row",
  },

  tipIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#DCE7D8",
    alignItems: "center",
    justifyContent: "center",
  },

  tipIconText: {
    color: "#244735",
    fontSize: 18,
  },

  tipContent: {
    flex: 1,
    marginLeft: 11,
  },

  tipTitle: {
    color: "#31503C",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },

  tipText: {
    color: "#7A857C",
    fontSize: 9.5,
    lineHeight: 14,
  },

  addMoreButton: {
    marginTop: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#C9D5C7",
    backgroundColor:
      "rgba(255,255,255,0.45)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addMorePlus: {
    color: "#244735",
    fontSize: 20,
    marginRight: 7,
    marginTop: -2,
  },

  addMoreText: {
    color: "#31503C",
    fontSize: 12,
    fontWeight: "700",
  },

  bottomSection: {
    paddingTop: 10,
    paddingBottom: 9,
  },

  continueButton: {
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
  },

  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  arrowCircle: {
    position: "absolute",
    right: 7,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D7E2D3",
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: "#244735",
    fontSize: 22,
    fontWeight: "700",
  },

  bottomText: {
    color: "#9AA19B",
    fontSize: 9.5,
    textAlign: "center",
    marginTop: 9,
  },

  pressed: {
    opacity: 0.72,
  },

  buttonPressed: {
    opacity: 0.84,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});