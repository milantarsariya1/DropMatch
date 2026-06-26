# B2B Dropshipper Matchmaker

A B2B matchmaking and analysis platform connecting **Shops** (listing products they have/want) and **Dropshippers** (entering sourcing intentions) using AI-generated tags and categories.

This is **NOT** an e-commerce store (no checkout, cart, or payment systems). It is purely a **discovery and analysis portal** powered by custom tagging overlaps and AI indexing.

---

## Tech Stack
* **Frontend**: React (Vite), React Router, Tailwind CSS, Lucide Icons
* **Backend**: Node.js, Express (designed for Vercel Serverless Functions)
* **Database**: PostgreSQL (Prisma ORM)
* **AI Integration**: Groq API (JSON format responses with automatic fallback heuristics)
* **Deployment**: Vercel

---

## Getting Started

### 1. Installation
Clone the repository and install the project dependencies:
```bash
npm install
```

### 2. Environment Configurations
Create a `.env` file in the root folder (or duplicate `.env.example`):
```env
DATABASE_URL="postgresql://username:password@hostname:5432/database?schema=public"
JWT_SECRET="generate-a-strong-jwt-secret-key"
GROQ_API_KEY="gsk_..."
```

*Note: If no `GROQ_API_KEY` is provided, the backend automatically falls back to static heuristic parsing so the application remains 100% functional for local tests and evaluations.*

### 3. Database Migration & Seeding
Push the database schema structures using Prisma and seed the system with mock profiles:
```bash
# Push structure to Postgres database
npx prisma db push

# Seed sample Shops & Dropshippers
npx prisma db seed
```

Default credentials seeded (password for all accounts is `password123`):
* **Shop**: `sarah@apexbottles.com` (Apex Bottle Co.)
* **Shop**: `alex@urbantech.com` (Urban Tech Accessories)
* **Shop**: `elena@greenwood.com` (Greenwood Organics)
* **Dropshipper**: `tyler@genzretail.com` (Gen-Z Sourcing)
* **Dropshipper**: `jane@greenretail.com` (Eco Sourcing)
* **Dropshipper**: `bob@vancedistributors.com` (Beverage Distributors)

### 4. Running Locally
Run the development environment. This boots the Vite frontend on port `5173` and the Express backend on port `3001` concurrently, with automatic API proxy configuration:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Matching Logic
Matches are computed dynamically:
1. **Shared Categories**: Map high-level alignment, weighted at **2 points** per overlap.
2. **Shared Tags**: Map keyword alignment, weighted at **1 point** per overlap.

$$\text{Match Score} = (\text{shared categories} \times 2) + \text{shared tags}$$

Matches are sorted in descending order of score. The UI displays the overlap details, scores, and provides a contact mailbox simulator for partnership inquiries.

---

## Deployment (Vercel)
Deploy this project to Vercel in a single command. 
1. Log in to Vercel (`npm i -g vercel` if needed, then `vercel login`).
2. Run deployment setup:
   ```bash
   vercel
   ```
3. Set your environment variables on Vercel Dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
4. The backend is configured as serverless routes inside `api/index.js`, mapped seamlessly under `vercel.json` alongside static web builds.
