# Hospital Triage System - Step-by-Step Running Guide

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version
```

If not installed, download from https://nodejs.org/

---

## Step 1: Navigate to Project Directory

```bash
cd c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System
```

Or if using Windows PowerShell:
```powershell
cd "c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System"
```

---

## Step 2: Install Dependencies

This downloads all required packages from npm.

```bash
npm install
```

**Expected output:**
```
added XXX packages in XXs
```

**Note:** This may take 2-5 minutes on first install.

---

## Step 3: Start the Backend Server

Open a **new terminal/command prompt** at the project root and run:

```bash
npm run dev
```

**Expected output:**
```
[HH:MM:SS] [express] Hospital Triage System API running at http://localhost:5000
```

**Keep this terminal open** - the backend server must stay running.

---

## Step 4: Start the Frontend Development Server

Open a **second terminal/command prompt** at the project root and run:

```bash
npx vite
```

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 5: Open in Browser

Click or paste into your browser:
```
http://localhost:5173
```

You should see:
- **Title:** "Hospital Triage System"
- **Subtitle:** "Quick, accurate patient assessment and doctor routing"
- **Progress indicators:** 3 connected circles (Step 1, 2, 3)

---

## Using the Application

### Step 1: Patient Information (Form 1)
1. Enter **Age** (e.g., 35)
2. Select **Sex** (Male, Female, Other)
3. (Optional) Add **Medical Conditions** (comma-separated)
   - Example: `Hypertension, Diabetes`
4. (Optional) Add **Medications** (comma-separated)
   - Example: `Lisinopril, Metformin`
5. Select **Language** (English, Spanish, Mandarin, Hindi, Gujarati)
6. Click **"Next: Describe Symptoms"**

### Step 2: Symptom Description (Form 2)
1. Enter **Symptom Description** (detailed, required)
   - Example: `Severe chest pain and difficulty breathing for 30 minutes`
2. (Optional) Enter **Duration**
   - Example: `30 minutes ago` or `since yesterday`
3. Set **Severity** (1-10 slider)
   - 1 = minimal, 10 = worst possible
4. Click **"Get Triage Assessment"**

**The system now processes your input...**

### Step 3: Assessment Results (Results Page)
You'll see:

#### If CRITICAL/HIGH Urgency:
- 🚨 Red alert banner
- Emergency contact numbers (ER & Ambulance)
- Message to go to emergency room

#### If MEDIUM Urgency:
- Doctor recommendation with name & specialty
- Appointment time
- "Book This Appointment" button
- Self-care tips

#### If LOW Urgency:
- Routine doctor recommendation
- Appointment scheduling
- General self-care advice

**Additional Information Shown:**
- Triage urgency level (CRITICAL/HIGH/MEDIUM/LOW)
- Assessment confidence (%)
- Red flags detected
- Severity score (1-10)
- Body systems involved
- Clinical notes

---

## Test Cases to Try

### Test 1: CRITICAL Urgency
```
Age: 55
Sex: Male
Conditions: hypertension
Medications: lisinopril
Symptoms: severe chest pain and difficulty breathing for 30 minutes
Duration: 30 minutes
Severity: 9
```
**Expected Result:** CRITICAL urgency with ER redirect

### Test 2: MEDIUM Urgency
```
Age: 32
Sex: Female
Conditions: (empty)
Medications: (empty)
Symptoms: moderate headache and mild fever since yesterday
Duration: since yesterday
Severity: 5
```
**Expected Result:** MEDIUM urgency with doctor recommendation

### Test 3: LOW Urgency
```
Age: 28
Sex: Male
Conditions: (empty)
Medications: (empty)
Symptoms: sore throat and mild cough for 2 days
Duration: 2 days
Severity: 2
```
**Expected Result:** LOW urgency with routine appointment

---

## How to Stop Running

### Stop Backend (Terminal 1):
Press **Ctrl+C**

```
^C
```

### Stop Frontend (Terminal 2):
Press **Ctrl+C**

```
^C
```

---

## Troubleshooting

### Issue: "Port 5000 already in use"
**Solution:** Kill process or use different port
```bash
PORT=5001 npm run dev
```

Then update `vite.config.ts` proxy target:
```typescript
proxy: {
  "/api": {
    target: "http://localhost:5001",  // Changed to 5001
  },
}
```

### Issue: "Port 5173 already in use"
**Solution:** Use different port
```bash
npx vite --port 5174
```

### Issue: "Module not found" errors
**Solution:** Reinstall dependencies
```bash
rm -r node_modules
rm package-lock.json
npm install
```

### Issue: "Templates can't be found" when building
This is a dev-only vite issue. Works fine in development.

### Issue: Page shows blank white screen
1. Check browser console (F12) for errors
2. Verify backend is running: http://localhost:5000/api/triage/doctors
3. Check terminal output for error messages

### Issue: API calls failing
1. Verify backend terminal shows `running at http://localhost:5000`
2. Check vite.config.ts points to correct backend port
3. Look for CORS errors in browser console

---

## API Endpoints (For Testing)

You can test endpoints directly in browser or Postman:

### Get Doctors List
```
GET http://localhost:5000/api/triage/doctors
```

### Get Hospital Info
```
GET http://localhost:5000/api/triage/hospital-info
```

### Get Doctor Slots
```
GET http://localhost:5000/api/triage/slots/doc_001
```

### Assess Patient (POST)
```
POST http://localhost:5000/api/triage/assess

Body:
{
  "patient_query": {
    "symptom_description": "chest pain",
    "duration": "30 minutes",
    "severity_self_reported": 9
  },
  "patient_metadata": {
    "age": 55,
    "sex": "M",
    "known_conditions": ["hypertension"],
    "current_medications": ["lisinopril"],
    "language_preference": "English"
  }
}
```

---

## File Structure Reference

```
Hospital-Triage-System/
├── server/              ← Backend code
│   ├── index.ts        ← Server startup (PORT 5000)
│   ├── routes.ts       ← Route registration
│   └── routes/
│       └── triage.ts   ← Triage API endpoints
├── client/              ← Frontend code
│   ├── index.html      ← HTML entry point
│   ├── src/
│   │   ├── main.tsx    ← React entry
│   │   ├── App.tsx     ← Main component
│   │   └── pages/
│   │       └── TriagePage.tsx  ← Triage flow
├── package.json        ← Dependencies & scripts
├── vite.config.ts      ← Frontend config (PORT 5173)
└── tsconfig.json       ← TypeScript config
```

---

## Environment Setup (Optional)

Create `.env` file for custom configuration:

```bash
# Create file
echo > .env
```

Add content:
```
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

---

## Next Steps After Running

1. **Explore the code:**
   - `server/services/triageService.ts` - Main triage logic
   - `client/src/pages/TriagePage.tsx` - Frontend flow

2. **Modify mock data:**
   - `server/routes/triage.ts` - Add/remove doctors and slots

3. **Connect to database:**
   - Replace MOCK_DOCTORS with database query
   - Replace MOCK_SLOTS with real appointment system

4. **Deploy:**
   - Backend: Heroku, Railway, AWS, Azure
   - Frontend: Vercel, Netlify, AWS S3 + CloudFront

---

## Summary of Running Commands

| Task | Command | Terminal |
|------|---------|----------|
| Install dependencies | `npm install` | New |
| Start backend | `npm run dev` | Terminal 1 |
| Start frontend | `npx vite` | Terminal 2 |
| Open app | Visit `http://localhost:5173` | Browser |
| Stop backend | `Ctrl+C` | Terminal 1 |
| Stop frontend | `Ctrl+C` | Terminal 2 |

---

## Support

**Backend not responding?**
- Check Terminal 1 for error messages
- Verify port 5000 is open
- Check firewall settings

**Frontend not loading?**
- Check Terminal 2 for build errors
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console (F12)

**Assessment not working?**
- Verify symptom description is filled
- Verify age is a valid number
- Check browser console for errors
- Check backend terminal for API errors

---

That's it! You should now have the Hospital Triage System running locally!
