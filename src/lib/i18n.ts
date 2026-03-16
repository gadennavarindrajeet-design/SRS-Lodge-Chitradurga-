import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "rooms": "Rooms",
      "reports": "Reports",
      "staff": "Staff",
      "housekeeping": "Housekeeping",
      "maintenance": "Maintenance",
      "calendar": "Calendar",
      "ai_assistant": "AI Assistant",
      "search": "Search",
      "bookings": "Bookings",
      "available": "Available",
      "occupied": "Occupied",
      "cleaning": "Cleaning",
      "maintenance_status": "Maintenance",
      "check_in": "Check-In",
      "check_out": "Check-Out",
      "guest_name": "Guest Name",
      "phone": "Phone",
      "aadhaar": "Aadhaar",
      "address": "Address",
      "advance": "Advance",
      "total": "Total",
      "balance": "Balance",
      "invoice": "Invoice",
      "download": "Download",
      "police_register": "Police Register",
      "export_excel": "Export Excel",
      "export_pdf": "Export PDF",
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "rooms": "कमरे",
      "reports": "रिपोर्ट",
      "staff": "कर्मचारी",
      "housekeeping": "हाउसकीपिंग",
      "maintenance": "रखरखाव",
      "calendar": "कैलेंडर",
      "ai_assistant": "AI सहायक",
      "search": "खोजें",
      "bookings": "बुकिंग",
      "available": "उपलब्ध",
      "occupied": "भरा हुआ",
      "cleaning": "सफाई",
      "maintenance_status": "रखरखाव",
      "check_in": "चेक-इन",
      "check_out": "चेक-आउट",
      "guest_name": "अतिथि का नाम",
      "phone": "फ़ोन",
      "aadhaar": "आधार",
      "address": "पता",
      "advance": "अग्रिम",
      "total": "कुल",
      "balance": "शेष",
      "invoice": "चालान",
      "download": "डाउनलोड",
      "police_register": "पुलिस रजिस्टर",
      "export_excel": "एक्सेल निर्यात",
      "export_pdf": "PDF निर्यात",
    }
  },
  kn: {
    translation: {
      "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "rooms": "ಕೊಠಡಿಗಳು",
      "reports": "ವರದಿಗಳು",
      "staff": "ಸಿಬ್ಬಂದಿ",
      "housekeeping": "ಹೌಸ್‌ಕೀಪಿಂಗ್",
      "maintenance": "ನಿರ್ವಹಣೆ",
      "calendar": "ಕ್ಯಾಲೆಂಡರ್",
      "ai_assistant": "AI ಸಹಾಯಕ",
      "search": "ಹುಡುಕಿ",
      "bookings": "ಬುಕಿಂಗ್‌ಗಳು",
      "available": "ಲಭ್ಯವಿದೆ",
      "occupied": "ಭರ್ತಿಯಾಗಿದೆ",
      "cleaning": "ಶುಚಿಗೊಳಿಸುವಿಕೆ",
      "maintenance_status": "ನಿರ್ವಹಣೆ",
      "check_in": "ಚೆಕ್-ಇನ್",
      "check_out": "ಚೆಕ್-ಔಟ್",
      "guest_name": "ಅತಿಥಿ ಹೆಸರು",
      "phone": "ಫೋನ್",
      "aadhaar": "ಆಧಾರ್",
      "address": "ವಿಳಾಸ",
      "advance": "ಮುಂಗಡ",
      "total": "ಒಟ್ಟು",
      "balance": "ಬಾಕಿ",
      "invoice": "ಇನ್ವಾಯ್ಸ್",
      "download": "ಡೌನ್‌ಲೋಡ್",
      "police_register": "ಪೊಲೀಸ್ ರಿಜಿಸ್ಟರ್",
      "export_excel": "ಎಕ್ಸೆಲ್ ರಫ್ತು",
      "export_pdf": "PDF ರಫ್ತು",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
