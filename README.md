# MD (MYDREAM) — A Birthday Sanctuary for Vijeta

> *"A beautiful personal digital world filled with love, memories, questions, letters and a private diary."*

A luxury, romantic, minimal, and responsive birthday website created exclusively for **Vijeta**.

---

## ✨ Design Aesthetic

- **Warm Ivory**: `#F8F1EB`
- **Dusty Rose**: `#D9A6A7`
- **Muted Burgundy**: `#9D626B`
- **Champagne Beige**: `#E9D7C5`
- **Deep Espresso**: `#302526`

**Typography**:
- **Headings**: *Cormorant Garamond* (Editorial Serif)
- **Body Text**: *DM Sans* (Clean, modern legibility)
- **Handwritten Elements**: *Caveat* (Intimate whispers & polaroid captions)

---

## 🌹 Website Chapters & Features

1. **Birthday Welcome / Hero Section**
   - Monogram emblem (`MD`) with ambient floating particles and romantic quotes.
   - Smooth navigation CTAs.

2. **Our Memories / Personal Photo Gallery**
   - Natural polaroid cards with organic rotational tilts (`-2.3°` to `+2.1°`).
   - Interactive zoom modal revealing the story and whispers behind each photo.
   - Dynamically updates as new photos are uploaded.

3. **MD's Favourite Memories**
   - Dedicated treasury: *"Some moments deserve to stay forever."*
   - Multi-photo carousels, attached video previews, date stamps, and favorite heart badges.

4. **A Special Birthday Letter**
   - Digital envelope sealed with an embossed **MD Wax Seal**.
   - Interactive seal breaking with an unfolding animation into warm textured parchment prose.

5. **Questions for MD (Interactive Questions)**
   - Curated romantic multiple-choice options and reflection prompts.
   - Live auto-save with a *"Saved with love ♡"* indicator.

6. **MD's Little Diary / Daily Thoughts Journal**
   - Private sanctuary gate with passcode authentication.
   - Post-unlock entry composer with mood tags (*Joyful*, *Cherished*, *Serene*, *Reflective*, *Dreamy*).

7. **A Final Birthday Surprise**
   - Interactive floating gift box with a champagne ribbon.
   - Celebration confetti shower in warm palette colors revealing a heartfelt birthday wish.

8. **Personal Content Management Dashboard**
   - Accessible via the "Manage Content" button.
   - Upload photographs and videos directly without modifying source code.
   - Edit captions, delete media, and review saved answers.

9. **Ambient Music Player**
   - Floating audio pill in the lower-right corner with play/pause animations and ambient melody streaming.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Motion & Effects**: Framer Motion, Canvas Confetti
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Storage, Auth, Row-Level Security)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🔒 Privacy & Security

- Strictly protected private diary and answers.
- Row Level Security (RLS) policies configured for Supabase tables and storage buckets.
- Passwords and service keys are never exposed in frontend code.
