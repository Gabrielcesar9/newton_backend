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
  const { username, hardware_id, app_user } = req.body;
  if (!username || !hardware_id || !app_user) {
    return res.status(400).json({ status: 'error', message: 'Missing username, hardware_id, or app_user' });
  }
  try {
    const user = await usersCollection.findOne({ app_user });
    console.log('[DEBUG] Query for:', { app_user, username, hardware_id });
    console.log('[DEBUG] User document:', user);
    if (user && Array.isArray(user.licenses)) {
      const now = new Date();
      // Find license for this username and hardware_id
      const license = user.licenses.find(l => l.username === username && l.hardware_id === hardware_id);
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
        console.log('[DEBUG] Access denied: license not found for username and hardware_id');
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

// Update checker endpoint
app.get('/api/check-update', async (req, res) => {
  try {
    // This returns the latest version information
    // Files can point to individual files in your GitHub repo using raw URLs
    const latestVersion = {
      version: "1.0.0",
      build: "20260219.1",
      download_url: "https://github.com/Gabrielcesar9/project_newton/releases/download/v1.0.0/DungeonAutomationTool.exe",
      release_notes: "Initial release\n- Dungeon automation features\n- GUI improvements\n- Bug fixes",
      mandatory: false,
      min_version_required: "1.0.0",
      // Individual files from your GitHub repo
      // Run: python generate_file_hashes.py to get the file list with hashes
      files: [
        {
          path: "dungeon_scripts/Altar_Sagrado.py",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Altar_Sagrado.py",
          hash: "e623f7f68335517917bece5870439ddc043d6c28d14ed23f3e189ff28370dbb7"
        },
        {
          path: "dungeon_scripts/Desfiladeiro_Congelado.py",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Desfiladeiro_Congelado.py",
          hash: "df2407df220d97d57e82cf34c75be9d0586b272d8d5ab5cfc270fb32c1476001"
        },
        {
          path: "dungeon_scripts/Keldrasil_Sagrado.py",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Keldrasil_Sagrado.py",
          hash: "5d8776850d860cb4f5e409c21703ffdf2ad30df4bf17b2e0672f333f02d9eaa2"
        },
        {
          path: "dungeon_scripts/Moinho_Sagrado.py",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Moinho_Sagrado.py",
          hash: "98ff4b160899cf86c7f51d36a701e476f93352b7570c699e9a96491c85333836"
        },
        {
          path: "dungeon_scripts/Pandemonio.py",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Pandemonio.py",
          hash: "dd1c42eb78da7c18ab74718ffd5c5cafc644a9b6ae7fb4fea1e3dc39c91df266"
        },
        {
          path: "dungeon_scripts/Altar_Sagrado.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Altar_Sagrado.json",
          hash: "702ff34f77be81071ee7ceca528fd8e200aca3f509c6d26c6997925f13021732"
        },
        {
          path: "dungeon_scripts/Desfiladeiro_Congelado.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Desfiladeiro_Congelado.json",
          hash: "935607152df49df9c3977f25e81ca102a009f2a211f34f6b16a2ab31db569669"
        },
        {
          path: "dungeon_scripts/Keldrasil_Sagrado.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Keldrasil_Sagrado.json",
          hash: "583211b1e03139fe1cb888122d2917950cb521b08c6c3dc70409d6545e7b9d2b"
        },
        {
          path: "dungeon_scripts/Moinho_Sagrado.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Moinho_Sagrado.json",
          hash: "25e0c25c24096e3f1dd0bc5579e6f5b5762a41f2b6eeef20be24f478bc0b92c5"
        },
        {
          path: "dungeon_scripts/Pandemonio.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Pandemonio.json",
          hash: "2b0aa487f133f041eb9a7ea0b4c231a2303c338df720de1f8e8997f7fce18870"
        },
        {
          path: "dungeon_scripts/Parte_do_Mapa.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Parte_do_Mapa.json",
          hash: "f512d50a0eea29bd975830b27c0d7b35923dd9d0830685802374bd30b19b001d"
        },
        {
          path: "settings.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/settings.json",
          hash: "f6b8ae70fc39967f5d9b150e7dce0bfd4a35ac396e63eae514936e1615dfd94a"
        },
        {
          path: "sequence.json",
          url: "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/sequence.json",
          hash: "06abde30217de7480fa41cbf8331d8becbe57e56c2d131449d90690184d24261"
        }
      ]
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
