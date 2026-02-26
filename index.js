app.post("/webhook", (req, res) => {

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