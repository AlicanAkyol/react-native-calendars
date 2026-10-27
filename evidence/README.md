# ExpandableCalendar #2778: native animation reproduction

Observed 27 October 2026: RN 0.87.1, React 19.2.3, iPhone Air Simulator, iOS 26.2, Release/Fabric. Both library copies run in the same binary and JS bundle with real Animated.spring animations. No animation mocks or production-code instrumentation are used in this native fixture.

Baseline: 808c6e100511f9adf65b1adec5e5830210f27ef4 (upstream master). Patched: 614e81f (PR branch).

The first phase invokes each calendar's public ref.toggleCalendarPosition three times in the same JS turn. Baseline completion notifications: [true,true,true]. Patched: [true]. The knob itself is covered separately by fireEvent tests; this native fixture invokes the same public toggle method programmatically.

The second phase remounts both calendars. onCalendarToggled immediately calls toggleCalendarPosition once on the first completion. Baseline emits [true,true] and remains open; patched emits [true,false] and closes. The screenshot shows the final native views and the callback traces from both phases.

To reproduce, install this repository's locked JS dependencies, then prepare an otherwise working bare RN 0.87.1 app with its native pods installed. Run python3 evidence/prepare-fixture.py /absolute/path/to/RNApp. It creates calendar-evidence/ and metro.calendar.config.js without overwriting existing files. Make the RN app's root App re-export ./calendar-evidence/App, bundle using --config metro.calendar.config.js, then build/launch a Release simulator app. Allow approximately 10 seconds for both phases.

The resolver forces both source copies and all dependencies to use the RN app's single React and React Native installations. Other JS dependencies resolve from this repository's node_modules. No changes to Pod dependencies are needed.

Limitations: only iOS was run natively; no physical swipe or Android instrumentation was performed. Normalized pan callbacks, vertical mode, interruption, unmount and overlay timing are exercised in the separate repository regression tests.
