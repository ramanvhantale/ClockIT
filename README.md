# ClockIT — World Clock & Time Management Dashboard
> **Web Technology College Assignment**  
> Built with React, Vite, HTML5, CSS3, Lucide Icons, Intl API, and Web Audio API.

---

## 1. Assignment Objective
**ClockIT** is a production-grade, responsive World Clock and Time Management Dashboard designed to showcase core Web Technology concepts:
- Modern frontend component architecture using **React (functional components & custom hooks)**.
- Precision time synchronization using the browser's native **`Intl.DateTimeFormat`** API and official **IANA Time Zone database**.
- Hardware-accelerated graphics using an SVG **Analog Clock** powered by `requestAnimationFrame`.
- Local alarm scheduling with snooze functionality, persistence via **`localStorage`**, and audio synthesis via the **Web Audio API**.
- A strict, editorial 5-color aesthetic built entirely with **Vanilla CSS variables** without third-party CSS utility bloat.

---

## 2. Strict Color Palette
ClockIT is built strictly using the five specified theme colors:

| Color Token | Hex Code | Role in Application |
|---|---|---|
| **NAVY** | `#2F4156` | Sidebar navigation, main text on light surfaces, modal headers |
| **TEAL** | `#567C8D` | Primary action buttons, clock minute hands, active tabs |
| **SKY BLUE** | `#C8D9E6` | Accent borders, badges, second-hand pivot highlight, card glows |
| **BEIGE** | `#F5EFEB` | Application page background, subtle inputs, container fills |
| **WHITE** | `#FFFFFF` | Cards, analog clock face dial, dialog boxes, elevated surfaces |

---

## 3. Key Features & Themes

### Theme Modes & Visual Transitions
ClockIT supports 3 distinct visual themes designed around the core palette with silky-smooth 350ms transitions:
- **Dual Tone (Default Signature)**: Classic Navy (`#2F4156`) sidebar with warm Beige (`#F5EFEB`) page backdrop and crisp White (`#FFFFFF`) elevated cards.
- **Light Mode**: Clean, bright aesthetic with crisp off-white backdrop (`#FAF7F4`), bright white sidebar with refined borders, and high-contrast typography.
- **Dark Mode**: Sleek deep navy slate (`#17222D`) canvas, darker navy sidebar (`#111A23`), slate cards (`#21303E`), and luminous clock dials with sky-blue accents.
- **High-Contrast Input Elements**: The search bar, city selectors, pills, and toggles use dedicated semantic input tokens (`--bg-input`, `--border-input`, and high-contrast `--text-primary`/`--text-muted`) guaranteeing crystal-clear visibility in all three modes.
- **Butter-Smooth Theme Transitions**: Changing themes applies a timed `theme-transitioning` class that seamlessly interpolates backgrounds, borders, colors, and shadows without interfering with high-FPS analog hands.

### Dashboard & Clock Features
1. **Collapsible Navigation & Big Dashboard View**:
   - One-click toggle button on the header and sidebar to collapse/expand the navigation panel.
   - When navigation is hidden, the dashboard automatically expands to an immersive, cinema-wide 1560px layout with enlarged grid cards and spacious padding.
   - Navigation panel visibility is also configurable in Settings and persists in `localStorage`.

2. **Featured 4-Clock Live Showcase (Home Dashboard)**:
   - **Primary Reference Clock**: Prominently designated with an official `★ Primary Clock` badge, real-time live SVG analog clock with smooth second-hand rotation, full digital time, day, date, and local timezone offset.
   - **3 Additional Live Clocks**: 3 live companion clocks for other global cities (e.g., London, New York, Tokyo) running concurrently on the home dashboard.
   - **Refined City Selector**: Each companion clock has an elegant pill selector featuring country flag, city name, and a crisp chevron dropdown arrow. Clicking opens a clean selector to swap any live clock instantly.
   - **One-click Primary Swap**: Users can click the star icon on any clock card to immediately promote it to the Primary Clock.

3. **Butter-Smooth 60 FPS Performance (Zero Jitter)**:
   - Analog clock hands operate via direct SVG DOM node transforms inside `requestAnimationFrame`.
   - Timezone string parsing is cached and updated strictly on second transitions, eliminating over 240+ React state re-renders/sec and GC pauses.
   - Results in 60–120 FPS buttery-smooth hand rotation with zero jitter or UI stutter.

3. **World Clocks Grid**:
   - Initial cities loaded: **Pune (India)**, **London (UK)**, **New York (USA)**, **Tokyo (Japan)**, **Dubai (UAE)**, and **Sydney (Australia)**.
   - Every card displays: City name, Country flag, Local time, Local date, Timezone abbreviation, Relative time difference from primary reference (e.g. `+3h 30m`, `-4h 30m`), and an automatic Day ☀️ / Night 🌙 icon.
   - Sorting options: Default order, Alphabetical by name (A-Z), and by Time Zone offset (West to East).
   - Duplicate prevention: Searchable city modal alerts the user if a selected city is already present.
   - Set as primary: Users can click the star icon on any city to make it the primary reference clock.

4. **Browser Alarm Management**:
   - Create, edit, toggle, and delete alarms with custom labels.
   - Configurable in 12-hour (with AM/PM) or 24-hour time.
   - Countdown timer display indicating how many hours and minutes remain until the next alarm rings.
   - In-app animated ringing modal with **Snooze (5 minutes)** and **Dismiss** options.
   - Synthesizer beep chime synthesized on-the-fly using the browser's **Web Audio API** (no external audio files needed).

5. **Dynamic Settings & Persistence (100% Functional)**:
   - **Theme Selector**: Toggle between Dual-Tone, Light, and Dark modes with instant live switching.
   - **Card Spacing & Density**: Switch between Comfortable and Compact layout density.
   - **12H / 24H Format**: Switch between standard 12-hour (with AM/PM) and 24-hour military format.
   - **Show / Hide Seconds**: Toggle live seconds display across all digital clocks.
   - **Smooth Analog Sweeping**: Toggle between continuous 60 FPS sweeping and discrete 1-second ticks.
   - **Alarm Sound Effects**: Toggle Web Audio alert chimes.
   - **Test Alarm Audio**: Live interactive preview button to test browser synthesizer sound output with stop control.
   - **Primary Reference City**: Choose benchmark city for global time differences.
   - **Reset Defaults**: Restores factory settings and provides instant toast feedback.
   - All settings and alarms are saved in the browser's `localStorage` and persist upon page reload.

---

## 4. How Key Architectural Components Work

### A. How Time Zones Work (Intl.DateTimeFormat)
Instead of hardcoding static UTC offsets (which break during Daylight Saving Time transitions), ClockIT relies on the browser's built-in **ECMAScript Internationalization API (`Intl.DateTimeFormat`)** and standard **IANA Time Zone strings** (e.g., `Europe/London`, `America/New_York`, `Asia/Kolkata`).

```javascript
// Formatting localized time with automatic DST adjustments:
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/London',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});
```
When London transitions between Greenwich Mean Time (GMT, UTC+0) and British Summer Time (BST, UTC+1), the browser's internal timezone database automatically updates the hours and offset without manual intervention.

### B. How the Analog Clock Animation Works (`requestAnimationFrame`)
Rather than relying solely on `setInterval` which can stutter or cause layout thrashing, the analog clock uses a custom hook `useAnalogClockAngles()` powered by `requestAnimationFrame`:
1. Every animation frame (approx. 60 FPS), the hook calculates the millisecond fraction of the second:
   $$\text{secondAngle} = \left(\text{seconds} + \frac{\text{milliseconds}}{1000}\right) \times 6^\circ$$
2. The SVG hand lines have `transform="rotate(angle 100 100)"` applied around the clock dial center $(100, 100)$.
3. When the user enables "prefers-reduced-motion" or disables smooth animations in settings, the hook automatically falls back to clean 1-second interval steps.

### C. How Alarm Scheduling Works
1. `useClock()` publishes an updated timestamp once per second.
2. `useAlarms()` evaluates enabled alarms against the current browser time (`now.getHours()` and `now.getMinutes()`).
3. To prevent duplicate triggers during the same minute or across React re-renders, triggers are keyed by `YYYY-MM-DD-HH-mm`.
4. When triggered, the Web Audio API oscillator generates an audible recurring tone sequence, and an alert dialog pops up.
5. Clicking **Snooze** assigns a `snoozedUntil` timestamp 5 minutes into the future.

---

## 5. Project File Structure
```
Clockvit/
├── index.html                   # HTML entry point with fonts & metadata
├── package.json                 # Project dependencies & npm scripts
├── vite.config.js               # Vite bundler configuration
├── public/
│   └── clock-icon.svg           # Application SVG favicon
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main application state & routing controller
│   ├── index.css                # Global stylesheet entry importing modules
│   ├── data/
│       └── cities.js            # Curated catalog of global cities & IANA timezones
│   ├── utils/
│       ├── timeUtils.js         # Intl time/date formatting, DST offsets, angles
│       └── alarmUtils.js        # Web Audio API chime synthesis, validation
│   ├── hooks/
│       ├── useClock.js          # Synchronized clock & RAF animation hooks
│       ├── useLocalStorage.js   # Resilient localStorage synchronization
│       └── useAlarms.js         # Alarm scheduling, trigger deduplication, snooze
│   ├── components/
│       ├── Sidebar.jsx          # Collapsible desktop/mobile navigation sidebar
│       ├── Header.jsx           # Dynamic header with search, 12/24H toggle, date
│       ├── AnalogClock.jsx      # High-fidelity SVG Analog Clock
│       ├── DigitalClock.jsx     # Prominent digital display with timezone badge
│       ├── WorldClockCard.jsx   # Individual city card with day/night indicator
│       ├── WorldClockGrid.jsx   # Grid with sorting and empty state handling
│       ├── CitySearch.jsx       # Search modal with duplicate city prevention
│       ├── AlarmCard.jsx        # Alarm item with countdown & toggle controls
│       ├── AlarmForm.jsx        # Modal form for adding/editing alarms
│       ├── AlarmDialog.jsx      # Active alarm popup with snooze & dismiss
│       └── Toast.jsx            # Toast notifications container
│   ├── pages/
│       ├── Dashboard.jsx        # Hero clock view + world clocks overview
│       ├── WorldClocks.jsx      # Full world clocks management view
│       ├── Alarms.jsx           # Dedicated alarms view
│       └── Settings.jsx         # Full preferences & controls view
│   ├── styles/
│       ├── global.css           # Palette variables, resets, buttons, modals, toasts
│       ├── components.css       # Sidebar, header, navigation styles
│       └── dashboard.css        # Hero clock, cards, grid, dialogs layout
│   └── test/
│       └── verify.test.js       # Node verification suite (61 tests covering DST, timezones)
```

---

## 6. How to Run & Test the Application

### Prerequisites
- Node.js (version 18+ or 20+)
- npm (Node Package Manager)

### Installation
In the project root directory, install dependencies:
```bash
npm install
```

### Running the Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### Running the Verification Test Suite
Execute the automated Node test suite covering 61 test assertions:
```bash
node src/test/verify.test.js
```

### Building for Production
Create an optimized production bundle in the `dist/` directory:
```bash
npm run build
```

---

## 7. Faculty Demonstration Guide
When presenting this assignment to your Web Technology faculty, highlight the following technical points:

1. **Why `Intl.DateTimeFormat` over manual UTC offsets?**  
   Manual math (like `UTC + 5.5`) fails to handle Daylight Saving Time (e.g., London alternating between UTC+0 and UTC+1, or New York between UTC-5 and UTC-4). `Intl` uses the operating system/browser's IANA tz database to compute the exact local time and DST shift automatically.

2. **Why `requestAnimationFrame` for the Analog Clock?**  
   `setInterval` can cause frame drops and choppy second-hand rotation. `requestAnimationFrame` matches the monitor's refresh rate (typically 60Hz or 120Hz) and pauses automatically when the user switches tabs, preserving battery and CPU.

3. **How does the Web Audio API synthesize alarm sounds?**  
   Instead of bundling MP3 audio files that might fail to load over the network, `alarmUtils.js` creates a native `AudioContext` and programs sine-wave `OscillatorNode`s with frequency envelopes directly in code.

4. **How are race conditions and duplicates prevented?**  
   - City search checks existing city IDs using a `Set` before adding.
   - Alarm checks use a formatted minute key (`YYYY-MM-DD-HH-mm`) to guarantee an alarm fires exactly once within its trigger minute.
   - `visibilitychange` listeners ensure the clock instantly resynchronizes if a laptop was put to sleep or the browser tab was backgrounded.

---

## 8. Browser Limitations Note
- **Audio Autoplay Policy**: Modern web browsers require at least one user click/interaction on the page before allowing sound playback through the `AudioContext`.
- **Background Tab Throttling**: When a browser tab is inactive or minimized, browsers throttle timers (`setInterval`) to conserve energy. ClockIT automatically resynchronizes to the exact local time the moment the tab becomes visible again via the `visibilitychange` event.
