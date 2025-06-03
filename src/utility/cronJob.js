const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequests");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");

cron.schedule("26 22 * * * ", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequest = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    console.log("Pending requests : ", pendingRequest);

    const listOfEmails = [
      ...new Set(pendingRequest.map((req) => req.toUserId.emailId)),
    ];
    if (!listOfEmails) {
      console.log("No list for today ");
      return;
    }

    for (const email of listOfEmails) {
      const res = await sendEmail.run(
        email,
        "Check pending requests ",
        "You have connection requests left please have a look"
      );

      console.log("Email sent to ", email);
    }
  } catch (error) {
    console.error("Cron scheduling error : ", error);
  }
});
