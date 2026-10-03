import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH - 36;
const CARD_HEIGHT = 570;

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DISTANCE = SCREEN_WIDTH * 1.35;

type ConnectionProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  distance: string;
  bio: string;
  online: boolean;
  image: string;
  interests: string[];
};

const CONNECTIONS: ConnectionProfile[] = [
  {
    id: "connection-1",
    name: "Priya",
    age: 24,
    city: "Bengaluru",
    distance: "4 km away",
    bio: "Travel enthusiast who loves good food, music and meaningful conversations.",
    online: true,
    image: "https://i.pravatar.cc/900?img=47",
    interests: ["Travel", "Fitness", "Food"],
  },
  {
    id: "connection-2",
    name: "Ananya",
    age: 25,
    city: "Mumbai",
    distance: "7 km away",
    bio: "Coffee, books and spontaneous weekend plans. Looking for something genuine.",
    online: true,
    image: "https://i.pravatar.cc/900?img=44",
    interests: ["Books", "Coffee", "Music"],
  },
  {
    id: "connection-3",
    name: "Riya",
    age: 23,
    city: "Pune",
    distance: "11 km away",
    bio: "Creative soul, foodie and always up for discovering a new place.",
    online: false,
    image: "https://i.pravatar.cc/900?img=49",
    interests: ["Art", "Food", "Travel"],
  },
  {
    id: "connection-4",
    name: "Maya",
    age: 26,
    city: "Delhi",
    distance: "14 km away",
    bio: "Fitness lover with a soft spot for dogs, sunsets and deep conversations.",
    online: true,
    image: "https://i.pravatar.cc/900?img=32",
    interests: ["Fitness", "Dogs", "Nature"],
  },
  {
    id: "connection-5",
    name: "Sophie",
    age: 24,
    city: "Hyderabad",
    distance: "18 km away",
    bio: "Music, photography and finding the little joys in everyday life.",
    online: true,
    image: "https://i.pravatar.cc/900?img=45",
    interests: ["Music", "Photography", "Travel"],
  },
  {
    id: "connection-6",
    name: "Neha",
    age: 27,
    city: "Indore",
    distance: "21 km away",
    bio: "Love exploring new restaurants and having conversations that actually matter.",
    online: false,
    image: "https://i.pravatar.cc/900?img=48",
    interests: ["Cooking", "Food", "Movies"],
  },
];

function shuffleProfiles(
  profiles: ConnectionProfile[]
): ConnectionProfile[] {
  const shuffled = [...profiles];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}

export default function ConnectionsScreen() {
  const [profiles, setProfiles] = useState<
    ConnectionProfile[]
  >(() => shuffleProfiles(CONNECTIONS));

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isSwiping, setIsSwiping] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;

  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, 100, 180],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-180, -100, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const resetCard = () => {
    position.setValue({
      x: 0,
      y: 0,
    });

    setIsSwiping(false);
  };

  const moveToNextProfile = () => {
    setCurrentIndex((current) => {
      const next = current + 1;

      if (next >= profiles.length) {
        setProfiles(shuffleProfiles(CONNECTIONS));
        return 0;
      }

      return next;
    });

    resetCard();
  };

  const swipeCard = (
    direction: "left" | "right"
  ) => {
    if (isSwiping) {
      return;
    }

    const currentProfile = profiles[currentIndex];

    if (!currentProfile) {
      return;
    }

    setIsSwiping(true);

    const toValue =
      direction === "right"
        ? SWIPE_OUT_DISTANCE
        : -SWIPE_OUT_DISTANCE;

    Animated.timing(position, {
      toValue: {
        x: toValue,
        y: 40,
      },
      duration: 280,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        setIsSwiping(false);
        return;
      }

      if (direction === "right") {
        console.log(
          "❤️ CONNECTION LIKED:",
          currentProfile.name
        );
      } else {
        console.log(
          "✕ CONNECTION PASSED:",
          currentProfile.name
        );
      }

      moveToNextProfile();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSwiping,

      onMoveShouldSetPanResponder: (
        _event,
        gesture
      ) => {
        if (isSwiping) {
          return false;
        }

        return (
          Math.abs(gesture.dx) >
            Math.abs(gesture.dy) &&
          Math.abs(gesture.dx) > 5
        );
      },

      onPanResponderMove: (
        _event,
        gesture
      ) => {
        if (isSwiping) {
          return;
        }

        position.setValue({
          x: gesture.dx,
          y: gesture.dy * 0.12,
        });
      },

      onPanResponderRelease: (
        _event,
        gesture
      ) => {
        if (isSwiping) {
          return;
        }

        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard("right");
          return;
        }

        if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard("left");
          return;
        }

        Animated.spring(position, {
          toValue: {
            x: 0,
            y: 0,
          },
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderTerminate: () => {
        if (isSwiping) {
          return;
        }

        Animated.spring(position, {
          toValue: {
            x: 0,
            y: 0,
          },
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const currentProfile = profiles[currentIndex];

  const nextProfile =
    profiles[
      (currentIndex + 1) % profiles.length
    ];

  if (!currentProfile || !nextProfile) {
    return null;
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              NEXORA
            </Text>

            <Text style={styles.heading}>
              Connections
            </Text>

            <Text style={styles.subheading}>
              People who may connect with you.
            </Text>
          </View>

          <Pressable
            style={styles.filterButton}
            onPress={() => {
              console.log(
                "FILTERS COMING NEXT"
              );
            }}
          >
            <Text style={styles.filterIcon}>
              ☷
            </Text>
          </Pressable>
        </View>

        {/* CARD AREA */}
        <View style={styles.cardArea}>
          {/* NEXT CARD */}
          <View
            pointerEvents="none"
            style={[
              styles.card,
              styles.nextCard,
            ]}
          >
            <Image
              source={{
                uri: nextProfile.image,
              }}
              style={styles.cardImage}
              contentFit="cover"
            />

            <View
              style={styles.nextCardOverlay}
            />
          </View>

          {/* CURRENT CARD */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  {
                    translateX: position.x,
                  },
                  {
                    translateY: position.y,
                  },
                  {
                    rotate: rotation,
                  },
                ],
              },
            ]}
          >
            <Image
              source={{
                uri: currentProfile.image,
              }}
              style={styles.cardImage}
              contentFit="cover"
            />

            <LinearGradient
              colors={[
                "transparent",
                "rgba(0,0,0,0.15)",
                "rgba(0,0,0,0.92)",
              ]}
              locations={[0, 0.5, 1]}
              style={styles.cardGradient}
            />

            {/* PASS LABEL */}
            <Animated.View
              style={[
                styles.swipeLabel,
                styles.passLabel,
                {
                  opacity: passOpacity,
                },
              ]}
            >
              <Text
                style={styles.passLabelText}
              >
                PASS
              </Text>
            </Animated.View>

            {/* LIKE LABEL */}
            <Animated.View
              style={[
                styles.swipeLabel,
                styles.likeLabel,
                {
                  opacity: likeOpacity,
                },
              ]}
            >
              <Text
                style={styles.likeLabelText}
              >
                LIKE
              </Text>
            </Animated.View>

            {/* ONLINE */}
            {currentProfile.online && (
              <View style={styles.onlineBadge}>
                <View
                  style={styles.onlineDot}
                />

                <Text
                  style={styles.onlineText}
                >
                  Online
                </Text>
              </View>
            )}

            {/* PROFILE INFO */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {currentProfile.name},{" "}
                  {currentProfile.age}
                </Text>

                <View
                  style={styles.verifiedBadge}
                >
                  <Text
                    style={styles.verifiedText}
                  >
                    ✓
                  </Text>
                </View>
              </View>

              <Text style={styles.location}>
                📍 {currentProfile.city} ·{" "}
                {currentProfile.distance}
              </Text>

              <Text
                style={styles.bio}
                numberOfLines={2}
              >
                {currentProfile.bio}
              </Text>

              <View style={styles.interests}>
                {currentProfile.interests.map(
                  (interest) => (
                    <View
                      key={interest}
                      style={
                        styles.interestChip
                      }
                    >
                      <Text
                        style={
                          styles.interestText
                        }
                      >
                        {interest}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <Pressable
            disabled={isSwiping}
            onPress={() => swipeCard("left")}
            style={({ pressed }) => [
              styles.actionButton,
              styles.passButton,
              pressed &&
                styles.actionPressed,
              isSwiping &&
                styles.actionDisabled,
            ]}
          >
            <Text
              style={
                styles.passButtonIcon
              }
            >
              ×
            </Text>
          </Pressable>

          <Pressable
            disabled={isSwiping}
            onPress={() => {
              console.log(
                "⭐ SUPER LIKE:",
                currentProfile.name
              );
            }}
            style={({ pressed }) => [
              styles.smallActionButton,
              pressed &&
                styles.actionPressed,
              isSwiping &&
                styles.actionDisabled,
            ]}
          >
            <Text
              style={
                styles.smallActionIcon
              }
            >
              ★
            </Text>
          </Pressable>

          <Pressable
            disabled={isSwiping}
            onPress={() => swipeCard("right")}
            style={({ pressed }) => [
              styles.actionButton,
              styles.likeButton,
              pressed &&
                styles.actionPressed,
              isSwiping &&
                styles.actionDisabled,
            ]}
          >
            <Text
              style={
                styles.likeButtonIcon
              }
            >
              ♥
            </Text>
          </Pressable>
        </View>

        <Text style={styles.swipeHint}>
          Swipe left to pass · swipe right to
          like
        </Text>
      </View>
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
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  logo: {
    color: "#244735",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 4,
  },

  heading: {
    color: "#20382B",
    fontSize: 28,
    fontWeight: "800",
  },

  subheading: {
    color: "#7A817B",
    fontSize: 11,
    marginTop: 3,
  },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DDE4D9",
  },

  filterIcon: {
    color: "#244735",
    fontSize: 24,
    fontWeight: "600",
  },

  cardArea: {
    flex: 1,
    marginTop: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#DCE4DA",
    shadowColor: "#173C2E",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  nextCard: {
    transform: [
      {
        scale: 0.96,
      },
      {
        translateY: 8,
      },
    ],
    opacity: 0.8,
  },

  nextCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor:
      "rgba(36,71,53,0.10)",
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },

  swipeLabel: {
    position: "absolute",
    top: 48,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 3,
  },

  passLabel: {
    left: 24,
    borderColor: "#FFFFFF",
    transform: [
      {
        rotate: "-12deg",
      },
    ],
  },

  likeLabel: {
    right: 24,
    borderColor: "#D9F0DD",
    transform: [
      {
        rotate: "12deg",
      },
    ],
  },

  passLabelText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },

  likeLabelText: {
    color: "#D9F0DD",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },

  onlineBadge: {
    position: "absolute",
    top: 18,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor:
      "rgba(0,0,0,0.38)",
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#63D47A",
    marginRight: 5,
  },

  onlineText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  profileInfo: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  verifiedBadge: {
    marginLeft: 8,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#DCEBDD",
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedText: {
    color: "#244735",
    fontSize: 12,
    fontWeight: "900",
  },

  location: {
    color: "#F3F1E9",
    fontSize: 11,
    marginTop: 5,
  },

  bio: {
    color: "#F5F2E9",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },

  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },

  interestChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.35)",
  },

  interestText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  actions: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },

  actionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#173C2E",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  passButton: {
    borderWidth: 2,
    borderColor: "#E1C6B9",
  },

  likeButton: {
    borderWidth: 2,
    borderColor: "#B8D7BD",
  },

  passButtonIcon: {
    color: "#B96D54",
    fontSize: 35,
    lineHeight: 37,
    fontWeight: "300",
  },

  likeButtonIcon: {
    color: "#244735",
    fontSize: 29,
  },

  smallActionButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEF3E9",
    alignItems: "center",
    justifyContent: "center",
  },

  smallActionIcon: {
    color: "#B88955",
    fontSize: 20,
  },

  actionPressed: {
    transform: [
      {
        scale: 0.92,
      },
    ],
  },

  actionDisabled: {
    opacity: 0.5,
  },

  swipeHint: {
    textAlign: "center",
    color: "#999F98",
    fontSize: 9,
    marginBottom: 2,
  },
});