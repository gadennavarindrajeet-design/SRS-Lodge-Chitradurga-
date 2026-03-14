import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_lodgeease',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'lodgeease_secret'
});

const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay Order API
  app.post("/api/payments/order", async (req, res) => {
    try {
      const { amount, plan, lodgeID } = req.body;
      const options = {
        amount: amount * 100, // in paise
        currency: "INR",
        receipt: `receipt_${lodgeID}_${Date.now()}`,
        notes: { plan, lodgeID }
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // WhatsApp API Proxy
  app.post("/api/whatsapp/send", async (req, res) => {
    const { to, message, template, components, mediaUrl, mediaType } = req.body;

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
      return res.status(500).json({ error: "WhatsApp API not configured" });
    }

    try {
      let data: any = {
        messaging_product: "whatsapp",
        to: to.startsWith('91') ? to : `91${to}`, // Default to India if not specified
      };

      if (template) {
        data.type = "template";
        data.template = {
          name: template,
          language: { code: "en_US" },
          components: components || []
        };
      } else if (mediaUrl) {
        data.type = mediaType || "document";
        data[data.type] = {
          link: mediaUrl,
          filename: "Invoice.pdf"
        };
      } else {
        data.type = "text";
        data.text = { body: message };
      }

      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
        data,
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("WhatsApp Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to send WhatsApp message" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
