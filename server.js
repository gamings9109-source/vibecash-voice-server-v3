const express = require("express");
const { AccessToken } = require("livekit-server-sdk");

const app = express();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

app.get("/", (req, res) => {
  res.send("LiveKit Token Server Running");
});

app.get("/getToken", async (req, res) => {
  try {
    const room = req.query.room;
    const user = req.query.user;

    if (!room || !user) {
      return res.status(400).json({
        error: "room and user are required"
      });
    }

    const at = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity: user
      }
    );

    at.addGrant({
      roomJoin: true,
      room: room
    });

    const token = await at.toJwt();

    res.json({
      token: token
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e.toString()
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
