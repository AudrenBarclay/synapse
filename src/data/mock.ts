import type {
  Conversation,
  DoctorProfile,
  Message,
  Opportunity,
  StudentProfile
} from "@/types";

const ATL = {
  city: "Atlanta",
  state: "GA",
  coordinates: { lat: 33.749, lng: -84.388 }
};

export const students: StudentProfile[] = [
  {
    id: "s-001",
    role: "student",
    name: "Audrey Kim",
    profilePicture: null,
    headline: "Pre‑Med Student · Biology @ Georgia Tech",
    year: "Junior",
    major: "Biology",
    medicalInterest: "Cardiology & preventive health",
    shadowingHours: 42,
    clinicalHours: 180,
    volunteerHours: 95,
    researchExperience:
      "Undergraduate RA in cardiovascular imaging lab; poster presented at campus symposium.",
    bio:
      "I’m a pre‑med student focused on compassionate, evidence‑based care. I’m seeking structured shadowing experiences and mentorship to better understand clinical workflows and patient communication.",
    location: {
      ...ATL,
      neighborhood: "Midtown"
    },
    interests: ["Cardiology", "Health equity", "Patient education", "Public health"],
    skills: ["Leadership", "EMR basics", "Teamwork", "Research", "Spanish (conversational)"],
    savedDoctors: ["d-101", "d-103"]
  },
  {
    id: "s-002",
    role: "student",
    name: "Noah Bennett",
    profilePicture: null,
    headline: "Pre‑Med Student · Neuroscience @ Emory",
    year: "Senior",
    major: "Neuroscience",
    medicalInterest: "Neurology & clinical research",
    shadowingHours: 65,
    clinicalHours: 220,
    volunteerHours: 70,
    researchExperience:
      "Clinical research assistant on stroke outcomes study; data collection and literature review.",
    bio:
      "Interested in neuro care and research translation. Looking for shadowing in neurology or ED to deepen clinical exposure.",
    location: {
      ...ATL,
      neighborhood: "Decatur"
    },
    interests: ["Neurology", "Emergency medicine", "Clinical research", "Stroke care"],
    skills: ["Data analysis", "Communication", "Critical thinking", "Statistics"],
    savedDoctors: ["d-102"]
  }
];

export const doctors: DoctorProfile[] = [
  {
    id: "d-101",
    role: "doctor",
    name: "Dr. Maya Patel",
    profilePicture: null,
    specialty: "Cardiology",
    organization: "Emory Midtown",
    headline: "Cardiologist · Preventive Cardiology",
    bio:
      "I focus on preventive cardiology and long-term heart health. I’m open to shadowing requests that are structured, respectful of clinic flow, and aligned with patient privacy standards.",
    location: {
      ...ATL,
      neighborhood: "Midtown"
    },
    availableForShadowing: true,
    availabilityStatus: "available",
    meetingSlots: [
      {
        id: "ms-101",
        startIso: "2026-04-02T14:00:00.000-04:00",
        endIso: "2026-04-02T14:20:00.000-04:00"
      },
      {
        id: "ms-102",
        startIso: "2026-04-03T09:30:00.000-04:00",
        endIso: "2026-04-03T09:50:00.000-04:00"
      },
      {
        id: "ms-103",
        startIso: "2026-04-04T11:00:00.000-04:00",
        endIso: "2026-04-04T11:20:00.000-04:00",
        isBooked: true
      }
    ],
    interests: ["Preventive care", "Patient education", "Health equity"],
    areasOfFocus: ["Hypertension", "Heart failure", "Risk reduction"]
  },
  {
    id: "d-102",
    role: "doctor",
    name: "Dr. James Chen",
    profilePicture: null,
    specialty: "Emergency Medicine",
    organization: "Grady Memorial Hospital",
    headline: "ED Physician · Trauma & Acute Care",
    bio:
      "Emergency medicine is fast, team-based, and deeply human. I can support limited shadowing windows with clear expectations.",
    location: {
      ...ATL,
      neighborhood: "Downtown"
    },
    availableForShadowing: true,
    availabilityStatus: "limited",
    meetingSlots: [
      {
        id: "ms-201",
        startIso: "2026-04-01T17:00:00.000-04:00",
        endIso: "2026-04-01T17:20:00.000-04:00"
      },
      {
        id: "ms-202",
        startIso: "2026-04-05T10:00:00.000-04:00",
        endIso: "2026-04-05T10:20:00.000-04:00"
      }
    ],
    interests: ["Trauma", "Teaching", "Systems improvement"],
    areasOfFocus: ["Triage", "Acute care", "Team leadership"]
  },
  {
    id: "d-103",
    role: "doctor",
    name: "Dr. Sofia Ramirez",
    profilePicture: null,
    specialty: "Pediatrics",
    organization: "Children’s Healthcare of Atlanta",
    headline: "Pediatrician · Primary Care",
    bio:
      "I love mentoring students who are thoughtful, prepared, and kind. We’ll focus on communication, clinic operations, and continuity of care.",
    location: {
      ...ATL,
      neighborhood: "Buckhead"
    },
    availableForShadowing: false,
    availabilityStatus: "not_available",
    meetingSlots: [
      {
        id: "ms-301",
        startIso: "2026-04-06T12:00:00.000-04:00",
        endIso: "2026-04-06T12:20:00.000-04:00",
        isBooked: true
      }
    ],
    interests: ["Child wellness", "Family education", "Preventive care"],
    areasOfFocus: ["Well visits", "Vaccination", "Adolescent health"]
  }
];

export const opportunities: Opportunity[] = [
  {
    id: "o-901",
    doctorId: "d-101",
    doctorName: "Dr. Maya Patel",
    specialty: "Cardiology",
    locationLabel: "Midtown, Atlanta",
    distanceMiles: 2.4,
    available: true,
    description:
      "Clinic shadowing (half-day). Observe patient intake, risk counseling, and care coordination.",
    coordinates: { lat: 33.783, lng: -84.383 }
  },
  {
    id: "o-902",
    doctorId: "d-102",
    doctorName: "Dr. James Chen",
    specialty: "Emergency Medicine",
    locationLabel: "Downtown, Atlanta",
    distanceMiles: 4.9,
    available: true,
    description:
      "ED observation (evening). Focus on triage flow, team roles, and patient communication.",
    coordinates: { lat: 33.754, lng: -84.39 }
  },
  {
    id: "o-903",
    doctorId: "d-103",
    doctorName: "Dr. Sofia Ramirez",
    specialty: "Pediatrics",
    locationLabel: "Buckhead, Atlanta",
    distanceMiles: 6.7,
    available: false,
    description:
      "Primary care pediatrics (currently paused). Join waitlist for future openings.",
    coordinates: { lat: 33.848, lng: -84.373 }
  }
];

export const conversations: Conversation[] = [
  {
    id: "c-001",
    participants: [
      {
        id: "s-001",
        role: "student",
        name: "Audrey Kim",
        avatar: null,
        subtitle: "Biology · Georgia Tech"
      },
      {
        id: "d-101",
        role: "doctor",
        name: "Dr. Maya Patel",
        avatar: null,
        subtitle: "Cardiology · Emory Midtown"
      }
    ],
    lastMessagePreview: "Thanks for reaching out—happy to share expectations.",
    lastMessageAtIso: "2026-03-23T16:18:00.000-04:00",
    unreadCount: 1
  },
  {
    id: "c-002",
    participants: [
      {
        id: "s-001",
        role: "student",
        name: "Audrey Kim",
        avatar: null,
        subtitle: "Biology · Georgia Tech"
      },
      {
        id: "d-102",
        role: "doctor",
        name: "Dr. James Chen",
        avatar: null,
        subtitle: "Emergency Medicine · Grady"
      }
    ],
    lastMessagePreview: "I’m available for a quick intro call this week.",
    lastMessageAtIso: "2026-03-22T10:02:00.000-04:00",
    unreadCount: 0
  }
];

export const messages: Message[] = [
  {
    id: "m-001",
    conversationId: "c-001",
    senderId: "s-001",
    senderRole: "student",
    body:
      "Hi Dr. Patel — I’m a pre‑med student in Midtown interested in preventive cardiology. Would you be open to a short intro call to discuss shadowing expectations?",
    sentAtIso: "2026-03-23T15:40:00.000-04:00",
    status: "read"
  },
  {
    id: "m-002",
    conversationId: "c-001",
    senderId: "d-101",
    senderRole: "doctor",
    body:
      "Thanks for reaching out. Yes — I’m open to a brief intro. Please review privacy expectations and bring 2–3 specific learning goals.",
    sentAtIso: "2026-03-23T16:18:00.000-04:00",
    status: "delivered"
  },
  {
    id: "m-003",
    conversationId: "c-002",
    senderId: "s-001",
    senderRole: "student",
    body:
      "Hi Dr. Chen — I’m exploring emergency medicine exposure. Do you have any structured shadowing windows coming up?",
    sentAtIso: "2026-03-22T09:42:00.000-04:00",
    status: "read"
  },
  {
    id: "m-004",
    conversationId: "c-002",
    senderId: "d-102",
    senderRole: "doctor",
    body:
      "Possibly limited. I’m available for a quick intro call this week — we can discuss what’s realistic and safe for the department.",
    sentAtIso: "2026-03-22T10:02:00.000-04:00",
    status: "read"
  }
];

