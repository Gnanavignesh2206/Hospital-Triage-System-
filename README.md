# Hospital Triage System

A complete clinical triage assessment system for hospital patient intake. This standalone project routes patients to the correct doctors and appointment slots based on symptom analysis.

## Project Structure

```
Hospital-Triage-System/
├── server/
│   ├── models/
│   │   └── Triage.ts           # Data type definitions
│   ├── services/
│   │   └── triageService.ts    # Business logic & triage algorithm
│   ├── routes/
│   │   └── triage.ts           # API endpoints
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # Route registration
│   └── static.ts               # Static file serving
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── triage/
│   │   │       ├── PatientIntake.tsx    # Patient info form
│   │   │       ├── TriageForm.tsx       # Symptom form
│   │   │       └── TriageResult.tsx     # Assessment display
│   │   ├── lib/
│   │   │   └── services/
│   │   │       └── triageAPI.ts         # API client
│   │   ├── pages/
│   │   │   └── TriagePage.tsx           # Main page orchestrator
│   │   ├── types/
│   │   │   └── triage.ts                # TypeScript definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── App.css
│   └── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
└── script/
    └── build.ts
```

## Features

### Patient Triage Assessment
- **Multi-step intake process**: Patient info → Symptom description → Assessment results
- **Urgency levels**: CRITICAL, HIGH, MEDIUM, LOW with automatic escalation
- **Red flag detection**: Identifies dangerous symptoms requiring emergency care
- **Confidence scoring**: Estimates reliability of assessment

### Clinical Analysis
- **Body system mapping**: Identifies affected systems (cardiovascular, respiratory, etc.)
- **Severity scoring**: 1-10 scale based on symptom keywords
- **ICD-10 hints**: Provides diagnostic category hints (not diagnoses)
- **Duration extraction**: Parses symptom onset times from natural language

### Doctor Matching
- **Specialty routing**: Matches patients to appropriate specialties
- **Experience ranking**: Considers doctor experience years
- **Language support**: Matches patient language preferences
- **Telehealth availability**: Prefers telehealth for low-urgency cases
- **Real-time slot checking**: Confirms available appointment times

### Emergency Handling
- **ER redirect**: For CRITICAL/HIGH urgency cases
- **Ambulance alerts**: Triggers ambulance dispatch for CRITICAL cases
- **Emergency contacts**: Displays hospital ER and ambulance numbers

### Patient-Facing Features
- **Empathetic messaging**: Warm, professional communication
- **Self-care tips**: Guidance for MEDIUM/LOW urgency
- **Wait time estimates**: Sets expectations for appointment timing
- **Follow-up questions**: Requests clarification for ambiguous cases

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd Hospital-Triage-System

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Development

```bash
# Terminal 1: Start backend server (port 5000)
npm run dev

# Terminal 2: Start frontend dev server (port 5173)
npx vite
```

Visit http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### POST `/api/triage/assess`
Assess patient and return triage recommendation.

**Request:**
```json
{
  "patient_query": {
    "symptom_description": "severe chest pain and shortness of breath",
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

**Response:**
```json
{
  "success": true,
  "assessment": {
    "assessment_id": "triage_1234567890_abc123",
    "triage": {
      "urgency": "CRITICAL",
      "confidence": 0.95,
      "urgency_reason": "Immediate life-threatening condition requiring emergency evaluation",
      "red_flags": ["chest pain", "shortness of breath"],
      "er_redirect": true,
      "call_ambulance": true
    },
    "clinical": {
      "symptom_summary": "...",
      "body_systems_involved": ["cardiovascular", "respiratory"],
      "severity_score": 9,
      "icd10_hints": ["I10-I25", "J00-J99"]
    },
    "recommendation": {
      "recommended_doctor_id": "doc_001",
      "recommended_doctor_name": "Dr. Sarah Chen",
      "recommended_specialty": "emergency medicine",
      "recommended_slot": "2026-02-28T14:00:00Z"
    },
    "hospital_actions": {
      "notify_er": true,
      "display_er_number": "+1-800-911-1234",
      "display_ambulance_number": "+1-800-911-0911"
    }
  }
}
```

### GET `/api/triage/doctors`
Get list of available doctors.

### GET `/api/triage/slots/:doctorId`
Get available appointment slots for a doctor.

### GET `/api/triage/hospital-info`
Get hospital contact and hours information.

### POST `/api/triage/book-appointment`
Book an appointment after triage assessment.

## Triage Algorithm

### Urgency Determination

**CRITICAL** → If symptoms indicate immediate life threat:
- Chest pain or tightness
- Difficulty breathing / shortness of breath
- Loss of consciousness
- Severe bleeding
- Seizure / stroke
- Suicidal ideation
- Anaphylaxis
- HIGH-risk condition + chest/respiratory symptoms
- Anticoagulant use + bleeding
- Hypertension + sudden severe headache

**HIGH** → If serious symptoms needing ER within hours:
- Severe pain
- Persistent vomiting
- Confusion / disorientation
- Severe dizziness
- Vision changes
- Weakness / paralysis

**MEDIUM** → If needs same-day attention:
- Moderate pain
- Mild fever
- Sore throat
- Cough
- Rash
- Diarrhea

**LOW** → If mild/non-urgent:
- All other mild symptoms
- Administrative requests

### Age Modifiers
- Age < 5 or > 75: Escalates MEDIUM → HIGH or LOW → MEDIUM

### Doctor Matching Priority
1. Emergency Medicine (for CRITICAL/HIGH)
2. Specialty match based on body systems
3. Experience years (as tiebreaker)
4. Language preference match
5. Telehealth availability (for LOW urgency)
6. Available appointment slots

## Confidence Scoring

- **0.30-0.50**: Very low confidence (vague symptoms, needs clarification)
- **0.50-0.75**: Moderate confidence (some detail, follow-up recommended)
- **0.75-0.90**: High confidence (specific symptoms)
- **0.90-1.00**: Very high confidence (detailed, clear presentation)

**Confidence is increased by:**
- Longer symptom descriptions (+0.15 for >50 chars, +0.10 for >100 chars)
- Duration specified (+0.10)
- Severity self-reported (+0.05)
- Red flags detected (+0.10)

## Clinical Flags

The system automatically detects:
- **mental_health_concern**: Detects suicidal ideation, self-harm, depression, anxiety
- **pediatric_concern**: Flags cases with age < 18
- **chronic_condition_flare**: Identifies worsening of known conditions
- **medication_interaction_possible**: Flags 3+ concurrent medications
- **needs_follow_up_question**: Detects vague or unclear symptoms

## Extending the System

### Add New Specialties
Edit `specialtyMap` in `server/services/triageService.ts`:
```typescript
const specialtyMap: { [key: string]: string[] } = {
  oncology: ["oncology", "internal medicine"],
  rheumatology: ["rheumatology", "internal medicine"],
  // ... add more
};
```

### Add New Triage Keywords
Edit urgency keywords in `determineUrgency()` method:
```typescript
const criticalKeywords = [
  "chest pain",
  "new symptom", // ADD HERE
  // ...
];
```

### Connect to Real Database
Replace MOCK data in `server/routes/triage.ts`:
```typescript
// Instead of MOCK_DOCTORS:
const doctors = await db.getDoctors();

// Instead of MOCK_SLOTS:
const slots = await db.getAvailableSlots();

// Save assessment:
await db.saveTriageAssessment(assessment);
```

### Add Email Notifications
After booking appointment:
```typescript
await sendConfirmationEmail({
  to: patientEmail,
  doctorName: doctor.name,
  appointmentTime: slot.datetime,
});
```

## Type Definitions

### PatientMetadata
```typescript
interface PatientMetadata {
  age: number;
  sex: "M" | "F" | "Other";
  known_conditions: string[];
  current_medications: string[];
  language_preference?: string;
}
```

### PatientQuery
```typescript
interface PatientQuery {
  symptom_description: string;
  duration?: string;
  severity_self_reported?: number;
}
```

### TriageAssessment
```typescript
interface TriageAssessment {
  assessment_id: string;
  triage: { urgency, confidence, red_flags, ... };
  clinical: { symptom_summary, body_systems, severity_score, ... };
  recommendation: { doctor, specialty, slot, ... };
  patient_facing: { message, self_care, estimated_wait_tier, ... };
  flags: { mental_health, pediatric, chronic_flare, ... };
  hospital_actions: { notify_er, emergency_numbers, ... };
}
```

## Testing

### Test Case 1: CRITICAL Urgency
```
Age: 55
Symptoms: "severe chest pain and difficulty breathing for 30 minutes"
Severity: 9
Conditions: hypertension
Expected: CRITICAL, ER redirect, emergency numbers displayed
```

### Test Case 2: MEDIUM Urgency
```
Age: 32
Symptoms: "moderate headache and mild fever since yesterday"
Severity: 5
Expected: MEDIUM, doctor recommendation, same-day appointment
```

### Test Case 3: LOW Urgency
```
Age: 28
Symptoms: "sore throat and mild cough for 2 days"
Severity: 2
Expected: LOW, routine appointment, self-care tips
```

## Error Handling

- Missing required fields → 400 Bad Request
- No doctors available → 500 Internal Server Error
- No available slots → 500 Internal Server Error
- Network errors → Graceful fallback with error message

## Security Considerations

- ✓ Input validation on all endpoints
- ✓ HTML sanitization for symptom text
- ✓ Rate limiting (recommended for production)
- ✓ Assessment ID generation (unique per assessment)
- ⚠️ TODO: HIPAA compliance for patient data
- ⚠️ TODO: Data encryption at rest and in transit
- ⚠️ TODO: Authentication for admin endpoints

## Performance

- Triage assessment: < 200ms
- Doctor matching: O(n) where n = doctor count
- API response: < 500ms including network
- Frontend: Instant UI updates

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers: iOS Safari 14+, Chrome Android

## Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5000
CMD npm start
```

### Vercel/Netlify
Requires separating frontend and backend:
- Frontend: Deploy `client/dist` to Vercel
- Backend: Deploy to separate Node.js hosting (Heroku, Railway, etc.)

### AWS/Azure
Use provided build scripts:
```bash
npm run build
npm start
```

## Troubleshooting

**Port already in use:**
```bash
PORT=5001 npm run dev
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**CORS errors in production:**
Update `server/index.ts` to allow your frontend domain.

**Vite not finding modules:**
Verify `vite.config.ts` alias paths match your directory structure.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

## Support

For issues or questions:
- Check the troubleshooting section above
- Review API response error messages
- Check browser console for client-side errors
- Review server logs for backend errors

## Disclaimer

⚠️ **Medical Disclaimer**: This system is for triage assessment only and should never replace professional medical diagnosis or emergency services. For life-threatening situations, always call 911 or visit the nearest emergency room immediately.
