import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type GenderOption =
  | "man"
  | "woman"
  | "non_binary"
  | "prefer_not_to_say";

type LookingForOption =
  | "men"
  | "women"
  | "everyone";

const GENDER_OPTIONS: {
  value: GenderOption;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "man",
    label: "Man",
    description: "I identify as a man",
    icon: "♂",
  },
  {
    value: "woman",
    label: "Woman",
    description: "I identify as a woman",
    icon: "♀",
  },
  {
    value: "non_binary",
    label: "Non-binary",
    description: "I identify outside the binary",
    icon: "✦",
  },
  {
    value: "prefer_not_to_say",
    label: "Prefer not to say",
    description: "I'd rather keep this private",
    icon: "♡",
  },
];

const LOOKING_FOR_OPTIONS: {
  value: LookingForOption;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "men",
    label: "Men",
    description: "I'd like to meet men",
    icon: "♂",
  },
  {
    value: "women",
    label: "Women",
    description: "I'd like to meet women",
    icon: "♀",
  },
  {
    value: "everyone",
    label: "Everyone",
    description: "I'm open to meeting everyone",
    icon: "♡",
  },
];

export default function PreferencesScreen() {
  const [gender, setGender] = useState<GenderOption | null>(null);
  const [lookingFor, setLookingFor] =
    useState<LookingForOption | null>(null);

  const [genderModalVisible, setGenderModalVisible] =
    useState(false);

  const [lookingForModalVisible, setLookingForModalVisible] =
    useState(false);

  const canContinue = Boolean(gender && lookingFor);

  const selectedGender = GENDER_OPTIONS.find(
    (option) => option.value === gender
  );

  const selectedLookingFor = LOOKING_FOR_OPTIONS.find(
    (option) => option.value === lookingFor
  );

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    router.push("/onboarding/interests");
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom"]}
    >
      <LinearGradient
        colors={["#F8F3E9", "#F4EBDD", "#E8EFE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Decorative Background */}
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
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.progressContainer}>
            <View style={styles.progressActive} />
            <View style={styles.progressActive} />
            <View style={styles.progressInactive} />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Text style={styles.eyebrow}>
              LET'S GET TO KNOW YOU
            </Text>

            <Text style={styles.title}>
              Your{" "}
              <Text style={styles.titleAccent}>
                preferences.
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Tell us a little about who you are and
              {"\n"}
              who you'd like to meet.
            </Text>

            {/* Gender */}
            <Pressable
              onPress={() => setGenderModalVisible(true)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>
                  {selectedGender?.icon ?? "✦"}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>
                  Gender
                </Text>

                <Text
                  style={[
                    styles.cardTitle,
                    !selectedGender && styles.placeholderText,
                  ]}
                >
                  {selectedGender?.label ??
                    "Choose how you'd like to identify"}
                </Text>

                {selectedGender && (
                  <Text style={styles.cardSubtitle}>
                    {selectedGender.description}
                  </Text>
                )}
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {/* Looking For */}
            <Pressable
              onPress={() => setLookingForModalVisible(true)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>
                  {selectedLookingFor?.icon ?? "♡"}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>
                  Looking for
                </Text>

                <Text
                  style={[
                    styles.cardTitle,
                    !selectedLookingFor &&
                      styles.placeholderText,
                  ]}
                >
                  {selectedLookingFor?.label ??
                    "Who would you like to connect with?"}
                </Text>

                {selectedLookingFor && (
                  <Text style={styles.cardSubtitle}>
                    {selectedLookingFor.description}
                  </Text>
                )}
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>i</Text>

              <Text style={styles.infoText}>
                Your preferences help us create a more
                meaningful discovery experience.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={({ pressed }) => [
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
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
              <Text style={styles.arrow}>→</Text>
            </View>
          </Pressable>

          <Text style={styles.stepText}>2 of 3</Text>
        </View>

        {/* Gender Modal */}
        <Modal
          visible={genderModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setGenderModalVisible(false)
          }
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setGenderModalVisible(false)}
            />

            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />

              <Text style={styles.modalEyebrow}>
                ABOUT YOU
              </Text>

              <Text style={styles.modalTitle}>
                How do you identify?
              </Text>

              <Text style={styles.modalSubtitle}>
                Choose the option that feels right for you.
              </Text>

              <View style={styles.optionsContainer}>
                {GENDER_OPTIONS.map((option) => {
                  const selected =
                    gender === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setGender(option.value);
                        setGenderModalVisible(false);
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        selected &&
                          styles.optionSelected,
                        pressed &&
                          styles.optionPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionIconText,
                            selected &&
                              styles.optionIconTextSelected,
                          ]}
                        >
                          {option.icon}
                        </Text>
                      </View>

                      <View
                        style={styles.optionContent}
                      >
                        <Text
                          style={[
                            styles.optionTitle,
                            selected &&
                              styles.optionTitleSelected,
                          ]}
                        >
                          {option.label}
                        </Text>

                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radio,
                          selected && styles.radioSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={styles.radioDot}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>

        {/* Looking For Modal */}
        <Modal
          visible={lookingForModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setLookingForModalVisible(false)
          }
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() =>
                setLookingForModalVisible(false)
              }
            />

            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />

              <Text style={styles.modalEyebrow}>
                YOUR CONNECTIONS
              </Text>

              <Text style={styles.modalTitle}>
                Who would you like to meet?
              </Text>

              <Text style={styles.modalSubtitle}>
                You can always change this later.
              </Text>

              <View style={styles.optionsContainer}>
                {LOOKING_FOR_OPTIONS.map((option) => {
                  const selected =
                    lookingFor === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setLookingFor(option.value);
                        setLookingForModalVisible(false);
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        selected &&
                          styles.optionSelected,
                        pressed &&
                          styles.optionPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionIconText,
                            selected &&
                              styles.optionIconTextSelected,
                          ]}
                        >
                          {option.icon}
                        </Text>
                      </View>

                      <View
                        style={styles.optionContent}
                      >
                        <Text
                          style={[
                            styles.optionTitle,
                            selected &&
                              styles.optionTitleSelected,
                          ]}
                        >
                          {option.label}
                        </Text>

                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radio,
                          selected && styles.radioSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={styles.radioDot}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: "rgba(190, 211, 190, 0.22)",
    top: -120,
    right: -100,
  },

  bottomCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(226, 177, 138, 0.13)",
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
    backgroundColor: "rgba(255,255,255,0.58)",
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

  progressInactive: {
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5CB",
  },

  headerSpacer: {
    width: 42,
  },

  scrollContent: {
    paddingBottom: 18,
  },

  content: {
    paddingTop: 45,
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

  card: {
    marginTop: 24,
    minHeight: 82,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.68)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  cardContent: {
    flex: 1,
    marginLeft: 13,
  },

  cardLabel: {
    color: "#8A928B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 3,
  },

  cardTitle: {
    color: "#244735",
    fontSize: 14,
    fontWeight: "700",
  },

  placeholderText: {
    color: "#7A817B",
    fontWeight: "500",
  },

  cardSubtitle: {
    color: "#7A817B",
    fontSize: 11,
    marginTop: 3,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#DCE6D8",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    color: "#244735",
    fontSize: 20,
  },

  chevron: {
    color: "#718172",
    fontSize: 28,
    fontWeight: "300",
    marginLeft: 8,
  },

  infoBox: {
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(220,230,216,0.48)",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#244735",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 12,
    fontWeight: "700",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#68736A",
    fontSize: 11,
    lineHeight: 17,
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

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(25, 42, 32, 0.38)",
  },

  modalContainer: {
    backgroundColor: "#F8F3E9",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },

  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C7CEC7",
    marginBottom: 22,
  },

  modalEyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },

  modalTitle: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "600",
  },

  modalSubtitle: {
    color: "#727A73",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 18,
  },

  optionsContainer: {
    gap: 10,
  },

  option: {
    minHeight: 68,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },

  optionSelected: {
    borderColor: "#244735",
    backgroundColor: "#EEF3EB",
  },

  optionPressed: {
    opacity: 0.78,
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E5ECE2",
    alignItems: "center",
    justifyContent: "center",
  },

  optionIconSelected: {
    backgroundColor: "#244735",
  },

  optionIconText: {
    color: "#244735",
    fontSize: 18,
  },

  optionIconTextSelected: {
    color: "#FFFFFF",
  },

  optionContent: {
    flex: 1,
    marginLeft: 12,
  },

  optionTitle: {
    color: "#244735",
    fontSize: 14,
    fontWeight: "700",
  },

  optionTitleSelected: {
    color: "#183426",
  },

  optionDescription: {
    color: "#818881",
    fontSize: 10,
    marginTop: 3,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#B9C3B9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  radioSelected: {
    borderColor: "#244735",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#244735",
  },
});