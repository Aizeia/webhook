const express = require("express");
const app = express();
app.use(express.json());

const tickets = {};

function generateTicketID() {
  return Math.floor(1000 + Math.random() * 9000);
}

function createResponse(text) {
  return {
    fulfillmentMessages: [
      { text: { text: [text] } }
    ]
  };
}

app.post("/webhook", (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  const language = req.body.queryResult.languageCode || "en";
  const params = req.body.queryResult.parameters;
  let responseText = "";

  // ==============================
  // CREATE TICKET (STEP 1)
  // ==============================
  if (intentName === "PRIO_Create_Support_Ticket") {
    const issue = params.issue_summary;
let category = params.issue_category;

if (!category && issue) {
  const lowerIssue = issue.toLowerCase();

  if (lowerIssue.includes("log") || lowerIssue.includes("password")) {
    category = "login";
  } 
  else if (lowerIssue.includes("invoice") || lowerIssue.includes("faktura")) {
    category = "invoice";
  } 
  else if (lowerIssue.includes("access") || lowerIssue.includes("behörighet")) {
    category = "access";
  } 
  else if (lowerIssue.includes("purchase") || lowerIssue.includes("inköp")) {
    category = "purchase";
  } 
  else {
    category = "other";
  }
}
    if (!issue) {
      responseText = language.startsWith("sv")
        ? "Vad gäller ärendet?"
        : "What is the issue about?";
      return res.json(createResponse(responseText));
    }

    responseText = language.startsWith("sv")
      ? `Du beskrev problemet som: "${issue}". Kategori: "${category || "övrigt"}". Vill du bekräfta ärendet?`
      : `You described the issue as: "${issue}". Category: "${category || "other"}". Do you want to confirm the ticket?`;
  }

  // ==============================
  // CONFIRM TICKET
  // ==============================
  else if (intentName === "Ticket.Confirm_Details") {

    const issue = params.issue_summary;
    const category = params.issue_category || "other";

    const ticketId = generateTicketID();

    tickets[ticketId] = {
      status: "Open",
      issue: issue,
      category: category,
      createdAt: new Date().toISOString()
    };

    responseText = language.startsWith("sv")
      ? `Perfekt. Ärendet "${issue}" har skapats.\nKategori: ${category}\nÄrende-ID: ${ticketId}`
      : `Perfect. Ticket "${issue}" has been created.\nCategory: ${category}\nTicket ID: ${ticketId}`;
  }

  // ==============================
  // CANCEL
  // ==============================
  else if (intentName === "Ticket.Cancel") {
    responseText = language.startsWith("sv")
      ? "Okej, ärendet skapades inte."
      : "Okay, the ticket was not created.";

    return res.json({
      fulfillmentMessages: [
        { text: { text: [responseText] } }
      ],
      outputContexts: []
    });
  }

  // ==============================
  // CHECK STATUS
  // ==============================
  else if (intentName === "Ticket.Check_Status") {
    const ticketId = params.ticket_id;

    if (!ticketId) {
      responseText = language.startsWith("sv")
        ? "Vilket ärende-ID?"
        : "Which ticket ID?";
    }
    else if (!tickets[ticketId]) {
      responseText = language.startsWith("sv")
        ? `Hittade inget ärende med ID ${ticketId}`
        : `No ticket found with ID ${ticketId}`;
    }
    else {
      const ticket = tickets[ticketId];
      responseText = language.startsWith("sv")
        ? `Status på ärende ${ticketId}: ${ticket.status}\nKategori: ${ticket.category}`
        : `Status of ticket ${ticketId}: ${ticket.status}\nCategory: ${ticket.category}`;
    }
  }

  // ==============================
  // FALLBACK
  // ==============================
  else {
    responseText = language.startsWith("sv")
      ? "Jag förstod inte det. Kan du försöka igen?"
      : "Sorry, I did not understand that. Please try again.";
  }

  res.json(createResponse(responseText));
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);