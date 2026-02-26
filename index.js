const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();

app.use(bodyParser.json());

// Initialize Firebase
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Utility to detect language
function getLanguage(req) {
  return req.body.queryResult.languageCode || "en";
}

// Utility to format response in Dialogflow
function createResponse(text) {
  return {
    fulfillmentMessages: [
      {
        text: {
          text: [text]
        }
      }
    ]
  };
}

// Generate random ticket ID
function generateTicketID() {
  return Math.floor(1000 + Math.random() * 9000); // 4-digit ID
}

// Main webhook endpoint
app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const language = getLanguage(req);
  const params = req.body.queryResult.parameters;

  try {
    if (intent === "PRIO.Create_Support_Ticket") {
      // Create ticket
      const ticket_id = generateTicketID();
      const ticketData = {
        ticket_id,
        category: params.category || "General",
        description: params.description || "",
        contact: params.contact || "",
        status: "Open",
        createdAt: new Date().toISOString()
      };

      await db.collection("tickets").doc(ticket_id.toString()).set(ticketData);

      let responseText = language.startsWith("sv")
        ? `Perfekt. Jag skickar in ärendet nu… Ärende-ID: ${ticket_id}`
        : `Perfect. I’m submitting your ticket now… Ticket ID: ${ticket_id}`;

      return res.json(createResponse(responseText));
    }

    else if (intent === "Ticket.Check_Status") {
      let ticket_id = params.ticket_id;
      if (!ticket_id) {
        // Ask for ticket ID if missing
        let promptText = language.startsWith("sv") ? "Vilket ärende-ID?" : "Which ticket ID?";
        return res.json(createResponse(promptText));
      }

      const ticketDoc = await db.collection("tickets").doc(ticket_id.toString()).get();
      if (!ticketDoc.exists) {
        let notFoundText = language.startsWith("sv")
          ? `Hittade inget ärende med ID ${ticket_id}`
          : `No ticket found with ID ${ticket_id}`;
        return res.json(createResponse(notFoundText));
      }

      const ticket = ticketDoc.data();
      let statusText = language.startsWith("sv")
        ? `Status på ärende ${ticket_id}: ${ticket.status}`
        : `Status of ticket ${ticket_id}: ${ticket.status}`;

      return res.json(createResponse(statusText));
    }

    else {
      // Default fallback
      return res.json(createResponse("Sorry, I did not understand that."));
    }
  } catch (error) {
    console.error("Webhook error:", error);
    let errText = language.startsWith("sv")
      ? "Oj, något gick fel. Försök igen senare."
      : "Oops, something went wrong. Please try again later.";
    return res.json(createResponse(errText));
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});