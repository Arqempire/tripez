# TripEZ - Smart Travel Planner & Cloud Asset Ledger

**TripEZ** is a modern, responsive, serverless-first travel coordination platform designed to take the friction out of planning. TripEZ lets travelers generate AI-powered multi-day itineraries, upload travel vouchers to a secure cloud vault, keep track of multi-currency expenses, split group costs, and collaborate in real-time with travel companions.

---

## 🚀 Key Modules & Features

### 1. 🤖 AI Itinerary Planner
* **Tailored Generation**: Prompts the Gemini 2.5 Flash model to compile personalized multi-day trip routes, packing styles, and group sizing.
* **Auto-Extracted Tags**: Reads generated plans and dynamically maps the top 5 unique attractions as badges (`📍 Attraction`) above the plan description.
* **Important Detail Highlights**: Parsed text formatting intercepts markdown bold tags (`**item**`) to render high-contrast visual spans, making key times, restaurants, and sights pop instantly.
* **SaaS Action Bar**: Real-time status indicators (Emerald for saved, Amber pulse for unsaved edits), save/update hooks, and clear/reset commands.

### 2. 💼 Document Vault
* **Drag-and-Drop Uploader**: Client-side drag zone for travel PDFs, flight tickets, and hotel vouchers (size limits enforced at 1MB).
* **Supabase Storage Integration**: Attachments upload directly to secure cloud storage buckets with temporary download url resolutions.
* **Session Syncing**: File metadata (title, filename, timestamps, storage keys) is saved in Supabase profile metadata (`user_metadata.documents`), persisting lists across logouts and devices.

### 3. 📊 Expense Tracker & Exchange Converter
* **Budget Limits Meter**: Live spent indicator meters tracking spent values relative to budget limits.
* **Base Currency Toggle**: Switch display formats globally between **INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), CAD (C$), AUD (A$), AED (Dh), and SGD (S$)**.
* **Daily Exchange Rates**: Fetches daily global exchange rates from `open.er-api.com` with pre-seeded offline convert constants.
* **Syncing**: Automatically writes log updates, budget limits, and currency settings back to `user_metadata.expenses` / `user_metadata.budget`.

### 4. 👥 Collaboration Space
* **Active Trip Selection Switcher**: Header dropdown that switches context (notes, companions list, shared splits) dynamically between active trips.
* **Group Notes**: Shared rich textarea note logs synced to Supabase.
* **Cost Splitter Timeline**: Log shared expense items, showing total costs, splitting transactions, and logging who paid for what.
* **Syncing**: Group details, companions, and split ledgers are synced to `user_metadata.collab` (indexed by `tripId`).

### 5. 📍 Location Selection
* **3-Tier Dropdowns**: Symmetrical Country ➔ State ➔ Place recommendation selectors.
* **Custom Fallbacks**: "Other / Custom..." selector flags display custom text inputs immediately without disabling or clearing parental country dropdowns.
* **195 Country support**: Pre-seeded database options covering all sovereign states.

---

## 🛠️ Technology Stack

* **Frontend Framework**: Next.js App Router (React 18)
* **Styling**: Tailwind CSS v4 (with component styles configured inside [globals.css](file:///Users/arq/TripEZ/tripez/src/app/globals.css))
* **Database & Auth**: Supabase PostgreSQL database & JWT User Sessions
* **Cloud Storage**: Supabase Storage Buckets
* **AI Processing**: Gemini 2.5 Flash API (via Node.js SDK)

---

## 📂 Project Architecture

```text
tripez/
├── src/
│   ├── app/                    # Next.js App Router modules
│   │   ├── api/itinerary/      # Serverless AI generator route
│   │   ├── dashboard/          # Trips overview, forms, deletion prompts
│   │   ├── documents/          # Attachment vaults
│   │   ├── expenses/           # Financial logs & currency converter
│   │   ├── trip-collab/        # Shared cost splitter & notes
│   │   ├── globals.css         # Styling system tokens
│   │   ├── layout.js           # Core layout configuration
│   │   └── page.js             # Welcome / onboarding panel
│   └── lib/supabase/
│       └── client.js           # Initialized browser client connection
└── README.md
```

---

## 🗄️ Database Schema Blueprint

### Relational Table: `trips`
Primary records table stored in Supabase PostgreSQL:

| Column Name | Data Type | Key Type | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key** | Unique trip identifier |
| `user_id` | `uuid` | **Foreign Key** | References auth user record |
| `name` | `string` | | Custom name of the trip |
| `destination` | `string` | | Format: "Country, State, Place" |
| `dates` | `string` | | Format: "Duration days starting StartDate" |
| `travelers` | `integer` | | Count of travelers |
| `interests` | `string` | | Interests tag string |
| `image` | `string` | | Cover photo URL (deterministic CDN catalog) |
| `gallery` | `string[]` | | Array of 3 matching detail images |
| `itinerary` | `jsonb` | | Generated multi-day itinerary JSON |
| `created_at` | `timestamp` | | Timestamp of creation |

### User Profile Metadata (`user_metadata`)
Cloud-synced schema stored in Supabase Auth user profiles:

```json
{
  "documents": [
    { "title": "Flight Ticket", "fileName": "ticket.pdf", "fileUrl": "...", "storagePath": "..." }
  ],
  "expenses": [
    { "title": "Sushi Dinner", "amount": 45, "category": "Food", "note": "Shared", "created_at": "..." }
  ],
  "budget": "1200",
  "currency": "USD",
  "collab": {
    "tripId_123": {
      "notes": "Flight lands at 10 AM...",
      "members": ["companion@email.com"],
      "expenses": [
        { "description": "Shikara Ride", "amount": 1200, "paidBy": "Companion" }
      ]
    }
  }
}
```

---

## ⚙️ Environment Variables Config

Create a `.env.local` file in the root of the project and populate it with your Supabase and Gemini access credentials:

```env
# Supabase Browser Connection Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI Endpoint Access Key
GEMINI_API_KEY=AIzaSyA...
```

---

## 💿 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/tripez.git
   cd tripez
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment variables**:
   Duplicate `.env.local` and configure your API tokens.

4. **Launch Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🎨 Visual System Documentation
For system diagrams, ER schemas, folder structures, and high-fidelity desktop wireframe layouts, refer to the developer blueprints located in the project artifacts directory:
* **Vector Slide Deck**: `trip_ez_system_blueprint.pptx`
* **Layout Handoff HTML**: `trip_ez_system_blueprint.html` (print-ready for PDF exports)
