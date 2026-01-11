const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔴 Paste your Fast2SMS API key
const FAST2SMS_API_KEY = "ByJVIM3Yhtbn9GPSEplus2fLi7x5RdF1eZOUWX8azCoDjNQ4kTABWwZT2hxiFfSP8QDYc6NMkX4KtO7I";

app.post("/send-sms", async (req, res) => {
  const { message, numbers } = req.body;
console.log("SMS Request Received:", message, numbers);
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        numbers: numbers.join(",")
      },
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});






app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});