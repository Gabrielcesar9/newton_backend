// Node.js Express server with MongoDB for user-hardware validation
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

require('dotenv').config(); // Load .env file if present

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'Newton';
const COLLECTION = 'users';
const SESSION_TIMEOUT_MS = 90 * 1000; // 90 seconds
const DEFAULT_MAX_INSTANCES = 1;

let db, usersCollection, sessionsCollection, dllCollection;

// Connect to MongoDB
if (!MONGO_URI) {
  console.error('MONGO_URI is not set!');
  process.exit(1);
}

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    usersCollection = db.collection(COLLECTION);
    sessionsCollection = db.collection("sessions");
    dllCollection = db.collection("dll_updates");
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

app.post('/validate', async (req, res) => {

  const {
    hwids,
    app_user,
    session_id
  } = req.body;

  if (
    !Array.isArray(hwids) ||
    hwids.length === 0 ||
    !app_user ||
    !session_id
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing hwids, app_user or session_id"
    });
  }

  try {

    const user = await usersCollection.findOne({ app_user });

    console.log("[DEBUG] Query:", {
      app_user,
      hwids,
      session_id
    });

    if (!user) {

      console.log("[DEBUG] User not found");

      return res.json({
      status: "denied",
      message: "User not found."
    });

    }

    const now = new Date();

    // Remove expired sessions
    await sessionsCollection.deleteMany({
      expiresAt: { $lt: now }
    });

    // Check HWID
    const hwidMatch =
      Array.isArray(user.hwids) &&
      user.hwids.some(hwid => hwids.includes(hwid));

    if (!hwidMatch) {

      console.log("[DEBUG] HWID mismatch");

      return res.json({
      status: "denied",
      message: "This computer is not authorized."
    });

    }

    // Check expiration
    const expiration =
      user.expiration
        ? new Date(user.expiration)
        : null;

    if (!expiration || expiration < now) {

      console.log("[DEBUG] Subscription expired");

      return res.json({
      status: "expired",
      message: "Subscription expired. Please renew your subscription."
    });

    }

    // Existing session?
    const existing =
      await sessionsCollection.findOne({
        session_id
      });

    if (existing) {

      await sessionsCollection.updateOne(
        { session_id },
        {
          $set: {
            expiresAt: new Date(
              Date.now() + SESSION_TIMEOUT_MS
            )
          }
        }
      );

      return res.json({
        status: "allowed"
      });

    }

    // Count active sessions
    const activeSessions =
      await sessionsCollection.countDocuments({
        app_user
      });

    const maxInstances =
      user.max_instances || 1;

    if (activeSessions >= maxInstances) {

      console.log("[DEBUG] Too many instances");

      return res.json({
      status: "too_many_instances",
      message: `Maximum of ${maxInstances} instance(s) already running.`
    });

    }

    // Create new session
    await sessionsCollection.insertOne({

      session_id,

      app_user,

      expiresAt: new Date(
        Date.now() + SESSION_TIMEOUT_MS
      )

    });

    console.log("[DEBUG] Session created");

    return res.json({
      status: "allowed"
    });

  }
  catch (err) {

    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });

  }

});

// Update checker endpoint - for bundled exe updates only
app.get('/api/check-update', async (req, res) => {
  try {
    const updatesCollection = db.collection('updates');

    const latest = await updatesCollection.findOne(
    {},
    {
        sort: { created_at: -1 },
        projection: {
            _id: 0
        }
    }
);

    if (!latest) {
      return res.status(404).json({
        status: "error",
        message: "No updates available"
      });
    }

    res.json(latest);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

app.post('/heartbeat', async (req, res) => {

    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing session_id"
        });
    }

    try {

        // Find session
        const session = await sessionsCollection.findOne({ session_id });

        if (!session) {
            return res.json({
                status: "invalid_session"
            });
        }

        // Find user
        const user = await usersCollection.findOne({
            app_user: session.app_user
        });

        if (!user) {

            await sessionsCollection.deleteOne({ session_id });

            return res.json({
                status: "invalid_session"
            });

        }

        const now = new Date();

        const expiration =
            user.expiration
                ? new Date(user.expiration)
                : null;

        if (!expiration || expiration <= now) {

            // Remove the session immediately
            await sessionsCollection.deleteOne({
                session_id
            });

            return res.json({
                status: "expired"
            });

        }

        const remaining_ms = expiration.getTime() - now.getTime();

        // Refresh session timeout
        await sessionsCollection.updateOne(
            { session_id },
            {
                $set: {
                    expiresAt: new Date(
                        Date.now() + SESSION_TIMEOUT_MS
                    )
                }
            }
        );

        return res.json({

            status: "ok",

            remaining_ms

        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            status: "error"
        });

    }

});

app.post('/logout', async (req, res) => {

  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({
      status: "error",
      message: "Missing session_id"
    });
  }

  try {

    await sessionsCollection.deleteOne({
      session_id
    });

    console.log("[DEBUG] Session removed:", session_id);

    return res.json({
      status: "ok"
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      status: "error"
    });

  }

});

app.get('/api/check-dll', async (req, res) => {

    try {

        const dll =
            await dllCollection.findOne({
                name: "monitor"
            });

        if (!dll) {

            return res.status(404).json({
                status: "error"
            });

        }

        return res.json({

            version: dll.version,
            mandatory: dll.mandatory || false,
            download_url: dll.download_url

        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            status: "error"
        });

    }

});

app.get('/', (req, res) => {
  res.send('Newton Validation Server is running. 1');
});

app.listen(PORT, () => {
  console.log(`Validation server running on port ${PORT}`);
});
