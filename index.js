const express = require("express");
const app = express();

app.use(express.json());

// In-memory ticket storage (resets if server restarts)
const tickets = {};

// Utility to detect language
function getLanguage(req) {
  return req.body.queryResult.languageCode || "en";
}

// Utility to create response
function createResponse(text) {
  return { fulfillmentMessages: [{ text: { text: [text] } }] };
}

// Generate random ticket ID
function generateTicketID() {
  return Math.floor(1000 + Math.random() * 9000); // 4-digit ID
}

// Webhook endpoint
app.post("/webhook", (req, res) => {
  console.log("Incoming request:");
  console.log(JSON.stringify(req.body, null, 2));

  const intentName = req.body.queryResult.intent.displayName;
  const language = getLanguage(req);
  let responseText = "";

  if (intentName === "PRIO.Create_Support_Ticket") {
    responseText = language.startsWith("sv")
      ? "Vill du bekräfta ärendet?"
      : "Do you want to confirm the ticket?";
  }

  else if (intentName === "Ticket.Confirm_Details") {
    const ticketId = generateTicketID();

    // Store ticket in memory
    tickets[ticketId] = {
      status: "Open",
      createdAt: new Date().toISOString()
    };

    responseText = language.startsWith("sv")
      ? `Perfekt. Jag skickar in ärendet nu… Ärende-ID: ${ticketId}`
      : `Perfect. I am submitting the ticket now… Ticket ID: ${ticketId}`;
  }

  else if (intentName === "Ticket.Check_Status") {
    const ticketId = req.body.queryResult.parameters.ticket_id;

    if (!ticketId) {
      responseText = language.startsWith("sv")
        ? "Vilket ärende-ID?"
        : "Which ticket ID?";
    } else if (!tickets[ticketId]) {
      responseText = language.startsWith("sv")
        ? `Hittade inget ärende med ID ${ticketId}`
        : `No ticket found with ID ${ticketId}`;
    } else {
      responseText = language.startsWith("sv")
        ? `Status på ärende ${ticketId}: ${tickets[ticketId].status}`
        : `Status of ticket ${ticketId}: ${tickets[ticketId].status}`;
    }
  }

  else {
    responseText = language.startsWith("sv")
      ? "Jag förstod inte det. Kan du försöka igen?"
      : "Sorry, I did not understand that. Please try again.";
  }

  res.json(createResponse(responseText));
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});