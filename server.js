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

let db, usersCollection;

// Connect to MongoDB
if (!MONGO_URI) {
  console.error('MONGO_URI is not set!');
  process.exit(1);
}

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    usersCollection = db.collection(COLLECTION);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

app.post('/validate', async (req, res) => {
  const { username, hwids, app_user } = req.body;
  if (!username || !Array.isArray(hwids) || hwids.length === 0 || !app_user) {
    return res.status(400).json({ status: 'error', message: 'Missing username, hwids, or app_user' });
  }
  try {
    const user = await usersCollection.findOne({ app_user });
    console.log('[DEBUG] Query for:', { app_user, username, hwids });
    console.log('[DEBUG] User document:', user);
    if (user && Array.isArray(user.licenses)) {
      const now = new Date();
      // Find license for this username and any matching hwid
      const license = user.licenses.find(l => {
        return l.username === username && Array.isArray(l.hwids) && l.hwids.some(hwid => hwids.includes(hwid));
      });
      console.log('[DEBUG] Matched license:', license);
      if (license) {
        const exp = license.expiration ? new Date(license.expiration) : null;
        console.log('[DEBUG] Now:', now.toISOString(), 'Expiration:', exp ? exp.toISOString() : null);
        if (exp && exp >= now) {
          console.log('[DEBUG] Access allowed');
          return res.json({ status: 'allowed' });
        } else {
          console.log('[DEBUG] Subscription expired');
          return res.json({ status: 'expired' });
        }
      } else {
        console.log('[DEBUG] Access denied: license not found for username and hwid');
        return res.json({ status: 'denied' });
      }
    } else {
      console.log('[DEBUG] Access denied: app_user not found or no licenses');
      return res.json({ status: 'denied' });
    }
  } catch (err) {
    console.error('Error querying MongoDB:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Update checker endpoint - for bundled exe updates only
app.get('/api/check-update', async (req, res) => {
  try {
    // All files are now bundled in the exe - only download exe for updates
    const latestVersion = {
      version: "1.0.1",
      build: "20260219.1",
      download_url: "https://github.com/Gabrielcesar9/project_newton/releases/download/v1.0.1/DungeonAutomationTool.exe",
      release_notes: "Initial release\n- Dungeon automation features\n- GUI improvements\n- Bug fixes\n- All assets and scripts bundled in exe",
      mandatory: false,
      min_version_required: "1.0.0"
    };
    
    res.json(latestVersion);
  } catch (err) {
    console.error('Error serving update info:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Optional: Store update info in database
app.post('/api/update-version', async (req, res) => {
  const { version, build, download_url, release_notes, mandatory } = req.body;
  
  try {
    const updatesCollection = db.collection('updates');
    const result = await updatesCollection.insertOne({
      version,
      build,
      download_url,
      release_notes,
      mandatory,
      created_at: new Date()
    });
    
    res.json({ status: 'success', id: result.insertedId });
  } catch (err) {
    console.error('Error storing update info:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Validation server running on port ${PORT}`);
});
