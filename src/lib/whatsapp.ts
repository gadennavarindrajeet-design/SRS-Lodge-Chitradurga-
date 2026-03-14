import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface SendWhatsAppParams {
  to: string;
  message?: string;
  template?: string;
  components?: any[];
  mediaUrl?: string;
  mediaType?: "document" | "image" | "video";
  lodgeID: string;
  lodgeName: string;
  guestName: string;
}

export const sendWhatsAppMessage = async (params: SendWhatsAppParams) => {
  const { to, message, template, components, mediaUrl, mediaType, lodgeID, lodgeName, guestName } = params;

  try {
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, message, template, components, mediaUrl, mediaType }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send WhatsApp message");
    }

    // Log to Firestore
    await addDoc(collection(db, "whatsapp_logs"), {
      lodgeID,
      lodgeName,
      guestName,
      to,
      message: message || `Template: ${template}`,
      status: "sent",
      timestamp: serverTimestamp(),
      wa_id: result.messages?.[0]?.id
    });

    return result;
  } catch (error: any) {
    console.error("WhatsApp Service Error:", error);
    
    // Log failure to Firestore
    await addDoc(collection(db, "whatsapp_logs"), {
      lodgeID,
      lodgeName,
      guestName,
      to,
      message: message || `Template: ${template}`,
      status: "failed",
      error: error.message,
      timestamp: serverTimestamp()
    });

    throw error;
  }
};
