import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Logo shapes traced from the original Nexora PNG (viewBox 145 x 160).
const LEFT_PATH =
  "M15.3 36.8 L14.2 38.5 L11.2 47.5 L11.0 52.7 L10.0 55.2 L10.0 66.7 L11.0 69.2 L11.0 71.7 L11.8 73.5 L12.2 76.3 L14.2 82.3 L18.3 90.7 L19.7 92.2 L20.3 93.7 L22.7 96.2 L23.3 97.7 L33.2 107.5 L34.7 108.2 L39.2 112.5 L40.7 113.2 L48.2 120.5 L49.7 121.2 L55.0 126.3 L63.7 137.2 L64.3 138.7 L67.7 143.2 L69.3 146.5 L70.3 147.0 L70.8 146.2 L70.8 144.0 L71.7 142.3 L72.0 139.5 L72.8 137.7 L73.0 135.5 L73.8 133.7 L73.8 130.2 L74.8 127.7 L74.8 101.2 L73.8 98.7 L73.7 94.5 L71.7 88.5 L70.0 85.3 L69.7 83.5 L64.5 74.2 L62.2 71.7 L61.5 70.2 L56.7 65.3 L55.2 64.7 L49.7 59.3 L48.2 58.7 L46.7 57.3 L43.2 55.7 L41.7 54.3 L38.2 52.7 L36.7 51.3 L26.2 44.7 L23.7 42.3 L22.2 41.7 L16.3 37.0Z M41.5 10.2 L37.2 12.3 L33.3 16.2 L30.2 22.5 L30.0 25.7 L29.0 28.2 L29.0 30.7 L31.2 37.3 L32.3 39.7 L37.2 44.5 L38.7 45.2 L40.2 46.5 L43.7 48.2 L45.2 49.5 L48.7 51.2 L50.2 52.5 L58.7 56.3 L58.8 55.7 L57.5 53.2 L56.2 51.7 L52.0 42.3 L51.8 40.2 L50.8 37.7 L51.8 34.7 L52.0 32.5 L53.2 30.2 L54.2 29.2 L59.2 26.8 L63.3 27.0 L67.7 29.2 L71.3 32.5 L71.8 31.5 L71.8 29.2 L70.7 25.5 L67.5 19.2 L66.2 17.7 L65.5 16.2 L62.7 13.3 L56.3 10.2 L52.7 9.0 L46.2 9.0 L44.3 9.8Z ";
const RIGHT_PATH =
  "M132.3 36.3 L131.5 36.0 L130.2 36.3 L127.7 38.7 L126.2 39.3 L121.7 42.7 L118.2 44.3 L116.7 45.7 L115.2 46.3 L112.7 48.7 L111.2 49.3 L109.7 50.7 L105.2 53.3 L102.7 55.7 L98.2 58.3 L88.3 68.2 L87.7 69.7 L85.3 72.2 L84.7 73.7 L81.3 78.2 L80.8 80.3 L78.2 86.2 L80.0 91.2 L80.0 93.7 L81.0 96.2 L81.0 100.7 L82.0 103.2 L82.0 114.7 L81.0 117.2 L81.0 125.7 L80.0 128.2 L80.0 130.7 L79.2 132.5 L78.8 135.3 L76.0 143.2 L76.5 145.0 L77.5 144.5 L79.0 142.2 L107.3 113.8 L112.5 109.8 L125.5 96.7 L126.2 95.2 L131.5 87.7 L133.7 83.3 L135.7 77.3 L137.0 70.5 L137.8 68.7 L137.8 52.2 L133.7 38.5Z M106.3 10.2 L102.7 9.0 L94.2 9.0 L88.2 11.3 L86.7 12.7 L85.2 13.3 L82.3 16.2 L81.7 17.7 L80.3 19.2 L77.2 25.5 L76.0 29.2 L76.0 33.3 L77.2 33.0 L82.5 28.0 L89.7 27.8 L90.7 28.2 L93.7 31.2 L94.8 33.5 L94.8 42.3 L89.0 53.8 L89.0 55.3 L90.7 55.0 L95.7 52.5 L97.2 51.2 L102.7 48.5 L104.2 47.2 L108.7 44.5 L114.5 38.7 L116.7 34.3 L116.8 30.2 L117.7 28.2 L116.8 25.7 L116.7 21.5 L113.5 15.2 L110.7 12.3Z ";

const GREEN = "#153A2A";
const PEACH = "#D4936C";

const LOGO_W = Math.min(SCREEN_WIDTH * 0.6, 300);
const LOGO_H = Math.round((160 / 145) * LOGO_W);
const K = LOGO_W / 145; // viewBox unit -> dp

// Same numbers as the approved web animation.
const LAYERS = 16;
const SPACING = 1.5; // depth between layers (viewBox units)
const PERSPECTIVE = 1200;
const SWAY_DEG = 28;
const SWAY_PERIOD = 7850; // ms
const ENTER_DEG = 110;

// React Native has no translateZ / preserve-3d, so each layer is shifted
// sideways by z * sin(angle). This is what the eye sees from a real
// extruded object turning around the Y axis.
const ANGLES: number[] = [];
for (let a = -150; a <= 150; a += 10) ANGLES.push(a);
const SWAY_POINTS: number[] = [];
for (let i = 0; i <= 48; i++) SWAY_POINTS.push(i / 48);

function shade(hex: string, b: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * b);
  const g = Math.round(((n >> 8) & 255) * b);
  const bl = Math.round((n & 255) * b);
  return `rgb(${r},${g},${bl})`;
}

function Half({
  path,
  color,
  side,
  enter,
  sway,
  gradId,
}: {
  path: string;
  color: string;
  side: "left" | "right";
  enter: Animated.Value;
  sway: Animated.AnimatedInterpolation<number>;
  gradId: string;
}) {
  const dir = side === "left" ? -1 : 1;

  const theta = useMemo(
    () =>
      Animated.add(
        enter.interpolate({ inputRange: [0, 1], outputRange: [dir * ENTER_DEG, 0] }),
        sway
      ),
    [enter, sway, dir]
  );

  const rotateY = useMemo(
    () =>
      theta.interpolate({
        inputRange: [-150, 150],
        outputRange: ["-150deg", "150deg"],
      }),
    [theta]
  );

  const shifts = useMemo(
    () =>
      Array.from({ length: LAYERS }).map((_, i) => {
        const z = (i - (LAYERS - 1) / 2) * SPACING * K;
        return theta.interpolate({
          inputRange: ANGLES,
          outputRange: ANGLES.map((a) => z * Math.sin((a * Math.PI) / 180)),
          extrapolate: "clamp",
        });
      }),
    [theta]
  );

  const translateX = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [dir * SCREEN_WIDTH * 0.8, 0],
  });
  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transform: [{ translateX }, { scale }] }]}
    >
      {shifts.map((shift, i) => {
        const front = i === LAYERS - 1;
        const b = 0.5 + (0.5 * i) / (LAYERS - 1);
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { perspective: PERSPECTIVE },
                  { translateX: shift },
                  { rotateY },
                ],
              },
            ]}
          >
            <Svg width={LOGO_W} height={LOGO_H} viewBox="0 0 145 160">
              <Path d={path} fill={shade(color, b)} fillRule="evenodd" />
              {front && (
                <>
                  <Defs>
                    <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor="#fff" stopOpacity={0.4} />
                      <Stop offset="0.55" stopColor="#fff" stopOpacity={0} />
                    </LinearGradient>
                  </Defs>
                  <Path d={path} fill={`url(#${gradId})`} fillRule="evenodd" />
                </>
              )}
            </Svg>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

export default function NexoraSplash({
  duration = 7000,
  onFinish,
  backgroundColor = "#FFFFFF",
}: {
  duration?: number;
  onFinish: () => void;
  backgroundColor?: string;
}) {
  const enterL = useRef(new Animated.Value(0)).current;
  const enterR = useRef(new Animated.Value(0)).current;
  const swayT = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const floor = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const sway = useMemo(
    () =>
      swayT.interpolate({
        inputRange: SWAY_POINTS,
        outputRange: SWAY_POINTS.map((p) => SWAY_DEG * Math.sin(2 * Math.PI * p)),
      }),
    [swayT]
  );

  useEffect(() => {
    const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

    const enter = Animated.parallel([
      Animated.timing(enterL, { toValue: 1, duration: 1300, easing: ease, useNativeDriver: true }),
      Animated.timing(enterR, { toValue: 1, duration: 1300, delay: 150, easing: ease, useNativeDriver: true }),
      Animated.timing(floor, { toValue: 1, duration: 1000, delay: 1000, useNativeDriver: true }),
    ]);

    const swayLoop = Animated.loop(
      Animated.timing(swayT, {
        toValue: 1,
        duration: SWAY_PERIOD,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const breathe = Animated.sequence([
      Animated.delay(1800),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.035, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ),
    ]);

    enter.start();
    swayLoop.start();
    breathe.start();

    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) onFinishRef.current();
        }
      );
    }, Math.max(0, duration - 180));

    return () => {
      clearTimeout(timer);
      enter.stop();
      swayLoop.stop();
      breathe.stop();
    };
  }, [duration, enterL, enterR, floor, fade, pulse, swayT]);

  return (
    <Animated.View style={[styles.root, { backgroundColor, opacity: fade }]}>
      <Animated.View style={[styles.logo, { transform: [{ scale: pulse }] }]}>
        <Animated.View style={[styles.floor, { opacity: floor }]}>
          <Svg width={LOGO_W * 1.1} height={28}>
            <Defs>
              <RadialGradient id="nexFloor" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={GREEN} stopOpacity={0.28} />
                <Stop offset="1" stopColor={GREEN} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={LOGO_W * 0.55} cy={14} rx={LOGO_W * 0.5} ry={10} fill="url(#nexFloor)" />
          </Svg>
        </Animated.View>
        <Half path={LEFT_PATH} color={GREEN} side="left" enter={enterL} sway={sway} gradId="nexSheenL" />
        <Half path={RIGHT_PATH} color={PEACH} side="right" enter={enterR} sway={sway} gradId="nexSheenR" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  logo: {
    width: LOGO_W,
    height: LOGO_H,
  },
  floor: {
    position: "absolute",
    left: -LOGO_W * 0.05,
    top: LOGO_H + 8,
  },
});