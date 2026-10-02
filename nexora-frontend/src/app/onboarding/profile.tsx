import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: 83 },
  (_, index) => CURRENT_YEAR - 18 - index
);

const DAYS = Array.from(
  { length: 31 },
  (_, index) => index + 1
);

const GENDERS = [
  "Man",
  "Woman",
  "Non-binary",
];

function getDaysInMonth(
  month: number,
  year: number
) {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
}

function calculateAge(date: Date | null) {
  if (!date) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    date.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() ===
      date.getMonth() &&
      today.getDate() >=
        date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

export default function ProfileScreen() {
  const [displayName, setDisplayName] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState<Date | null>(null);

  const [gender, setGender] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [city, setCity] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const today = new Date();

  const [selectedDay, setSelectedDay] =
    useState(
      Math.min(
        15,
        getDaysInMonth(
          today.getMonth(),
          today.getFullYear()
        )
      )
    );

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(CURRENT_YEAR - 18);

  const age = useMemo(
    () => calculateAge(dateOfBirth),
    [dateOfBirth]
  );

  const availableDays = useMemo(() => {
    const totalDays =
      getDaysInMonth(
        selectedMonth,
        selectedYear
      );

    return DAYS.filter(
      (day) => day <= totalDays
    );
  }, [
    selectedMonth,
    selectedYear,
  ]);

  const formattedDate = useMemo(() => {
    if (!dateOfBirth) {
      return "";
    }

    const day = String(
      dateOfBirth.getDate()
    ).padStart(2, "0");

    const month =
      MONTHS[
        dateOfBirth.getMonth()
      ];

    const year =
      dateOfBirth.getFullYear();

    return `${day} ${month} ${year}`;
  }, [dateOfBirth]);

  const canContinue =
    displayName.trim().length >= 1 &&
    dateOfBirth !== null &&
    age !== null &&
    age >= 18 &&
    gender.length > 0 &&
    city.trim().length >= 2;

  const openDatePicker = () => {
    if (dateOfBirth) {
      setSelectedDay(
        dateOfBirth.getDate()
      );

      setSelectedMonth(
        dateOfBirth.getMonth()
      );

      setSelectedYear(
        dateOfBirth.getFullYear()
      );
    }

    setShowDatePicker(true);
  };

  const confirmDate = () => {
    const maxDay =
      getDaysInMonth(
        selectedMonth,
        selectedYear
      );

    const safeDay = Math.min(
      selectedDay,
      maxDay
    );

    const selectedDate = new Date(
      selectedYear,
      selectedMonth,
      safeDay
    );

    setDateOfBirth(selectedDate);
    setSelectedDay(safeDay);
    setShowDatePicker(false);
  };

  const handleMonthChange = (
    month: number
  ) => {
    setSelectedMonth(month);

    const maxDay =
      getDaysInMonth(
        month,
        selectedYear
      );

    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  };

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    console.log(
      "🔥 PROFILE COMPLETED"
    );

    console.log(
      "DISPLAY NAME:",
      displayName
    );

    console.log(
      "DATE OF BIRTH:",
      dateOfBirth
    );

    console.log(
      "AGE:",
      age
    );

    console.log(
      "GENDER:",
      gender
    );

    console.log(
      "HEIGHT:",
      height
    );

    console.log(
      "CITY:",
      city
    );

    console.log(
      "BIO:",
      bio
    );

    router.push(
      "/onboarding/photos"
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.topRow}>
            <Pressable
              onPress={() =>
                router.back()
              }
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={styles.backArrow}
              >
                ‹
              </Text>
            </Pressable>

            <View
              style={
                styles.progressContainer
              }
            >
              <View
                style={
                  styles.progressTrack
                }
              >
                <View
                  style={
                    styles.progressFill
                  }
                />
              </View>

              <Text
                style={styles.progressText}
              >
                3 of 3
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text
              style={styles.eyebrow}
            >
              ABOUT YOU
            </Text>

            <Text
              style={styles.title}
            >
              Let people know{"\n"}
              <Text
                style={
                  styles.titleAccent
                }
              >
                you.
              </Text>
            </Text>

            <Text
              style={styles.subtitle}
            >
              Share only what you're
              comfortable with. Your profile
              should feel like you.
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={styles.label}
            >
              What should we call you?
            </Text>

            <Text
              style={styles.helper}
            >
              First name, nickname or
              initials — your full name
              isn't required.
            </Text>

            <View
              style={
                styles.inputWrapper
              }
            >
              <TextInput
                value={displayName}
                onChangeText={
                  setDisplayName
                }
                placeholder="e.g. Jay, J, Jay K."
                placeholderTextColor="#A5ADA6"
                style={styles.input}
                maxLength={30}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text
              style={styles.label}
            >
              When's your birthday?
            </Text>

            <Text
              style={styles.helper}
            >
              Your exact birthday stays
              private. We'll only show your
              age.
            </Text>

            <Pressable
              onPress={
                openDatePicker
              }
              style={({ pressed }) => [
                styles.dateButton,
                pressed &&
                  styles.buttonPressed,
                dateOfBirth &&
                  styles.dateButtonSelected,
              ]}
            >
              <View
                style={
                  styles.calendarIcon
                }
              >
                <Text
                  style={
                    styles.calendarIconText
                  }
                >
                  ▣
                </Text>
              </View>

              <View
                style={
                  styles.dateTextContainer
                }
              >
                <Text
                  style={[
                    styles.dateText,
                    !dateOfBirth &&
                      styles.placeholderText,
                  ]}
                >
                  {formattedDate ||
                    "Select your birthday"}
                </Text>

                {age !== null && (
                  <Text
                    style={
                      styles.ageText
                    }
                  >
                    {age} years old
                  </Text>
                )}
              </View>

              <Text
                style={styles.chevron}
              >
                ›
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text
              style={styles.label}
            >
              How do you identify?
            </Text>

            <View
              style={styles.genderGrid}
            >
              {GENDERS.map(
                (item) => {
                  const selected =
                    gender === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() =>
                        setGender(item)
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.genderButton,
                        selected &&
                          styles.genderButtonSelected,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          selected &&
                            styles.genderTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View
              style={[
                styles.section,
                styles.half,
              ]}
            >
              <Text
                style={styles.label}
              >
                Height
              </Text>

              <View
                style={
                  styles.inputWrapper
                }
              >
                <TextInput
                  value={height}
                  onChangeText={
                    setHeight
                  }
                  placeholder="Height"
                  placeholderTextColor="#A5ADA6"
                  keyboardType="numeric"
                  style={styles.input}
                  maxLength={3}
                />

                <Text
                  style={
                    styles.inputSuffix
                  }
                >
                  cm
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.section,
                styles.half,
                styles.citySection,
              ]}
            >
              <Text
                style={styles.label}
              >
                City
              </Text>

              <View
                style={
                  styles.inputWrapper
                }
              >
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Bhopal"
                  placeholderTextColor="#A5ADA6"
                  style={styles.input}
                  maxLength={40}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View
              style={styles.bioHeader}
            >
              <View>
                <Text
                  style={styles.label}
                >
                  About you
                </Text>

                <Text
                  style={styles.helper}
                >
                  Tell people a little
                  about yourself.
                </Text>
              </View>

              <Text
                style={styles.counter}
              >
                {bio.length}/100
              </Text>
            </View>

            <View
              style={[
                styles.inputWrapper,
                styles.bioWrapper,
              ]}
            >
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="What makes you, you?"
                placeholderTextColor="#A5ADA6"
                style={[
                  styles.input,
                  styles.bioInput,
                ]}
                multiline
                textAlignVertical="top"
                maxLength={100}
              />
            </View>
          </View>

          <View
            style={styles.privacyCard}
          >
            <View
              style={styles.privacyIcon}
            >
              <Text
                style={styles.lockIcon}
              >
                •
              </Text>
            </View>

            <View
              style={styles.privacyContent}
            >
              <Text
                style={
                  styles.privacyTitle
                }
              >
                Your privacy matters
              </Text>

              <Text
                style={
                  styles.privacyText
                }
              >
                Your exact date of birth
                won't be shown to other
                people. Only your age will
                appear on your profile.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={({ pressed }) => [
              styles.continueButton,
              !canContinue &&
                styles.continueButtonDisabled,
              pressed &&
                canContinue &&
                styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={
                canContinue
                  ? [
                      "#244735",
                      "#315C43",
                    ]
                  : [
                      "#B8C0B9",
                      "#B8C0B9",
                    ]
              }
              style={
                styles.gradientButton
              }
            >
              <Text
                style={
                  styles.continueText
                }
              >
                Continue
              </Text>

              <View
                style={
                  styles.arrowCircle
                }
              >
                <Text
                  style={styles.arrow}
                >
                  →
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          <Text
            style={styles.bottomText}
          >
            You can always update your
            profile later.
          </Text>
        </ScrollView>

        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setShowDatePicker(false)
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <Pressable
              style={
                styles.modalBackdrop
              }
              onPress={() =>
                setShowDatePicker(
                  false
                )
              }
            />

            <View
              style={styles.dateModal}
            >
              <View
                style={
                  styles.modalHandle
                }
              />

              <View
                style={
                  styles.modalHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.modalEyebrow
                    }
                  >
                    YOUR BIRTHDAY
                  </Text>

                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    Select your date
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setShowDatePicker(
                      false
                    )
                  }
                  style={
                    styles.closeButton
                  }
                >
                  <Text
                    style={
                      styles.closeText
                    }
                  >
                    ×
                  </Text>
                </Pressable>
              </View>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Scroll each column to
                choose your birthday.
              </Text>

              <View
                style={
                  styles.wheelContainer
                }
              >
                {/* BACKGROUND SELECTION STRIP */}
                <View
                  pointerEvents="none"
                  style={
                    styles.selectionHighlight
                  }
                />

                {/* DAY */}
                <ScrollView
                  style={
                    styles.wheelColumn
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  snapToInterval={48}
                  decelerationRate="fast"
                  contentContainerStyle={
                    styles.wheelContent
                  }
                  onMomentumScrollEnd={(
                    event
                  ) => {
                    const index =
                      Math.round(
                        event.nativeEvent
                          .contentOffset
                          .y / 48
                      );

                    const safeIndex =
                      Math.max(
                        0,
                        Math.min(
                          index,
                          availableDays.length -
                            1
                        )
                      );

                    const day =
                      availableDays[
                        safeIndex
                      ];

                    if (day) {
                      setSelectedDay(
                        day
                      );
                    }
                  }}
                  contentOffset={{
                    x: 0,
                    y:
                      Math.max(
                        0,
                        availableDays.indexOf(
                          selectedDay
                        )
                      ) * 48,
                  }}
                >
                  {availableDays.map(
                    (day) => (
                      <View
                        key={day}
                        style={
                          styles.wheelItem
                        }
                      >
                        <Text
                          style={[
                            styles.wheelText,
                            selectedDay ===
                              day &&
                              styles.wheelTextSelected,
                          ]}
                        >
                          {String(
                            day
                          ).padStart(
                            2,
                            "0"
                          )}
                        </Text>
                      </View>
                    )
                  )}
                </ScrollView>

                {/* MONTH */}
                <ScrollView
                  style={
                    styles.wheelColumn
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  snapToInterval={48}
                  decelerationRate="fast"
                  contentContainerStyle={
                    styles.wheelContent
                  }
                  onMomentumScrollEnd={(
                    event
                  ) => {
                    const index =
                      Math.round(
                        event.nativeEvent
                          .contentOffset
                          .y / 48
                      );

                    const month =
                      Math.max(
                        0,
                        Math.min(
                          index,
                          11
                        )
                      );

                    handleMonthChange(
                      month
                    );
                  }}
                  contentOffset={{
                    x: 0,
                    y:
                      selectedMonth *
                      48,
                  }}
                >
                  {MONTHS.map(
                    (
                      month,
                      index
                    ) => (
                      <View
                        key={month}
                        style={
                          styles.wheelItem
                        }
                      >
                        <Text
                          style={[
                            styles.wheelText,
                            selectedMonth ===
                              index &&
                              styles.wheelTextSelected,
                          ]}
                        >
                          {month.slice(
                            0,
                            3
                          )}
                        </Text>
                      </View>
                    )
                  )}
                </ScrollView>

                {/* YEAR */}
                <ScrollView
                  style={
                    styles.wheelColumn
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  snapToInterval={48}
                  decelerationRate="fast"
                  contentContainerStyle={
                    styles.wheelContent
                  }
                  onMomentumScrollEnd={(
                    event
                  ) => {
                    const index =
                      Math.round(
                        event.nativeEvent
                          .contentOffset
                          .y / 48
                      );

                    const safeIndex =
                      Math.max(
                        0,
                        Math.min(
                          index,
                          YEARS.length -
                            1
                        )
                      );

                    const year =
                      YEARS[
                        safeIndex
                      ];

                    if (year) {
                      setSelectedYear(
                        year
                      );

                      const maxDay =
                        getDaysInMonth(
                          selectedMonth,
                          year
                        );

                      if (
                        selectedDay >
                        maxDay
                      ) {
                        setSelectedDay(
                          maxDay
                        );
                      }
                    }
                  }}
                  contentOffset={{
                    x: 0,
                    y:
                      Math.max(
                        0,
                        YEARS.indexOf(
                          selectedYear
                        )
                      ) * 48,
                  }}
                >
                  {YEARS.map(
                    (year) => (
                      <View
                        key={year}
                        style={
                          styles.wheelItem
                        }
                      >
                        <Text
                          style={[
                            styles.wheelText,
                            selectedYear ===
                              year &&
                              styles.wheelTextSelected,
                          ]}
                        >
                          {year}
                        </Text>
                      </View>
                    )
                  )}
                </ScrollView>
              </View>

              <View
                style={
                  styles.selectedDatePreview
                }
              >
                <Text
                  style={
                    styles.previewLabel
                  }
                >
                  SELECTED
                </Text>

                <Text
                  style={
                    styles.previewDate
                  }
                >
                  {String(
                    selectedDay
                  ).padStart(
                    2,
                    "0"
                  )}{" "}
                  {
                    MONTHS[
                      selectedMonth
                    ]
                  }{" "}
                  {selectedYear}
                </Text>
              </View>

              <Pressable
                onPress={
                  confirmDate
                }
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={
                    styles.confirmText
                  }
                >
                  Confirm Birthday
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F3E9",
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 40,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    color: "#244735",
    fontSize: 30,
    lineHeight: 32,
    marginTop: -3,
  },

  progressContainer: {
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
    borderRadius: 5,
    backgroundColor: "#244735",
  },

  progressText: {
    color: "#7D867E",
    fontSize: 11,
    fontWeight: "600",
  },

  header: {
    marginTop: 30,
    marginBottom: 28,
  },

  eyebrow: {
    color: "#819180",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
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

  section: {
    marginBottom: 23,
  },

  label: {
    color: "#314A39",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  helper: {
    color: "#8A928B",
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 9,
  },

  inputWrapper: {
    minHeight: 55,
    borderRadius: 17,
    backgroundColor:
      "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "#E4E7E1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    color: "#294433",
    fontSize: 14,
    minHeight: 53,
  },

  inputSuffix: {
    color: "#8B938C",
    fontSize: 12,
    fontWeight: "600",
  },

  dateButton: {
    minHeight: 67,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "#E4E7E1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  dateButtonSelected: {
    borderColor: "#C9D7C5",
  },

  calendarIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E0E9DC",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarIconText: {
    color: "#244735",
    fontSize: 18,
    fontWeight: "800",
  },

  dateTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  dateText: {
    color: "#294433",
    fontSize: 13,
    fontWeight: "700",
  },

  placeholderText: {
    color: "#A5ADA6",
    fontWeight: "500",
  },

  ageText: {
    color: "#809080",
    fontSize: 10,
    marginTop: 4,
  },

  chevron: {
    color: "#7E8A80",
    fontSize: 25,
    marginLeft: 8,
  },

  genderGrid: {
    flexDirection: "row",
    gap: 8,
  },

  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "#E4E7E1",
    alignItems: "center",
    justifyContent: "center",
  },

  genderButtonSelected: {
    backgroundColor: "#E0E9DC",
    borderColor: "#BFD0BA",
  },

  genderText: {
    color: "#7A837B",
    fontSize: 11,
    fontWeight: "600",
  },

  genderTextSelected: {
    color: "#244735",
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  half: {
    flex: 1,
  },

  citySection: {
    flex: 1.35,
  },

  bioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  counter: {
    color: "#A0A8A1",
    fontSize: 10,
    marginBottom: 9,
  },

  bioWrapper: {
    minHeight: 125,
    alignItems: "flex-start",
    paddingVertical: 12,
  },

  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  privacyCard: {
    flexDirection: "row",
    backgroundColor: "#EEF2EA",
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
  },

  privacyIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#DCE7D8",
    alignItems: "center",
    justifyContent: "center",
  },

  lockIcon: {
    color: "#244735",
    fontSize: 25,
    fontWeight: "800",
    marginTop: -7,
  },

  privacyContent: {
    flex: 1,
    marginLeft: 11,
  },

  privacyTitle: {
    color: "#31503C",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 3,
  },

  privacyText: {
    color: "#7A857C",
    fontSize: 9.5,
    lineHeight: 14,
  },

  continueButton: {
    width: "100%",
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
  },

  continueButtonDisabled: {
    opacity: 0.85,
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
    marginTop: 11,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor:
      "rgba(22,36,28,0.42)",
  },

  dateModal: {
    backgroundColor: "#F8F3E9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === "ios"
        ? 32
        : 24,
  },

  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#C8CEC8",
    marginBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
  },

  modalEyebrow: {
    color: "#819180",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },

  modalTitle: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 27,
    fontWeight: "600",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8EDE5",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#536457",
    fontSize: 25,
    lineHeight: 27,
    marginTop: -2,
  },

  modalSubtitle: {
    color: "#7E887F",
    fontSize: 11,
    marginTop: 7,
    marginBottom: 17,
  },

  wheelContainer: {
    height: 144,
    borderRadius: 20,
    backgroundColor: "#EEF2EA",
    overflow: "hidden",
    flexDirection: "row",
    position: "relative",
  },

  /*
   * IMPORTANT:
   * Selection strip is now behind the wheel columns.
   * Earlier it was covering the selected text.
   */
  selectionHighlight: {
    position: "absolute",
    top: 48,
    left: 10,
    right: 10,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#D8E4D4",
    zIndex: 0,
  },

  wheelColumn: {
    flex: 1,
    zIndex: 2,
  },

  wheelContent: {
    paddingVertical: 48,
  },

  wheelItem: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  wheelText: {
    color: "#9BA49C",
    fontSize: 14,
    fontWeight: "600",
  },

  wheelTextSelected: {
    color: "#163A29",
    fontSize: 17,
    fontWeight: "900",
  },

  selectedDatePreview: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 15,
  },

  previewLabel: {
    color: "#8A958B",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
  },

  previewDate: {
    color: "#244735",
    fontSize: 17,
    fontWeight: "800",
  },

  confirmButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#244735",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});