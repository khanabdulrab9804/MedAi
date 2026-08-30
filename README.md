# MedAi

**MedAi** is a full-stack educational medicine information assistant. Users can search medicines and ask questions; answers are generated **only** from verified medicine data in your database using the Google Gemini API.

> **Disclaimer:** MedAi is not a replacement for professional medical advice. Always consult a doctor.

## Features

- Modern React + Tailwind chat UI (dark/light mode)
- Medicine search with filters and medicine cards
- Grounded AI responses (anti-hallucination prompts)
- Chat history per session
- Typing animation and loading states
- Voice input (Web Speech API)
- Markdown in assistant messages
- Admin panel to add/upload medicine data
- Recent searches, rate limiting, input sanitization

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| AI | Google Gemini API |

## Project Structure

```
MedAi/
├── frontend/          # React app
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
├── backend/           # Express API
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── utils/
├── database/          # Sample data & seed script
│   ├── sample-medicines.json
│   └── seed.js
└── docs/
    └── API.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Google Gemini API key](https://aistudio.google.com/apikey)

## Setup

### 1. Clone and install

```bash
cd MedAi
npm run install:all
```

### 2. Backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medai
GEMINI_API_KEY=your_gemini_api_key
ADMIN_SECRET=your_secure_admin_secret
CLIENT_URL=http://localhost:5173
```

### 3. Frontend environment (optional)

```bash
cp frontend/.env.example frontend/.env
```

Default uses Vite proxy to `http://localhost:5000`.

### 4. Start MongoDB

Ensure MongoDB is running locally, or use a cloud connection string in `MONGODB_URI`.

### 5. Seed sample medicines

```bash
npm run seed
```

### 6. Run the app

**Terminal 1 – backend:**

```bash
npm run dev:backend
```

**Terminal 2 – frontend:**

```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173)

Admin panel: [http://localhost:5173/admin](http://localhost:5173/admin) (use `ADMIN_SECRET`)

## Example Questions

- "Can I use Dolo 650 for fever?"
- "What are the side effects of Pan 40?"
- "How should I store Azithral 500?"

If a medicine is not in the database, the assistant replies:

> I do not have verified information about this medicine.

## AI Safety

- Low temperature (0.2) for consistent answers
- System prompt restricts answers to provided JSON only
- Medicine matching before calling Gemini
- Prompt-injection pattern detection
- No diagnosis or prescription language encouraged

## API Documentation

See [docs/API.md](docs/API.md) for full endpoint reference.

## Production Notes

- Use strong `ADMIN_SECRET` and HTTPS
- Replace simple admin header auth with JWT/OAuth
- Set `NODE_ENV=production` and restrict CORS `CLIENT_URL`
- Monitor Gemini usage and rate limits
- Keep medicine data medically reviewed by professionals

## License

Educational use. Not for clinical decision-making.
