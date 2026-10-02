import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "http://192.168.1.102:5000/api";

type Interest = {
  id: number;
  name: string;
};

const FALLBACK_INTERESTS: Interest[] = [
  { id: 1, name: "Art" },
  { id: 2, name: "Books" },
  { id: 3, name: "Cooking" },
  { id: 4, name: "Dancing" },
  { id: 5, name: "Fitness" },
  { id: 6, name: "Food" },
  { id: 7, name: "Gaming" },
  { id: 8, name: "Music" },
  { id: 9, name: "Nature" },
  { id: 10, name: "Photography" },
  { id: 11, name: "Sports" },
  { id: 12, name: "Technology" },
  { id: 13, name: "Travel" },
  { id: 14, name: "Movies" },
  { id: 15, name: "Fashion" },
  { id: 16, name: "Coffee" },
  { id: 17, name: "Pets" },
  { id: 18, name: "Yoga" },
];

export default function InterestsScreen() {
  const [interests, setInterests] = useState<Interest[]>(
    FALLBACK_INTERESTS
  );

  const [selectedInterests, setSelectedInterests] = useState<number[]>(
    []
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/interests`
      );

      if (!response.ok) {
        throw new Error("Failed to load interests");
      }

      const data = await response.json();

      const backendInterests =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.interests)
          ? data.interests
          : Array.isArray(data?.data)
          ? data.data
          : [];

      if (backendInterests.length > 0) {
        const formatted: Interest[] =
          backendInterests
            .map((item: any) => ({
              id: Number(item.id),
              name:
                item.name ??
                item.title ??
                item.interestName ??
                "",
            }))
            .filter(
              (item: Interest) =>
                Number.isFinite(item.id) &&
                item.name.length > 0
            );

        if (formatted.length > 0) {
          setInterests(formatted);
        }
      }
    } catch (err) {
      console.log(
        "⚠️ Interests API unavailable, using fallback:",
        err
      );

      setError(
        "Unable to load latest interests. Showing available interests."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestId: number) => {
    setSelectedInterests((current) => {
      if (current.includes(interestId)) {
        return current.filter(
          (id) => id !== interestId
        );
      }

      if (current.length >= 8) {
        return current;
      }

      return [...current, interestId];
    });
  };

  const filteredInterests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return interests;
    }

    return interests.filter((interest) =>
      interest.name.toLowerCase().includes(query)
    );
  }, [interests, search]);

  const selectedObjects = interests.filter((interest) =>
    selectedInterests.includes(interest.id)
  );

  const canContinue =
    selectedInterests.length >= 3;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    console.log(
      "🔥 SELECTED INTEREST IDS:",
      selectedInterests
    );

    /*
      Backend save will be connected after JWT/auth
      storage is completed.

      Expected backend payload:

      {
        interestIds: selectedInterests
      }
    */

    router.push("/onboarding/profile");
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom"]}
    >
      <LinearGradient
        colors={[
          "#F8F3E9",
          "#F4EBDD",
          "#E8EFE6",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />

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

          <View style={styles.progressContainer}>
            <View style={styles.progressActive} />
            <View style={styles.progressActive} />
            <View style={styles.progressActive} />
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
              SHOW YOUR PERSONALITY
            </Text>

            <Text style={styles.title}>
              What are{"\n"}
              <Text style={styles.titleAccent}>
                into?
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Pick at least 3 interests that describe
              you.
              {"\n"}
              You can choose up to 8.
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>
              ⌕
            </Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search interests"
              placeholderTextColor="#929A93"
              style={styles.searchInput}
            />
          </View>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color="#244735"
              />

              <Text style={styles.loadingText}>
                Loading interests...
              </Text>
            </View>
          )}

          {/* Error / fallback message */}
          {!!error && !loading && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* Selected */}
          {selectedObjects.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.selectedLabel}>
                SELECTED
              </Text>

              <View style={styles.selectedRow}>
                {selectedObjects.map((interest) => (
                  <Pressable
                    key={interest.id}
                    onPress={() =>
                      toggleInterest(interest.id)
                    }
                    style={styles.selectedChip}
                  >
                    <Text
                      style={styles.selectedChipText}
                    >
                      {interest.name}
                    </Text>

                    <Text style={styles.removeText}>
                      ×
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Interests */}
          <View style={styles.interestsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                INTERESTS
              </Text>

              <Text style={styles.counter}>
                {selectedInterests.length}/8
              </Text>
            </View>

            {filteredInterests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  No interests found
                </Text>

                <Text style={styles.emptyText}>
                  Try another search.
                </Text>
              </View>
            ) : (
              <View style={styles.chipsContainer}>
                {filteredInterests.map(
                  (interest) => {
                    const selected =
                      selectedInterests.includes(
                        interest.id
                      );

                    return (
                      <Pressable
                        key={interest.id}
                        onPress={() =>
                          toggleInterest(
                            interest.id
                          )
                        }
                        style={({ pressed }) => [
                          styles.chip,
                          selected &&
                            styles.chipSelected,
                          pressed &&
                            styles.chipPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected &&
                              styles.chipTextSelected,
                          ]}
                        >
                          {selected ? "✓ " : ""}
                          {interest.name}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <Pressable
            disabled={!canContinue}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              !canContinue &&
                styles.continueButtonDisabled,
              pressed &&
                canContinue &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.continueText,
                !canContinue &&
                  styles.continueTextDisabled,
              ]}
            >
              Continue
            </Text>

            <View
              style={[
                styles.arrowCircle,
                !canContinue &&
                  styles.arrowCircleDisabled,
              ]}
            >
              <Text style={styles.arrow}>
                →
              </Text>
            </View>
          </Pressable>

          <Text style={styles.stepText}>
            3 of 3
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F3E9",
  },

  background: {
    flex: 1,
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  topCircle: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor:
      "rgba(190, 211, 190, 0.22)",
    top: -120,
    right: -100,
  },

  bottomCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor:
      "rgba(226, 177, 138, 0.13)",
    bottom: -90,
    left: -100,
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(255,255,255,0.58)",
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    color: "#244735",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "300",
    marginTop: -4,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  progressActive: {
    width: 28,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#244735",
  },

  headerSpacer: {
    width: 42,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  heading: {
    paddingTop: 36,
  },

  eyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },

  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "600",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  subtitle: {
    marginTop: 13,
    color: "#6E786F",
    fontSize: 13,
    lineHeight: 20,
  },

  searchContainer: {
    height: 52,
    marginTop: 26,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.72)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  searchIcon: {
    color: "#718172",
    fontSize: 24,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: "#244735",
    fontSize: 14,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },

  loadingText: {
    marginLeft: 8,
    color: "#718172",
    fontSize: 11,
  },

  errorBox: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor:
      "rgba(226,177,138,0.18)",
  },

  errorText: {
    color: "#8A6A54",
    fontSize: 10,
    lineHeight: 15,
  },

  selectedSection: {
    marginTop: 22,
  },

  selectedLabel: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 9,
  },

  selectedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  selectedChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: "#244735",
    flexDirection: "row",
    alignItems: "center",
  },

  selectedChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  removeText: {
    color: "#DCE6D8",
    fontSize: 17,
    marginLeft: 6,
    marginTop: -2,
  },

  interestsSection: {
    marginTop: 25,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  counter: {
    color: "#718172",
    fontSize: 11,
    fontWeight: "600",
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  chip: {
    paddingHorizontal: 15,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },

  chipSelected: {
    backgroundColor: "#DCE6D8",
    borderColor: "#244735",
  },

  chipPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  chipText: {
    color: "#5F6961",
    fontSize: 12,
    fontWeight: "600",
  },

  chipTextSelected: {
    color: "#244735",
    fontWeight: "700",
  },

  emptyState: {
    paddingVertical: 35,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#244735",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyText: {
    color: "#8A928B",
    fontSize: 11,
    marginTop: 5,
  },

  bottomSection: {
    paddingTop: 12,
    paddingBottom: 10,
  },

  continueButton: {
    height: 58,
    borderRadius: 29,
    backgroundColor: "#244735",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  continueButtonDisabled: {
    backgroundColor: "#C8D0C8",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  continueTextDisabled: {
    color: "#7C857D",
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

  arrowCircleDisabled: {
    backgroundColor: "#DDE2DD",
  },

  arrow: {
    color: "#244735",
    fontSize: 23,
    fontWeight: "600",
  },

  stepText: {
    textAlign: "center",
    marginTop: 9,
    color: "#9A9F9B",
    fontSize: 10,
  },

  pressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});