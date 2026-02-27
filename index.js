const express = require("express");
const app = express();
app.use(express.json());

const tickets = {}; // in-memory storage

function generateTicketID() {
  return Math.floor(1000 + Math.random() * 9000);
}

function createResponse(text) {
  return { fulfillmentMessages: [{ text: { text: [text] } }] };
}

app.post("/webhook", (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  const language = req.body.queryResult.languageCode || "en";
  let responseText = "";

  if (intentName === "PRIO_Create_Support_Ticket") {
  const issue = req.body.queryResult.parameters.issue_summary;

  responseText = language.startsWith("sv")
    ? `Du beskrev problemet som: "${issue}". Vill du bekräfta ärendet?`
    : `You described the issue as: "${issue}". Do you want to confirm the ticket?`;
}
  else if (intentName === "Ticket.Confirm_Details") {
    const ticketId = generateTicketID();
    tickets[ticketId] = { status: "Open", createdAt: new Date().toISOString() };
    responseText = language.startsWith("sv")
      ? `Perfekt. Jag skickar in ärendet nu… Ärende-ID: ${ticketId}`
      : `Perfect. I am submitting the ticket now… Ticket ID: ${ticketId}`;
  } 
  else if (intentName === "Ticket.Check_Status") {
    const ticketId = req.body.queryResult.parameters.ticket_id;
    if (!ticketId) {
      responseText = language.startsWith("sv") ? "Vilket ärende-ID?" : "Which ticket ID?";
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

app.get("/", (req, res) => res.send("Server is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));