const express = require("express");


const app = express();


app.use(express.json());


app.post("/webhook", (req, res) => {
  console.log("Incoming request:");
  console.log(JSON.stringify(req.body, null, 2));

  const intentName = req.body.queryResult.intent.displayName;
  let responseText = "Something went wrong.";


  if (intentName === "PRIO.Create_Support_Ticket") {
    responseText = "Do you want to confirm the ticket?";
  }


  else if (intentName === "Ticket.Confirm_Details") {
    const ticketId = Math.floor(Math.random() * 10000);
    responseText = `Perfect. I am submitting the ticket now… Ticket ID: ${ticketId}`;
  }

 
  else if (intentName === "Ticket.Check_Status") {
    const ticketId = req.body.queryResult.parameters.ticket_id;
    responseText = `Ticket ${ticketId} is currently being processed.`;
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