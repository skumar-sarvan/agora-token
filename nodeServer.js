const express = require("express");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
require("dotenv").config();

const app = express();
app.use(cors());

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

app.get("/token", (req, res) => {
    const channelName = req.query.channel;
    const uid = req.query.uid || 0;
    const role = req.query.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expireTime = parseInt(req.query.expireTime, 10) || 3600;

    if (!APP_ID || !APP_CERTIFICATE) {
        return res.status(500).json({ error: "Missing Agora credentials" });
    }
    if (!channelName) {
        return res.status(400).json({ error: "Channel name is required" });
    }

    const expirationTimestamp = Math.floor(Date.now() / 1000) + expireTime;
    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID, APP_CERTIFICATE, channelName, uid, role, expirationTimestamp
    );

    return res.json({ token });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
