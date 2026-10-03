import React, { useEffect, useState } from "react";
import { View } from "react-native";
import * as ExpoSplashScreen from "expo-splash-screen";
import { Slot, router } from "expo-router";
import NexoraSplash from "../components/NexoraSplash";

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Native launch screen can disappear once the JS tree is ready.
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {showSplash && (
        <NexoraSplash
          duration={7000}
          onFinish={() => {
            setShowSplash(false);
            // Do NOT change this route unless your first screen is different.
            // The splash simply disappears and reveals your existing first screen.
          }}
        />
      )}
    </View>
  );
}