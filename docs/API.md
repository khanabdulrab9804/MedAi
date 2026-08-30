# MedAi API Documentation

Base URL: `http://localhost:5000/api`

All JSON responses follow:

```json
{ "success": true, "data": {} }
```

Errors:

```json
{ "success": false, "message": "Error description" }
```

---

## Health

### `GET /health`

Check API status.

**Response**

```json
{ "success": true, "message": "MedAi API is running" }
```

---

## Chat

### `POST /chat`

Grounded medicine Q&A using Gemini and verified database records.

**Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User question (max 2000 chars) |
| `sessionId` | string | No | Existing session ID for history |
| `medicineId` | string | No | MongoDB ID to focus on one medicine |

**Example**

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Can I use Dolo 650 for fever?"}'
```

**Response**

```json
{
  "success": true,
  "data": {
    "reply": "Dolo 650 is commonly used for fever...",
    "sessionId": "sess_...",
    "medicines": [{ "id": "...", "name": "Dolo 650", "generic_name": "Paracetamol" }]
  }
}
```

**Notes**

- If no matching medicine is found, `reply` is: `I do not have verified information about this medicine.`
- Rate limit: 20 requests/minute on `/api/chat`
- Prompt injection patterns are blocked with `400`

### `GET /chat/history/:sessionId`

Retrieve messages for a session.

**Response**

```json
{
  "success": true,
  "data": {
    "messages": [
      { "role": "user", "content": "...", "medicineRef": "Dolo 650" },
      { "role": "assistant", "content": "..." }
    ]
  }
}
```

---

## Medicines

### `GET /medicines`

Search medicines with optional filters.

**Query params**

| Param | Description |
|-------|-------------|
| `q` | Search text (name, generic, uses) |
| `generic` | Filter by generic name |
| `manufacturer` | Filter by manufacturer |

**Example**

```bash
curl "http://localhost:5000/api/medicines?q=dolo"
```

### `GET /medicines/all`

List all medicines (sorted by name).

### `GET /medicines/:id`

Get one medicine by MongoDB ID.

---

## Admin

All admin routes require header:

```
X-Admin-Secret: <ADMIN_SECRET from .env>
```

### `GET /admin/medicines`

List all medicines.

### `POST /admin/medicines`

Create a medicine.

**Body** (example)

```json
{
  "name": "Dolo 650",
  "generic_name": "Paracetamol",
  "uses": ["Fever", "Body pain"],
  "dosage": "Take only as prescribed by a doctor.",
  "side_effects": ["Nausea"],
  "warnings": ["Do not exceed dose"],
  "interactions": ["Alcohol"],
  "manufacturer": "Micro Labs",
  "storage": "Cool, dry place"
}
```

### `PUT /admin/medicines/:id`

Update a medicine.

### `DELETE /admin/medicines/:id`

Delete a medicine.

### `POST /admin/medicines/upload`

Bulk upload JSON file (`multipart/form-data`, field: `file`).

Accepts an array or `{ "medicines": [...] }`.

---

## Rate Limits

| Scope | Default |
|-------|---------|
| All `/api/*` | 100 requests / 15 min |
| `/api/chat` | 20 requests / min |

Configure via `RATE_LIMIT_*` env variables.
