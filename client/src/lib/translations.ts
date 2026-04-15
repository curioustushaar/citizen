export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Nav & Sidebar
    dashboard: "My Dashboard",
    commandCenter: "Command Center",
    submitComplaint: "Submit Complaint",
    myComplaints: "My Complaints",
    nearbyIssues: "Nearby Issues",
    analytics: "Analytics",
    logout: "Logout",
    login: "Login",
    profile: "My Profile",
    list: "List",
    map: "Map",

    // Dashboard
    liveIntelligence: "Live Intelligence Command",
    connected: "Connected",
    total: "Total",
    pending: "Pending",
    resolved: "Resolved",
    escalated: "Escalated",
    reportIssue: "Report Issue",
    aiBacked: "AI-backed grievance filing.",
    file: "File",
    trackAll: "Track All",
    liveActivity: "Live Activity Feed",
    noActiveGrievances: "No active grievances",
    viewFullHistory: "View full tracking feed",
    loginPrompt: "Login to Access Dashboard",
    loginDesc: "Sign in to view your personal grievance dashboard and track your complaints.",
    welcomeBack: "Welcome back",
    createAccount: "Create Account",
    signInToDashboard: "Sign In to Dashboard",
    noAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    registerHere: "Register here",

    // Profile
    identityDetails: "Identity Details",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    dob: "Date of Birth",
    gender: "Gender",
    bio: "Brief Bio",
    residentialDetails: "Residential Details",
    address: "Address",
    city: "City",
    state: "State",
    zipCode: "Zip Code",
    saveChanges: "Save Changes",

    // New Complaint
    fileGrievance: "File a Grievance",
    describeIssue: "Describe the Issue",
    exactLocation: "Exact Location",
    category: "Category",
    photoEvidence: "Photo Evidence",
    voiceNote: "Voice Note",
    submit: "Submit Complaint"
  },
  hi: {
    // Nav & Sidebar
    dashboard: "मेरा डैशबोर्ड",
    commandCenter: "कमांड सेंटर",
    submitComplaint: "शिकायत दर्ज करें",
    myComplaints: "मेरी शिकायतें",
    nearbyIssues: "आस-पास की समस्याएँ",
    analytics: "एनालिटिक्स",
    logout: "लॉगआउट",
    login: "लॉगिन",
    profile: "मेरी रूपरेखा",
    list: "सूची",
    map: "नक्शा",

    // Dashboard
    liveIntelligence: "लाइव इंटेलिजेंस कमांड",
    connected: "जुड़े हुए",
    total: "कुल",
    pending: "लंबित",
    resolved: "समाधान",
    escalated: "बढ़ी हुई",
    reportIssue: "समस्या दर्ज करें",
    aiBacked: "AI-आधारित शिकायत फाइलिंग।",
    file: "दर्ज करें",
    trackAll: "ट्रैक करें",
    liveActivity: "लाइव गतिविधि फ़ीड",
    noActiveGrievances: "कोई सक्रिय शिकायत नहीं",
    viewFullHistory: "पूर्ण ट्रैकिंग फ़ीड देखें",
    loginPrompt: "डैशबोर्ड तक पहुँचने के लिए लॉगिन करें",
    loginDesc: "अपने व्यक्तिगत शिकायत डैशबोर्ड को देखने और अपनी शिकायतों को ट्रैक करने के लिए साइन इन करें।",
    welcomeBack: "वापसी पर स्वागत है",
    createAccount: "खाता बनाएँ",
    signInToDashboard: "डैशबोर्ड में साइन इन करें",
    noAccount: "क्या आपका खाता नहीं है?",
    alreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
    registerHere: "यहाँ पंजीकरण करें",

    // Profile
    identityDetails: "पहचान विवरण",
    fullName: "पूरा नाम",
    phoneNumber: "फ़ोन नंबर",
    dob: "जन्म तिथि",
    gender: "लिंग",
    bio: "संक्षिप्त विवरण",
    residentialDetails: "आवासीय विवरण",
    address: "पता",
    city: "शहर",
    state: "राज्य",
    zipCode: "पिन कोड",
    saveChanges: "बदलाव सहेजें",

    // New Complaint
    fileGrievance: "शिकायत दर्ज करें",
    describeIssue: "समस्या का वर्णन करें",
    exactLocation: "सटीक स्थान",
    category: "श्रेणी",
    photoEvidence: "फोटो साक्ष्य",
    voiceNote: "वॉइस नोट",
    submit: "शिकायत भेजें"
  }
};

export type TranslationKey = keyof typeof translations.en;
