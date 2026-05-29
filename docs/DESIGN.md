# LifeSync — Design Document

> **Version:** 1.0  
> **Updated:** May 29, 2026  
> **Status:** Draft — guiding frontend buildout

---

## 1. Purpose & Vision

LifeSync is an **AI-powered personal operating system** that runs an overnight agent, connects every corner of your life (email, finances, calendar, news), and delivers a **personalized morning briefing** so your day starts organized — automatically.

**Core promise:** Zero-config background intelligence. Wake up to a curated snapshot of what matters, what's changed, and what needs action — in under 30 seconds of reading.

### Why this exists

Modern life generates noise — dozens of emails, bank transactions, calendar events, news alerts. No human manually audits all of it daily. LifeSync acts as a **tireless overnight analyst** that separates signal from noise, surfaces anomalies, and lets you act with one tap.

---

## 2. Key Functions

### 2.1 Overnight Agent Cycle

| Phase | What happens |
|-------|-------------|
| **00:00–00:30** | Agent triggers via Cloud Scheduler |
| **00:30–00:35** | 4 modules run in parallel (inbox, finance, schedule, anomaly) |
| **00:35–00:40** | Results aggregated, briefing compiled, stored to Firestore |
| **00:40–00:45** | Push notification sent: *"Your morning briefing is ready"* |

### 2.2 Module Breakdown

| Module | Data sources | What it surfaces |
|--------|-------------|------------------|
| **Inbox** | Gmail | Urgent emails, drafted replies, newsletters to unsubscribe |
| **Finance** | Bank feeds (Fivetran), subscriptions | Budget vs. spend, bills due, duplicate charges |
| **Schedule** | Google Calendar | Today's meetings, priorities, conflicts, overload alert |
| **Anomaly** | All modules | Cross-module alerts ranked by severity (critical → low) |

### 2.3 User-Facing Actions

- **Approve** — execute a suggested action (e.g., send drafted reply, unsubscribe, flag bill)
- **Reject** — dismiss with optional reason
- **Snooze** — revisit tomorrow's briefing
- **Drill down** — tap a card to see full module details
- **Settings** — configure which modules are active, notification preferences

---

## 3. User Flows

### 3.1 First-Time Onboarding

```
Open app → Welcome screen (value prop) → Connect Gmail
→ Connect bank (Fivetran OAuth) → Grant calendar access
→ Set preferences (notification time, modules enabled)
→ "Your first briefing is being prepared..."
```

**Design goal:** Onboarding in ≤5 steps. Show progress indicator. Allow skip-any-step.

### 3.2 Daily Morning Flow

```
6:30 AM — Push notification arrives
   └─ Tap notification → Briefing dashboard opens
       ├─ Summary bar (glanceable: 3 urgent, 2 bills due, 1 conflict)
       ├─ Action items (approve/reject each)
       │   ├─ "Netflix charged twice — contact support?"
       │   ├─ "Reply to Sarah about Friday's meeting?"
       │   └─ "Electricity bill due in 2 days — pay now?"
       └─ Module tabs (Inbox | Finance | Schedule | All)
           └─ Tap any tab → Full module detail view
```

**Design goal:** Full briefing consumable in ≤30 seconds. Actions in 1 tap.

### 3.3 Review & Act Flow

```
Action card appears → Read 1-line summary
→ Tap **Approve** → action executes (async), card turns green with checkmark
→ Tap **Reject** → card collapses, optional "why?" text field
→ Tap **Details** → bottom sheet with full context
```

**Design goal:** Zero cognitive overhead. Each action is a single binary decision.

---

## 4. Visual Design

### 4.1 Design Philosophy

**"Calm Technology"** — the app should feel like a calm morning, not another notification firehose.

| Principle | Application |
|-----------|------------|
| **Glanceable** | Key metrics readable in 2 seconds |
| **Progressive disclosure** | Summary → cards → detail sheets |
| **Trustworthy** | Clean typography, muted palette, no dark patterns |
| **Personal** | Data-first; the user sees *their* information, not generic UI |

### 4.2 Color Palette

```
Primary:    #4F7CFF (calm blue — trust, clarity)
Success:    #34C759 (iOS green — approved actions)
Warning:    #FF9F0A (amber — anomalies, attention needed)
Danger:     #FF453A (red — critical alerts)
Background: #F5F5F7 (light gray — cards)
Surface:    #FFFFFF (white — content cards)
Text:       #1C1C1E (near-black)
Secondary:  #8E8E93 (muted gray — labels, metadata)
```

**Dark mode:** Same palette, inverted backgrounds (`#1C1C1E` surface, `#F5F5F7` text).

### 4.3 Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Headings | Inter / SF Pro | Bold (700) | 22–28px |
| Cards title | Inter / SF Pro | Semibold (600) | 17px |
| Body | Inter / SF Pro | Regular (400) | 15px |
| Metrics/numbers | JetBrains Mono / SF Mono | Medium (500) | 20px |
| Labels | Inter / SF Pro | Regular (400) | 13px |

### 4.4 Spacing & Layout

- **Grid:** 4-column mobile, 12-column tablet/web
- **Card padding:** 16px
- **Gutter:** 16px mobile, 24px desktop
- **Border radius:** 12px (cards), 20px (modals/sheets)
- **Max content width:** 480px mobile, 720px desktop

### 4.5 Component Patterns

**Briefing Card** — the core UI building block:
```
┌─────────────────────────────────┐
│ 🔴  ⚠️  Netflix duplicate charge│  ← Icon + Severity badge
│                                 │
│ Netflix charged $15.99 twice on │  ← 1-line description
│ May 28. Contact support.        │
│                                 │
│ [Approve]  [Reject]  [Details]  │  ← Action row
└─────────────────────────────────┘
```

**Summary Bar** — sticky header with key metrics:
```
┌──────────────────────────────────────┐
│ 📬 3 urgent  │ 💰 2 bills  │ ⚠️ 1 anomaly │
└──────────────────────────────────────┘
```

**Module Detail Sheet** — bottom sheet / full page with full module output:
```
┌──────────────────────────────────────┐
│ Inbox                        [Done]  │
│ ─────────────────────────────────── │
│ Urgent (3)                           │
│  • Project update — reply drafted    │
│  • Meeting reschedule — reply needed │
│  • Invoice due — reviewed            │
│ ─────────────────────────────────── │
│ FYI (12)                             │
│  • Newsletter #1  • Newsletter #2    │
│  • ...                               │
│ ─────────────────────────────────── │
│ Suggested unsubscribes: 2            │
└──────────────────────────────────────┘
```

---

## 5. Key Screens

### 5.1 Morning Briefing Dashboard (Home)

| Element | Purpose |
|---------|---------|
| Greeting | "Good morning, [name]" — time-aware |
| Date | "Your briefing for May 30, 2026" |
| Summary pill row | 3–4 key metrics at a glance |
| Action card stack | Prioritized actions (critical first) |
| "View all modules" | Expand to see inbox/finance/schedule tabs |
| Bottom nav | Home | History | Settings |

**States:**
- **Loading:** Skeleton cards with shimmer animation
- **Ready:** Full briefing with action cards
- **Empty:** "Your first briefing is being prepared — check back soon"
- **Error:** "Couldn't load briefing. Pull to refresh."

### 5.2 Action Approval Sheet

Bottom sheet triggered by tapping "Details" on an action card:

| Element | Purpose |
|---------|---------|
| Header | Action type + severity badge |
| Description | Full context (2–3 lines) |
| Data snippet | Relevant numbers/dates/email excerpt |
| [Approve] button | Primary CTA, green |
| [Reject] button | Secondary, with optional text field |
| Source link | "View in Gmail" / "View in Calendar" |

### 5.3 History Screen

Chronological list of past briefings:

```
┌──────────────────────────────────────┐
│ May 29  │ ⚠️ 2 anomalies  ✅ 3 actions taken │
│ May 28  │ ✅ All clear                        │
│ May 27  │ ⚠️ 1 anomaly  ✅ 1 action taken     │
└──────────────────────────────────────┘
```

Tap any entry to view that day's full briefing (read-only).

### 5.4 Settings Screen

| Section | Options |
|---------|---------|
| Modules | Toggle inbox / finance / schedule on/off |
| Notification time | Time picker (default 6:30 AM) |
| Notification channels | Push / email / both |
| Connected accounts | Gmail (connected), Bank (connected), Calendar (connected) |
| Briefing format | "Concise" vs "Detailed" |
| Dark mode | System / Light / Dark |
| Data & Privacy | Export data, delete account |

---

## 6. Interaction Patterns

### 6.1 Notifications

- **Morning briefing ready:** Short text + open dashboard on tap
- **Critical alert (out-of-cycle):** Only for anomalies flagged as `critical` — e.g., large unauthorized transaction
- **Digest preference:** Users choose time window (6:00–8:00 AM)
- **No spam:** Only 1 notification per cycle unless critical

### 6.2 Approve/Reject Flow

| Action | Visual feedback |
|--------|----------------|
| Approve | Button loading state → green checkmark → card fades to "Done" state |
| Reject | Card collapses with haptic feedback → "Dismissed" toast |
| Error on approve | Red banner: "Action failed. Try again." → Retry button |

### 6.3 Pull to Refresh

Manual trigger for overnight agent (if user opens app before 6 AM):
```
Pull down → "Running agent..." spinner → Briefing loads when ready
```

### 6.4 Offline Behavior

- Last-loaded briefing cached locally (AsyncStorage / localStorage)
- Offline indicator bar if no network
- Actions queued and executed when online

---

## 7. Platform Considerations

### 7.1 Web (React/Next.js)

- Responsive: mobile-first, expands to 2-column layout on desktop
- PWA support: install prompt, offline cache, push notifications (web push API)
- URL routing: `/briefing`, `/history`, `/settings`
- Keyboard shortcuts: `A` approve, `R` reject, `D` details

### 7.2 Mobile (React Native)

- iOS and Android with shared codebase
- Native navigation (React Navigation)
- Swipe-to-dismiss on action cards
- Haptic feedback on approve/reject
- Widget support (iOS: widget shows summary metrics)
- Deep linking from notifications

### 7.3 Shared Design System

Both platforms consume the same:
- Color tokens (CSS custom properties / theme object)
- Typography scale
- Spacing constants
- Component API (props, behavior)

---

## 8. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Screen reader support | All actions card have `aria-label` / `accessibilityLabel` |
| Touch targets | ≥44px for all tappable elements |
| Contrast | All text meets WCAG AA (4.5:1 ratio) |
| Reduced motion | Respect `prefers-reduced-motion` |
| Focus management | Keyboard-navigable action cards, skip links |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Time to consume briefing | <30 seconds |
| Action approval rate | >60% of surfaced actions |
| Daily active usage | >80% of users open briefing daily |
| Notification-to-open rate | >40% |
| Onboarding completion | >70% |

---

## 10. Open Questions

- Should users be able to schedule a "mid-day check-in" (2nd briefing at 12 PM)?
- Should the app support shared/family briefings (e.g., shared calendar, joint account)?
- What granularity of module preferences do users want (per-category, per-severity)?
- Should actions support "do this automatically next time" (train agent preference)?

---

## 11. Appendix — Design Assets Needed

| Asset | Format | Qty |
|-------|--------|-----|
| App icon | PNG + SVG | 1 |
| Logo (horizontal) | SVG | 1 |
| Illustration: morning scene | SVG/Lottie | 1 |
| Illustration: empty state | SVG | 1–2 |
| Icon set (email, bank, calendar, alert) | SVG | 12–16 |
| Skeleton loading templates | Figma component | 3–4 |
