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
      "bookings": "Bookings",
      "ai_assistant": "AI Assistant",
      "revenue_forecast": "Revenue Forecast",
      "occupancy_forecast": "Occupancy Forecast",
      "gst_invoice": "GST Invoice",
      "check_in": "Check-In",
      "check_out": "Check-Out",
      "available": "Available",
      "occupied": "Occupied",
      "cleaning": "Cleaning",
      "maintenance_req": "Maintenance Required",
      "calendar": "Calendar",
      "agents": "Agents",
      "search": "Search"
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
      "bookings": "बुकिंग",
      "ai_assistant": "एआई सहायक",
      "revenue_forecast": "राजस्व पूर्वानुमान",
      "occupancy_forecast": "अधिभोग पूर्वानुमान",
      "gst_invoice": "जीएसटी चालान",
      "check_in": "चेक-इन",
      "check_out": "चेक-आउट",
      "available": "उपलब्ध",
      "occupied": "भरा हुआ",
      "cleaning": "सफाई",
      "maintenance_req": "रखरखाव आवश्यक",
      "calendar": "कैलेंडर",
      "agents": "एजेंट",
      "search": "खोज"
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
      "bookings": "ಬುಕಿಂಗ್",
      "ai_assistant": "AI ಸಹಾಯಕ",
      "revenue_forecast": "ಆದಾಯ ಮುನ್ಸೂಚನೆ",
      "occupancy_forecast": "ಆಕ್ಯುಪೆನ್ಸಿ ಮುನ್ಸೂಚನೆ",
      "gst_invoice": "GST ಸರಕುಪಟ್ಟಿ",
      "check_in": "ಚೆಕ್-ಇನ್",
      "check_out": "ಚೆಕ್-ಔಟ್",
      "available": "ಲಭ್ಯವಿದೆ",
      "occupied": "ಭರ್ತಿಯಾಗಿದೆ",
      "cleaning": "ಶುಚಿಗೊಳಿಸುವಿಕೆ",
      "maintenance_req": "ನಿರ್ವಹಣೆ ಅಗತ್ಯವಿದೆ",
      "calendar": "ಕ್ಯಾಲೆಂಡರ್",
      "agents": "ಏಜೆಂಟ್",
      "search": "ಹುಡುಕಿ"
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
