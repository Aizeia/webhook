const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("Incoming request:", JSON.stringify(req.body, null, 2));

  const intentName = req.body.queryResult.intent.displayName;
  let responseText = "Webhook working!";

  if (intentName === "PRIO.Create_Support_Ticket") {
    responseText = "Support ticket created successfully.";
  }

  if (intentName === "Ticket.Check_Status") {
    responseText = "Your ticket is currently being processed.";
  }

  res.json({
    fulfillmentText: responseText
  });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});