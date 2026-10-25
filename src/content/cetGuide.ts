// Static study content for Rajasthan CET 12th Level, shared by /guide and the
// landing FAQ. Pattern numbers mirror backend/src/scripts/updateCet12Official2026.script.js
// — update both together when RSSB publishes a new notification.

export const CET_PATTERN = {
  examName: "Rajasthan CET 12th Level (Senior Secondary)",
  conductedBy: "Rajasthan Staff Selection Board (RSSB)",
  totalQuestions: 120,
  totalMarks: 240,
  marksPerQuestion: 2,
  durationMinutes: 150,
  negativeMarking: "1/3",
  qualifyingPercent: 40,
  blankDisqualifyPercent: 10,
  officialSite: "https://rssb.rajasthan.gov.in",
} as const;

export const CET_STATS = [
  { value: "120", label: "Questions" },
  { value: "240", label: "Marks" },
  { value: "2½ hr", label: "Duration" },
  { value: "−1/3", label: "Per wrong answer" },
  { value: "40%", label: "To qualify" },
  { value: "A–E", label: "5 options" },
];

/** 13 official subjects (RSSB 2026 notification). */
export const CET_SUBJECTS: { name: string; en: string; questions: number; tip: string }[] = [
  { name: "राजस्थान का इतिहास", en: "History of Rajasthan", questions: 10, tip: "Dynasties, forts, freedom movement & integration of Rajasthan." },
  { name: "राजस्थान की कला और संस्कृति", en: "Art & Culture of Rajasthan", questions: 10, tip: "Folk deities, fairs, painting schools, dances & handicrafts." },
  { name: "भारत का भूगोल", en: "Geography of India", questions: 10, tip: "Physiography, rivers, climate, soils and crops — learn with maps." },
  { name: "राजस्थान का भूगोल", en: "Geography of Rajasthan", questions: 9, tip: "Districts, Aravalli, lakes, canals, minerals and energy." },
  { name: "राजस्थान के विशेष संदर्भ में भारतीय राजनीतिक व्यवस्था", en: "Polity (Rajasthan focus)", questions: 9, tip: "Constitution basics + Governor, CM, RPSC, panchayati raj in Rajasthan." },
  { name: "राजस्थान की अर्थव्यवस्था", en: "Economy of Rajasthan", questions: 9, tip: "Budget highlights, flagship schemes, agriculture & industry data." },
  { name: "सामान्य विज्ञान", en: "General Science", questions: 9, tip: "Class 6–10 NCERT physics, chemistry and biology concepts." },
  { name: "तर्कशक्ति और गणित", en: "Reasoning & Maths", questions: 9, tip: "Percent, ratio, average, series, coding and blood relations." },
  { name: "समसामयिक मामले", en: "Current Affairs", questions: 9, tip: "Last 6–12 months — Rajasthan news first, then national." },
  { name: "जन स्वास्थ्य", en: "Public Health", questions: 9, tip: "Nutrition, diseases, vaccination and government health schemes." },
  { name: "कंप्यूटर का बुनियादी ज्ञान", en: "Basic Computer Knowledge", questions: 9, tip: "Hardware, MS Office, internet, shortcuts and e-governance." },
  { name: "सामान्य हिंदी", en: "General Hindi", questions: 9, tip: "संधि, समास, पर्यायवाची, विलोम, मुहावरे और वाक्य शुद्धि।" },
  { name: "सामान्य अंग्रेजी", en: "General English", questions: 9, tip: "Tenses, voice, narration, synonyms/antonyms and error spotting." },
];

export const STUDY_PLAN: { week: string; title: string; points: string[] }[] = [
  {
    week: "Week 1",
    title: "Know the paper",
    points: [
      "Solve one official old paper untimed — just to see what is asked.",
      "Mark your 3 weakest and 3 strongest subjects from that paper.",
      "Start a daily streak: 20 mixed questions every day, no breaks.",
    ],
  },
  {
    week: "Week 2",
    title: "Rajasthan core",
    points: [
      "History, Art & Culture and Geography of Rajasthan = 29 questions together.",
      "One topic quiz per subject daily; re-attempt anything below 60%.",
      "Ask the AI Tutor about every wrong answer until you can explain it yourself.",
    ],
  },
  {
    week: "Week 3",
    title: "Scoring subjects",
    points: [
      "Hindi, English, Computer and Reasoning reward practice, not memory.",
      "Take topic quizzes in timed mode — aim for under 1 min 15 s per question.",
      "Read Rajasthan current affairs for 20 minutes every day.",
    ],
  },
  {
    week: "Week 4",
    title: "Full mocks",
    points: [
      "Three full mocks this week, in exam timing (150 minutes, no pauses).",
      "After each mock, spend as long reviewing as you spent writing it.",
      "Practise marking option E for guesses you are unsure about.",
    ],
  },
];

export const EXAM_DAY_TIPS = [
  "First pass: answer everything you are sure of. Don't get stuck — 120 questions in 150 minutes leaves about 75 seconds each.",
  "Second pass: attempt questions where you can eliminate two or more options.",
  "For anything still unclear, darken option E. It carries no negative marking.",
  "Never leave all five bubbles empty — a fully blank question costs 1/3 marks, and leaving more than 10% blank disqualifies you.",
  "Keep the last 10 minutes to check that every question has exactly one bubble filled.",
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Is ExamSaathi free?",
    a: "Yes. Daily streaks, topic quizzes, mocks, official old papers, leaderboards and the AI Tutor are free for every student.",
  },
  {
    q: "What is the CET 12th Level exam pattern in 2026?",
    a: "120 objective questions for 240 marks in 2 hours 30 minutes, from 13 subjects. Each wrong answer costs 1/3 of the question's marks, and you need 40% to qualify.",
  },
  {
    q: "What is option E and when should I use it?",
    a: "Every question has a fifth option, E (\"question not attempted\"). Mark E when you don't want to answer — it has no negative marking. Leaving all five options blank costs 1/3 marks, and leaving more than 10% of questions blank leads to disqualification.",
  },
  {
    q: "Does ExamSaathi follow the option E rule?",
    a: "Yes. In our mocks, choosing E gives zero marks with no penalty, a fully blank question is penalised like the real exam, and your result warns you if you cross the 10% blank limit.",
  },
  {
    q: "Can I study in Hindi?",
    a: "Yes. Questions follow the exam's language (Hindi for most subjects, English for General English), and the AI Tutor replies in Hindi, English or Hinglish — whichever you ask in.",
  },
  {
    q: "Where do the questions come from?",
    a: "A shared bank built from official previous papers and AI-generated practice questions organised by the official syllabus topics. Every student's generated questions grow the bank for everyone.",
  },
  {
    q: "How do I use it on my phone?",
    a: "Open the site in your phone browser and use \"Add to Home screen\". Quizzes are built for one-handed use, with a question palette and large answer buttons.",
  },
];
