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

// Update checker endpoint
app.get('/api/check-update', async (req, res) => {
  try {
    // This returns the latest version information
    // Files can point to individual files in your GitHub repo using raw URLs
    const latestVersion = {
      version: "1.0.1",
      build: "20260219.1",
      download_url: "https://github.com/Gabrielcesar9/project_newton/releases/download/v1.0.0/DungeonAutomationTool.exe",
      release_notes: "Initial release\n- Dungeon automation features\n- GUI improvements\n- Bug fixes",
      mandatory: false,
      min_version_required: "1.0.0",
      // Individual files from your GitHub repo
      // Run: python generate_file_hashes.py to get the file list with hashes
      files:                         [
        {
          "path": "assets/Altar_Sagrado/background.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/background.jpg",
          "hash": "30cff86cdf2d0aa639157a880abec0f36d0cfe19cce6b525e2dc13b722e5b5f3"
        },
        {
          "path": "assets/Altar_Sagrado/segments/Anjo.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/segments/Anjo.jpg",
          "hash": "270d4d6cb91c2b06794c005d5436cfff4c951971775272b5a764d8c591a1e2fe"
        },
        {
          "path": "assets/Altar_Sagrado/segments/Jardineiro.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/segments/Jardineiro.jpg",
          "hash": "2f781085c4e903ac42853e31702731e7d8503d79363e1ee91aeca2e33583414f"
        },
        {
          "path": "assets/Altar_Sagrado/segments/Justiceiro.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/segments/Justiceiro.jpg",
          "hash": "eaeb08d8941b6f50dfa9dbc2e1501b62fa3a3042fb060c107d6dcf3d8e1a6cd7"
        },
        {
          "path": "assets/Altar_Sagrado/segments/Porteiro.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/segments/Porteiro.jpg",
          "hash": "ac4a57918d4bacb878d88348898b02f36f6011c4953e4b295c7ca9cc573d2024"
        },
        {
          "path": "assets/Altar_Sagrado/segments/Sky_Mantalion.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/segments/Sky_Mantalion.jpg",
          "hash": "fd689e67655d764e8b685375c4831266b0d4a33fdf60e1e4cb2aa917edea03ad"
        },
        {
          "path": "assets/Altar_Sagrado/segments/Soberano.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/segments/Soberano.jpg",
          "hash": "ac90933c3bd0f273fb58b720ca05b87873d5b772acb98983d9087173f5953b1c"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket1.jpg",
          "hash": "ea219c55cb93a81dfe3c1ef8ef0f44da134e30a34cfc63bec076ef462bbb3956"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket10.jpg",
          "hash": "b8c04e67a102c84bbfaee871123890dfc408de72a693628e007c17c2b6baf70b"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket11.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket11.jpg",
          "hash": "71660d51595fb80bc4a1fc4d8a2946d849f87dd233bd8f4732a52496a372d65a"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket12.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket12.jpg",
          "hash": "4e4f23c001dd463708c4c7079b6f7092726149053f6fba41db61f9d7d20d30f0"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket13.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket13.jpg",
          "hash": "daf4b981beb5d4c6f9e5173bb2af9e62ca5a3ce9652bca58fbb8e769d5bc5326"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket14.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket14.jpg",
          "hash": "e3af977d8cf98bded9fde76363130122d72e1a4c6311b096c686d6645734262f"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket15.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket15.jpg",
          "hash": "cfe75d01edbf343d73c1a05a89ff94d06829fb8fa202bfaf401a8ac3a797574c"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket16.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket16.jpg",
          "hash": "3424005f95d3bc21f820d2474afbd82817060adfcb4ba49986f42d9edd14a6fa"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket17.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket17.jpg",
          "hash": "7087c9d8b0d70e0737e65550d498d685237ac9dd8b823c6844f9f953b02a0a99"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket18.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket18.jpg",
          "hash": "5ccd1daa18e0c5bca3083f13deea3a313fbd50398190ea2e69735f3358b8b030"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket19.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket19.jpg",
          "hash": "4b8f621d6f02b159701557779a95ec225d19a7a89d24eaa3cb0d461af71c1466"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket2.jpg",
          "hash": "071eb9196f57b93798d5561390a499303cd06e199dae362148e312f94eb0857a"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket20.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket20.jpg",
          "hash": "4c53e85fd99e9757fb1644b5faf5360cb188de779661afdf025ec465313df430"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket21.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket21.jpg",
          "hash": "6af31bb7853b52137c853d299efea24813b5faf94847e38839b36e06b4950d55"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket22.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket22.jpg",
          "hash": "bab0ea901e1babff15698545211345cc9c0fcf2258aeec56fbd93a4b4c5ad6b1"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket23.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket23.jpg",
          "hash": "7eed084ae22c80ba50d0dc1c9577c6be920a5dc7e7c90a476dad3527553fca78"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket24.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket24.jpg",
          "hash": "74696e19a250cb1ec9036c712e2ab63f4c58d6d0045abc4fc173d57fbb688ef1"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket25.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket25.jpg",
          "hash": "09d7cdbe4be77684578d070d9a7506d7d11c15f43831dd79b3bc91647abed8f0"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket26.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket26.jpg",
          "hash": "41e85081c3ec69243801b13239d327d39e62ec484a4d3f9ac3a1d8fa899fa74e"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket27.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket27.jpg",
          "hash": "d7fd64c34dfb39195f3b50357fefdaa455cf95356b8219faaf2894824179dae0"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket28.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket28.jpg",
          "hash": "83cfac7cd073c7e23f4b29dc13bba509738062d29507a106d750a15a420dd86c"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket29.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket29.jpg",
          "hash": "8a688a4c5904c3e45ef0732bdc1d83b809c6bb3c3791d28f6ff69e9748683b9f"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket3.jpg",
          "hash": "55cbf45f8a3e78b5afb29e0c7c4dd438b6e962ab62cc9941e69270bc602b6ec8"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket30.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket30.jpg",
          "hash": "752cd860b5e85106fe7e2378ab7975af41fe35cd715806532ac655c8d4007218"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket4.jpg",
          "hash": "5ce2438b2768ba609f4f43eb75ff7844e41e49c1cc5f6e0f592d37d37dd5ac50"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket5.jpg",
          "hash": "33ab0d9912bed6f92250231dc68307e3b4dde7e579599c556690d66ffd0b0b75"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket6.jpg",
          "hash": "9a238f9da25f6c522e09bbd4d5f7e9435238abb629d0664b2ba9e0496e2467a9"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket7.jpg",
          "hash": "df7c6223684d0f33256e1eb272a8a8759476d15406605bb978d878f6bc71ceee"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket8.jpg",
          "hash": "d58f92b86461c05ae590cce4ebee1911b3c85bbe746cafc597e4b1b5fc670abe"
        },
        {
          "path": "assets/Altar_Sagrado/ticket/ticket9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Altar_Sagrado/ticket/ticket9.jpg",
          "hash": "22caf8ac87972dd22aa79bf765037487d6ce746bdcaca677aa065169519cd08c"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/background.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/background.jpg",
          "hash": "62c49989c66833af787ad158373e689948472e9754adcc9c7a2f0c91a4a553fd"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Assombracao.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Assombracao.jpg",
          "hash": "c9618a74ea6302a782389327d2e51a4ecb317c5e5f6fe0571f93a74bac4afbaa"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Braco.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Braco.jpg",
          "hash": "ea37db0e8fd5dd084e57961dfdd038ffaa63a24833f9a1612e88fa4e49f504cf"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Cranio.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Cranio.jpg",
          "hash": "bd84f024797871a6799b083cf5028d35214b167e1c84620f5517924ab1487112"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Frio.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Frio.jpg",
          "hash": "45ba3be2b2d8b3ecbed54a9b6c178a8bef82bb0a22709455271991a3e661451e"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Golem.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Golem.jpg",
          "hash": "b62d1e560022280415ed8d40e045974eb5f69b03929925541f11e8045b3138ec"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Lezaar.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Lezaar.jpg",
          "hash": "b96fa1dbc9e812967212e7f18e9c8aefd241ebe19cf2c14272dfd54bf9ae7010"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Nazabrum_alma.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Nazabrum_alma.jpg",
          "hash": "f7f0abc0f5e51641828af5c06fbd2789fa90a216d168ab6d069e0625d52c7276"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Ridruth.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Ridruth.jpg",
          "hash": "88ac9ff6cce1740e4c4e14ebe74d0e7f40827cae02b88f3158c5a16b546fc16c"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/segments/Vashirr.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/segments/Vashirr.jpg",
          "hash": "01beba1061b74813c89b377b700671dd1f0003ee420a6aa01aa83c72e0be42b4"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket.jpg",
          "hash": "7ac8d569c6a8a1f3830e70039e78cdaffc09e9556608f14f0735a3a0265110d1"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket1.jpg",
          "hash": "55e1274cc3eaca738a5ff02749240b16bafca041246581bf76efa06b21921be5"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket10.jpg",
          "hash": "b725ebe68b0433a88fe79c5e021ef5e0965231503b6906f7951be47b43d57514"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket11.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket11.jpg",
          "hash": "035899ad45ac99ab75375a86f5dfcd0cecede5bd5bc9b93c2244ff02d56e29e1"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket12.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket12.jpg",
          "hash": "d952cc609c177b8fe8a63d25cf9561970438d75e018da0db52d1c45fd45f9e1f"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket13.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket13.jpg",
          "hash": "ef45b2de09a1b639dd4a7a7ed0b73d7a87008b4a0fd2ad850abfe122fd4e6205"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket14.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket14.jpg",
          "hash": "b4f898dce13b2c9608ac4e9f2137a90e6439cf56121a4a15928c453684fc5c3a"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket15.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket15.jpg",
          "hash": "ccfee6c683dea22e2534b2309760a2122c11eb054de5c6c30099cbeecc8fd577"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket16.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket16.jpg",
          "hash": "c10c52620af1b98213abcfda6fd648afa9fa60d671dae6aba43eae2a140970fd"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket17.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket17.jpg",
          "hash": "5be8cd8b6886c2a4bbd4c8c8e2eda8219fd3dbaa7f90264ae1764bd8ce02b1c2"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket18.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket18.jpg",
          "hash": "39eff82d90f967d3d66ad707c93dabb8f11c3c17036d2855909be7e10075fa49"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket19.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket19.jpg",
          "hash": "5d3fb7b7e933f5ab042651b72d85c1b438523500453d62313d2a27955ce8ffc8"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket2.jpg",
          "hash": "9b9d23fa6897a68c2ce3df6d6da050b2fb63aa9e284a1009e0d7a403514ccb94"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket20.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket20.jpg",
          "hash": "7b7d0838aa8e2a5ed9a847ebeb76936b105861f2d8340c395a3af774cdb219e5"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket21.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket21.jpg",
          "hash": "aa0558521d99d82251fe04e4593cb1a9f3e80be46e43f96acf4180e9614fa08f"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket22.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket22.jpg",
          "hash": "c44c71ed60c8b70f231589828a173f757b013f7d07623f6e90883633c49f85cd"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket23.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket23.jpg",
          "hash": "2ae499dadf63165bdb7ed8ec04ca718ff9dc2bb4df41020e5f0c167fd0c56e71"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket24.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket24.jpg",
          "hash": "8baac9ea8954d25b48995ca57b173f67ea88d3f77973c0ac19b2f5c9e0ec48c3"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket25.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket25.jpg",
          "hash": "89f3ee94e05de48bdea76aa9d93bc1ce2bc15d13582ffda4342ab443b6004bb2"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket26.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket26.jpg",
          "hash": "dee04c5c1ea30baa5e7ecbdce8186222715f7162fc8e1baf9ed617226e38fa70"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket27.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket27.jpg",
          "hash": "55374bde53170d1fb2f2a45d15ce41ea5d904e0249fe044e3715978da9dc101d"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket28.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket28.jpg",
          "hash": "9ac52b637a3df2f4bcf6e1bed2fa9b1da1e93800d25b5ec17451383724ab3393"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket29.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket29.jpg",
          "hash": "17e71d7b758423c280257c5f2e5e85e523f03f6732495014b2bf0f42b95d3956"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket3.jpg",
          "hash": "c37b53beec0ebb4885afe08267f630a026ef11807d453073c32bb19abe92ba94"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket30.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket30.jpg",
          "hash": "028ab63ae2171a63123f72005d4ca12b7f7741e2d170949879b006e815fb02d9"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket4.jpg",
          "hash": "67b1c2d7cf9b2633f2ed5081accdf28e6e2b677dfa774e92cf51950854d06baf"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket5.jpg",
          "hash": "31cc71108511ffb8b6f5ebb79b494228cd94dce9d195259d9a4e7eb3ce79d53e"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket6.jpg",
          "hash": "87e866ae6b0cb394abdb541f17687ffa90028db68493fc7c98cb81b44fab05b1"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket7.jpg",
          "hash": "3e96324a8d682078f5e952f6b59f976deb993b55bd7c6f887374a1da560936f2"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket8.jpg",
          "hash": "d87367788b009957debbc3378491e4e1e18646d65762bf766a9243b2f26c4a82"
        },
        {
          "path": "assets/Desfiladeiro_Congelado/ticket/ticket9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Desfiladeiro_Congelado/ticket/ticket9.jpg",
          "hash": "def135279b06a3db9f489adf0949d044f402ef10cfb1a858652537500e14503f"
        },
        {
          "path": "assets/Keldrasil_Sagrado/background.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/background.jpg",
          "hash": "18c42edd3832c7022e118f158fc88e0003928a40e1d315bff6a858200dec6b2b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/segments/Areihorn.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/segments/Areihorn.jpg",
          "hash": "f5beab76ac6c13e96e786d551262410d33dbb59fbada9a134fff4e8632b99dfe"
        },
        {
          "path": "assets/Keldrasil_Sagrado/segments/Phixia.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/segments/Phixia.jpg",
          "hash": "9f43c65c9bfd0c31a58f349bf6b20a90b93f6dcf13ed3ed6a9762b14b1f1a248"
        },
        {
          "path": "assets/Keldrasil_Sagrado/segments/Shirdrahn.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/segments/Shirdrahn.jpg",
          "hash": "1b89fc1721d6fc540b27f5e44db39f6c44cf39540452f6f99061ec9b229650ad"
        },
        {
          "path": "assets/Keldrasil_Sagrado/segments/Vaour.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/segments/Vaour.jpg",
          "hash": "c302f7ce2821d27271434cb0e06c12ca2b27aabcb681edc12af4f5e0b284b4b7"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr1.jpg",
          "hash": "511bc28b9a11e9cdf4d727f6f402c496a67d14592dd15a88690a717afea97bd6"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr10.jpg",
          "hash": "1239d8b2bd8eca5197b50df9675ea010c1f1f65ad8da482ce2daf6f1752d158f"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr100.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr100.jpg",
          "hash": "2a9fe2ea064f404cc5676bd63446ab932870d98b6f3b66d255601f2a3dd36ec0"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr101.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr101.jpg",
          "hash": "5d90f1f5a56cc74748b21e1c588bb6b7622ceca3b54667664a4de5cfb940f892"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr102.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr102.jpg",
          "hash": "5c3b3b9799eac957cd78696d685e4778623e6ff4ee7f495f44c50d1958c3b5d0"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr103.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr103.jpg",
          "hash": "1f7e509c8e7d0113217a52bfb8913a7a1ec95050b34f90078545699481c460fd"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr104.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr104.jpg",
          "hash": "2cc6c6af28511963100a1fe6b30f675bc1f4543a51facf9584150257575ba6b3"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr105.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr105.jpg",
          "hash": "8f36dad6b268b849a08daab0d93b337eaa54b7ebe52a9425b68783b88192023b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr106.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr106.jpg",
          "hash": "cce54ed5f36137cfd60f49547c66f46159e0a873eec3d319db5a3358ccf421e0"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr107.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr107.jpg",
          "hash": "12832fe6b8a403527d1a34689a20233b3caa6474a694f3b6fa70039118fcc8dd"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr108.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr108.jpg",
          "hash": "a1227b9e9c1db79638ee0f7a5558c45ec17fce1e0c2c2a815faa911a79b29149"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr109.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr109.jpg",
          "hash": "aec0ba07be6a4182ec17d6c91d5a32afe1d1947b834d5585f600f3b6f8ea796b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr11.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr11.jpg",
          "hash": "fcd315cb601359162c5229f1a494c76b99d4db741829e9c625621cf401be2b90"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr110.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr110.jpg",
          "hash": "6cd301d252b3eef1e0cc539d5676e13a938b61faa9c372c8a8175e67b414a2df"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr111.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr111.jpg",
          "hash": "1012e47e4f6e2517c5c8530cd72e0fffe440ab5a3eb5bde0e354972371be0b61"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr112.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr112.jpg",
          "hash": "eb2a057a54cf5be4040e228ff7eb55a0b8108c7cce056fcb705b349102c22f44"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr113.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr113.jpg",
          "hash": "2518df6b327cdfd8dcf92e15fde0914778636ccdc1860a38dc50af4324da4d60"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr114.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr114.jpg",
          "hash": "6b43bfc4a81624dc79d931cbfd14f36c7639963cb7b38988e1cd8a7e8114b8f9"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr115.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr115.jpg",
          "hash": "3db52f8eb17a9a5bd3ddd717c9b89845cb6e075dd3c4d2d13bcf668c3d93736d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr116.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr116.jpg",
          "hash": "5fb50ba8a3d2c9187be487d76085637deab7282f5aa20e0c910d25a8a08c9dbc"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr117.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr117.jpg",
          "hash": "31885eeb1a8f42489dd376aa9d72ff1e33f66320f3d00e450fd96c3253b973aa"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr118.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr118.jpg",
          "hash": "d6bcd9707a663593351eb90b627d688878792fbd776f56e5c0e4002e896e7181"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr119.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr119.jpg",
          "hash": "0bcd0dc816541182fe8872545148639321abd1bf5ef905d5c836f06930725362"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr12.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr12.jpg",
          "hash": "cbfc23c35d93e56251a3380da082157843b8fd767ec2a2cc14d07877d32dfc7d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr120.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr120.jpg",
          "hash": "a8f0c3f3934a91e5b8efbccb923547f4cca2afa21baddc0279194ab7e66e2259"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr121.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr121.jpg",
          "hash": "c94367e9617775e26210ace4126afe2dba2c88b59f6c54a19d576e34a8a33528"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr122.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr122.jpg",
          "hash": "1aeb3d5784e4b3e66deffbdfb4630d2b17ea05308988cef930e61d0615d4929a"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr123.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr123.jpg",
          "hash": "b07697834d9777022e1590947fdd0c60ec79c9ad69bb6d521975e46daec76c58"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr124.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr124.jpg",
          "hash": "77d4e4ddc5ec58675d58a57565a233481ce09f33c5f06807108a767f8ddf8076"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr125.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr125.jpg",
          "hash": "29b5fe6510b96f1fb947bd8bcc539f5cd4d097c13524885637579425bc79559b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr126.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr126.jpg",
          "hash": "5a86ea15efc9b7f63f0e30d88239f43785959151dcf251a98d5a96d173ebf680"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr127.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr127.jpg",
          "hash": "246a0fed1221b0ec794ccbee67fad0def332d41caf77719cade26acc37d6c61f"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr128.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr128.jpg",
          "hash": "edcfcfe2f535f6f1e47ddebb771573f35babae99eb0edcca131b4636ddcf89e3"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr129.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr129.jpg",
          "hash": "ae0162276f2e32bfcdfd9c76f04e1de01b2ba4703988090a2a74c02cf43d3c33"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr13.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr13.jpg",
          "hash": "bc09ba3175d240881eea62eb0e7c7c2506c75d9162fa32c6ec113842bf06ccb2"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr130.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr130.jpg",
          "hash": "3ab1ec7cbba522e186b172c6052bde2e8f72b93b879a638394bf736ffb611001"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr131.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr131.jpg",
          "hash": "408a1f221fee460b5133d194d7f32180c1df75d7161058fac41504a8d2a6e1ef"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr132.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr132.jpg",
          "hash": "359a60241031d88d99c2b148477b12aa0de0205fd93c99d4fd67cdf196be1324"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr133.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr133.jpg",
          "hash": "1cccb27893bc2bbedc141f97f2282b251580774a48d8fa12f59f1d54ff0e45e0"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr134.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr134.jpg",
          "hash": "7e3756d4eb3d638212d8aaab1c6878ec1d27db224182f5a0025b894469232e3b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr135.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr135.jpg",
          "hash": "e292d14aba85c95a51b0e10c10a6ac4a3eb32cb3a3317bb5676543569711d1a8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr136.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr136.jpg",
          "hash": "479faffc50e71d80eaa23777db61df593f563a7868cde247d1355c52889c36af"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr137.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr137.jpg",
          "hash": "c9b2cf7d91083be145f42328096b3af12c01788b9d45e30889fb5b238a72419a"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr138.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr138.jpg",
          "hash": "b1b9ffb4f9769bab9c5e81e621da4f43a3d112b74fa63853f318c412af4e2a82"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr139.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr139.jpg",
          "hash": "db3f4d6f6411106bd625db5b63d4abf8efa9853737a14d416114b31af5ef42bf"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr14.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr14.jpg",
          "hash": "b35d509d02097667afef39b4640a72128ddd5f229e64584a5d4feadfba674e82"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr140.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr140.jpg",
          "hash": "3717580e8c00461c31ef65dc795ebb36027805a1575197348e1f63a1b263e8e3"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr141.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr141.jpg",
          "hash": "3f1bbecb1bf5fe8a4c3b27bb7e1394da47d2fb4963ec1ec297a217954ce2f579"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr142.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr142.jpg",
          "hash": "df9603d134f8e0581e688cf5ec09476d8318cef8a25244c6b3ceb98070d79253"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr143.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr143.jpg",
          "hash": "5fb276c7474d2765a52127a9fc200717771f6f5c64fa6bf90ca4a94bab43da2c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr144.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr144.jpg",
          "hash": "84e7e2577ad7b3ccddeeb3cf9a0eea15353794e93200653217a24808b055d54d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr145.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr145.jpg",
          "hash": "93a43c0e2d1eb908b618d388cfffc442b69c6fe133bfccbdf376a615fd7ae174"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr146.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr146.jpg",
          "hash": "27d6190e058256215cf8ba59f208d0912d0f31720108fc42a7dd4031733fee77"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr147.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr147.jpg",
          "hash": "a43d13125fdda795ae6a093044ade135d679bc697d59766c6d07b0d0070566a5"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr148.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr148.jpg",
          "hash": "5bbefd7c1e7e3cb2f7e7f3a53df66becf14714c5a73547c898024d5d1819f139"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr149.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr149.jpg",
          "hash": "140dad0c5b81c868939f0aef7887a203f688603c9b3e95b78d679a8b86dcf966"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr15.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr15.jpg",
          "hash": "e047f989bdc5af140bd747a55466e205f901027ef4005e41339e670c2422360b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr150.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr150.jpg",
          "hash": "9c533cf98724a7a179a2bbad3a36ed0bba895c5e0638768a919ae7f3f6fd93c4"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr151.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr151.jpg",
          "hash": "e1012fa1a0ddfe34cee859c305097b77f14a568f9c9ed0314f196615d1f6ce32"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr152.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr152.jpg",
          "hash": "1cc98a6101731c2a3890f6c0af993caa424099e6481301a0e00e5694f447b195"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr153.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr153.jpg",
          "hash": "8c9a983b60ce2fba919021b6ac22bcb9f8e4f4c173d854bce190ede0cc13a65c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr154.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr154.jpg",
          "hash": "6c8f43495aa64c0912a6f56452af2f0a7ee2008eb7d67ccf5787e2c9e95233d3"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr155.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr155.jpg",
          "hash": "119bbafb81687bfab41024d40a90c4d9318b72ef55d85222a14067429ce4d0c7"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr156.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr156.jpg",
          "hash": "dbfaee1267b87e5f5c02e55ed947792c86a01d5d0ceb3398b7417ab0f9de4c23"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr157.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr157.jpg",
          "hash": "7fa34c0b897dc442fb95e59f866549d5552e603e195a27205bdd563854c97ccf"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr158.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr158.jpg",
          "hash": "dbdcc530b3782954c1ccfdd3d25e27f4cc8c11ef50fe519fb96279753f6e9644"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr159.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr159.jpg",
          "hash": "e758b0a564047b60d5153b7d84ce7c3da441213019d4026f05113f8376ec3029"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr16.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr16.jpg",
          "hash": "001d1dcbe39dc8c5c365328ff422455f4a1458535c3818f3e5faea79beb54b7b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr160.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr160.jpg",
          "hash": "946d4ec9df1b7f249507200c8d4b17eedcbf990049e7c9ab1ac39cee2285f83e"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr161.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr161.jpg",
          "hash": "a3b3e16b3bd4007d1b8e70d63c2ae32e26764c3910fff77d01f18eb25ef75053"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr162.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr162.jpg",
          "hash": "ed561b7ee213fd259fd206212d0c79c99a8600660127c2cbcb921fe4451feac8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr163.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr163.jpg",
          "hash": "6587eeba83002cbb27996d81eedd24f21c22ffa9644885dfead71345eb2e1829"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr164.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr164.jpg",
          "hash": "87e364100d59f808fda967aacdb121873a5085f4682eec7cefd16f35f436ae80"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr165.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr165.jpg",
          "hash": "6f46d8f5e8f3f2d7b75d33afa1a9be90cb9240f4e5c297daeee023840ca5e9fc"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr166.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr166.jpg",
          "hash": "b37df995632be46defc0436387fca75a5b2074ab32587a5e29278a66d40f8d53"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr167.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr167.jpg",
          "hash": "ed6a4e9f03ede6305a47e5d7f46df0e306442e2ae695f9b5ebde123c3e1eaf2f"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr168.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr168.jpg",
          "hash": "149ab8703d904cf7acf412785ae5b95140a7af1658566701829690f87771c944"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr169.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr169.jpg",
          "hash": "058be7cfa171070262146e8fa0d79eaa76634e7a49865d7c7d05041ba82581ae"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr17.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr17.jpg",
          "hash": "45722e79e61d07a1eca50c432bd3b976f9f4d134b718e59972fbe696086c6f4d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr170.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr170.jpg",
          "hash": "af790c723b14a40785e611ec8fb603b246ad7323ce87130afbcb49f16ae072b8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr171.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr171.jpg",
          "hash": "93add1766047b62ff83df413ed9a50888697b9475ddaf44a32efb6af2a432cf2"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr172.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr172.jpg",
          "hash": "7e4b1768fd49ded19b7ac95e3edd4d3d2d83a416c973a4a0f638c4b8b0b29320"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr173.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr173.jpg",
          "hash": "facfd3f55a17b9221f191a8b9a38c9f539414241b62ad7cddcca99b408537a2c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr174.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr174.jpg",
          "hash": "ce3507f22c77813ffcfa57fb5cef83642d68d3b30fd8bfbb42d57805023ebf65"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr175.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr175.jpg",
          "hash": "bb4c33a1c75d6b5f5f4279d30a2a7aaa14e227a6c3aa7654fa79d46038e5d37b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr176.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr176.jpg",
          "hash": "c16447ae3b90d72ba8cc93057d0e60fac7facd88eac481b85584df81a3bb439f"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr177.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr177.jpg",
          "hash": "165822fa8c70437af2f8af425cf4adc6067ad1a3ecbcf7cb00a44a21977c1aa2"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr178.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr178.jpg",
          "hash": "b01983fdd8628a4f6128a517de7d1be092d713937724b3de1e8959796ba4c906"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr179.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr179.jpg",
          "hash": "2fb8e53e90f8e559cf36675570feff895ed4d0d82b2cda756aee81272e002dbe"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr18.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr18.jpg",
          "hash": "851dbaf46b45ad8b93fdd3b5862252acb11218d20b4bba38eccf44d0928cb6c4"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr180.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr180.jpg",
          "hash": "765e407f40941c7e846eebea2da34a564cac82fcdc5dfdeb3d010aa9db8d4a17"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr181.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr181.jpg",
          "hash": "a7a22d9dbb6f3b3349c32788bed450805508496a50fa7c18e04ecc072224639b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr182.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr182.jpg",
          "hash": "efcc74a6fa671a4a5ae541c0a987bdb1c963cd29261dc7536cd14ca2f25b77a8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr183.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr183.jpg",
          "hash": "1303a3031ac3ab47ad4c704b55ac1146836e1fe4e521420827f9f16e89e089d1"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr184.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr184.jpg",
          "hash": "2ace047d922df2557ead565c38548a25bde38102d11f96947c5800a1f5f229c1"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr185.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr185.jpg",
          "hash": "90dc813ddc393c71258c2cb4abf8c980d4a235b4143012fadafb3d731f3eda55"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr186.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr186.jpg",
          "hash": "1131c2cf99006e490f3ae565087d10e966c1e08d16411e3609d14fd8d331dad5"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr187.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr187.jpg",
          "hash": "36abb20e438f1599bd1f43fe537c4a76f1b675f5ffbc9875cb09d77156710a66"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr188.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr188.jpg",
          "hash": "d096c2572971c7c4b0f7f669aeaa49d58203b54946e48dbcad6a66d4d5c75cac"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr189.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr189.jpg",
          "hash": "84676d4deef8eb03fc8538602315d32b1d92f1c8e68ea06f294aa9dc1f603d5e"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr19.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr19.jpg",
          "hash": "530407ef3a864f3a055807c00f291760c8ae8052061ef4927f9b7dae0d6ed0e4"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr190.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr190.jpg",
          "hash": "e5efb93c54893cae4604c3c92c60adc59cc6417e5610c32ac0a508a0c81b2098"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr191.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr191.jpg",
          "hash": "29adc22a380b3dd34e30c5a670853a8536ad4a21c01e5c41fbd44aa297891fe3"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr192.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr192.jpg",
          "hash": "878b024987c87f0c8eadb34482ff3284aeeb70edf68096cc088662b2a456326a"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr193.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr193.jpg",
          "hash": "5c5355a8253cce80b18393c2b948ab887dec96b0bc2a9ef56fd61a59a0efafa0"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr194.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr194.jpg",
          "hash": "396928672c45f9f8a54ce9529cdf003d78f9a90780669ca815c5736d63bf41bd"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr195.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr195.jpg",
          "hash": "98e6f8c1ddd6aa2c7de578cd2ea151a23b0220d7f8448d9a610e1dd2853af332"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr196.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr196.jpg",
          "hash": "582c5d26de18e157755f74d09096516542634681138578be23eb876f591ca426"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr197.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr197.jpg",
          "hash": "a57efba91dcb7c6cdb2cf6a6eefe5d47d8f827db7d90caf6b15f80d4412a73aa"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr198.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr198.jpg",
          "hash": "68636adc8b71b25c36822b376619f17eb7688d0d64d6874a21285b4e06bd3e2b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr199.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr199.jpg",
          "hash": "9f7fcd9bc52e689f1742f2290ca43ffe2f8f4b4d12263af78cd39518a70d014e"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr2.jpg",
          "hash": "5550bae88acd3a27539b801d2c0730b8a6f9300fd1ff39fb7326deefa0150330"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr20.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr20.jpg",
          "hash": "7d2147ff556ae34a1f20047f3859b953b518f44d8c8167fcabc3e8af189d6485"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr200.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr200.jpg",
          "hash": "330f54cbd44c837181a9181ed4beb8bf39ee2fbb477586f4adf0bb92c19aeef8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr21.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr21.jpg",
          "hash": "06ae36e59e07e661ac390b6b27e7b84d22940cbb9133a49fd2a0cceeb12e63d4"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr22.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr22.jpg",
          "hash": "83024591cad4ec7fca0c4ebb1b88f1228424def09fe0cc6819cb180b4ce23fce"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr23.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr23.jpg",
          "hash": "0a1c45460af47c7ccb6b5f90235400e9770549d2132480d7f5ff3439f3c974ea"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr24.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr24.jpg",
          "hash": "ab49666d2dea6e4e08cc6a7f36dd3068988db480b6b741eff93298a6d2060ff7"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr25.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr25.jpg",
          "hash": "21d1160f67c062462632fc58218f9b12cacbf0c9c07b58fbd443605a74cfa86d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr26.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr26.jpg",
          "hash": "9c5fa4e1ec262d66cee3214946df47eddcf879072f3b1ed7292d0c2531ad9f0e"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr27.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr27.jpg",
          "hash": "b59aa06902af1f1c5b59e7349fa6ec3885a46889fada288b2550defd1415f023"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr28.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr28.jpg",
          "hash": "a115dee83d2b639afc85306c6b4051e17e4623ef6b039f0d6106d3db0893d5da"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr29.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr29.jpg",
          "hash": "aa0b098998baf3378f116f1599cf6be816b65e53f0273902e691604c147d612a"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr3.jpg",
          "hash": "075a4e39a55b094014eb06929e3e5057daa3dc1d9fd83accf1042ff40cd5188b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr30.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr30.jpg",
          "hash": "e681685308e888aeb5f79027f07207df81700bfd4c887e907093d5667761a486"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr31.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr31.jpg",
          "hash": "292886780e5d933e5ca4da2494b9d824200b183a7635910807ac6c45740f587c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr32.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr32.jpg",
          "hash": "209965f793c4216447f818992e1c49ce7df3fa9eec2f2e15a6f9f2aee255ed05"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr33.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr33.jpg",
          "hash": "c4058695c0850a7b846a658bde42881e86d075f522466d72158ce5ebaf9f60ad"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr34.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr34.jpg",
          "hash": "2743e335480cd4172355e67ef5b23bdf505a8ddcc3a93cee6833ec898ce422ff"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr35.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr35.jpg",
          "hash": "3dc408482e5f4d2eaa5509f34036674e55de788ee5975dcdaa5c4be863e8bdec"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr36.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr36.jpg",
          "hash": "6bf7c26c04d06d2fee0724c42e9694117cab92e4b085a6ab0e214eb610fde06d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr37.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr37.jpg",
          "hash": "efd2b02afaa5203d406e1bfa8fe61bfbe539dd33eb8948081fb1ba3dd5aa04cb"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr38.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr38.jpg",
          "hash": "7fe99861876d8b54c8c0f9081824fba92797652e117f623e1a84d411f9b797db"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr39.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr39.jpg",
          "hash": "fad99cfbbaeca5beb7318165e0b54eb40bac55c40e265c13154c34757b05d9b1"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr4.jpg",
          "hash": "29e61d634f3e535e1add2df1986504a2c6d8926381bcb022ad551d6e80a11692"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr40.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr40.jpg",
          "hash": "ab5cc5d0fbfe413b40417e59e393bf80fd4de58af02dd2c0b1bc7fd4100aa12d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr41.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr41.jpg",
          "hash": "975938ac1d2e8997c709864a65747ca87a09535a6ae2f2091bfe01538d7a047d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr42.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr42.jpg",
          "hash": "e2aefa0c9e82b9a266bc02e5e5d74fa9a3b8fefd6f65937c7e65c35f14798fd0"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr43.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr43.jpg",
          "hash": "9617d4916c4c4da94dfca123d92da01ed40cfa0920dffbe7e1858aede85dc4eb"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr44.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr44.jpg",
          "hash": "0c925b758013548b570713394bcf3fca13b918545a78e2c33e8d9e3832d2bfc2"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr45.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr45.jpg",
          "hash": "d9df04145f81fd462a344cfc4b83de5d62f39fa030b836585123fbb774669cc8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr46.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr46.jpg",
          "hash": "061fafb2adc4113b6a8d171988301495dc18900c255c42987b64b3a3399bfa72"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr47.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr47.jpg",
          "hash": "7c7ff2639f7059967abffd55a4d7733445938ccf7d220612dfec7c9064095065"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr48.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr48.jpg",
          "hash": "806532ef01ae56c51478eccbe39ecf100fdb97b681e0e8a2990a7468eac1e3e8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr49.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr49.jpg",
          "hash": "da99d2e776dfe9ccb1dec41149dee87312d43257d298608b6b64936c1fd0c0e6"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr5.jpg",
          "hash": "d52bd3d7012aff7c98fffb2cda37c84bf67e691ab351176249dc9d69718f80c9"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr50.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr50.jpg",
          "hash": "4da9239de24bf7b9ddebc996bfa61ac57f0602426121dd6f8c8806271bcef907"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr51.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr51.jpg",
          "hash": "d9d76285bc1a74e14ba7a72431e74d939a14634d35096954543b4aeb520e61a9"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr52.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr52.jpg",
          "hash": "d75f8f44e3578c7692eb7b297886c2199a85000f0f135e9e12ab5e91874b8f92"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr53.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr53.jpg",
          "hash": "109e5e3b5e2a4fca793db3f43eb3434d63b6539251196273d8efa2d2570d7033"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr54.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr54.jpg",
          "hash": "14a4bd2ed34403642ca24ca946bcce5e3e2696d2decbf92d1998d125329b1314"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr55.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr55.jpg",
          "hash": "fc9bc556d55f64c196a3327eedf588a20a785784f5e040e48c5b1aa2eb3e5e2f"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr56.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr56.jpg",
          "hash": "de3f3d84c708a836d55716e24f5cd627557bffa05f1909a8e9136f0666f92d3a"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr57.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr57.jpg",
          "hash": "741d8e2b79f6f93949271c3ee089ca79ea6d0764c5def45540fcd7f3477a26c8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr58.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr58.jpg",
          "hash": "cdb10935bcb134ab9e3ca05dfd9a68d60fef26594983e5c99e38c4ff14db2890"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr59.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr59.jpg",
          "hash": "30aa043e3411e991effed399b85439e53d49aac9313d6a6e00fb79b2e9f9d5be"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr6.jpg",
          "hash": "1ec41661318f0d40e8713d7958482437f4290747cedfeb2e51346e2058430fec"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr60.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr60.jpg",
          "hash": "11cfc7f1ff924dbfc85c505e25ca37af58e69699bcca33d7c87feeebf6213c45"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr61.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr61.jpg",
          "hash": "dc5895eeaa308e1d707b3771dc3b4d29ed1cf7021717c1f3fc45a8d5c2aefd51"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr62.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr62.jpg",
          "hash": "19d909c15ba96fbbb9e34ea3d5f786ea91b3e2d79fa37c5b8bdb9e881286b87d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr63.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr63.jpg",
          "hash": "206ac2469cd16c8fd1395b41fdfb92d37b4d1e37c33dacdf5d4e4752fab4ab12"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr64.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr64.jpg",
          "hash": "ec326ec939f599f4b501b243f957db64d0ad9f7f0bd866599a194565372537b0"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr65.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr65.jpg",
          "hash": "3e78299d985b56be5fb3e895097463012e89c7b8ff0d2c09fe90e4d6244845e7"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr66.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr66.jpg",
          "hash": "697edf613d80bf4254868eadfc56798097f8751a965b1bdddb23fec7429b279c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr67.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr67.jpg",
          "hash": "cad0af3f83309951690393f53d05497567211c22aeebd7aa89c5a15018c44894"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr68.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr68.jpg",
          "hash": "d72ead29d777dba2541afd3df2f67a3eca038f5bdee8b1295a2c53c945579eb3"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr69.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr69.jpg",
          "hash": "ba8c71a70cc989e6cb798027558d9e5a9535fe1aa54dbc051c86ce60faff17fb"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr7.jpg",
          "hash": "7dc8b6171be766dcffebc8cbaca061199e8838041211884a2f04b5026034f5c7"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr70.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr70.jpg",
          "hash": "6ede3416bbb6623f2f7947dae09536ee4b4acbe0981f1ac3d70dc0d619e055d4"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr71.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr71.jpg",
          "hash": "591846abcbdd8c9a5b74414c1ae98080563e689f0ad7f2452b168795d4caf180"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr72.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr72.jpg",
          "hash": "fa3a7e1cf299600250a16e2977873fe7e37dd1014a28fab0633a34b5cbf9cc40"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr73.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr73.jpg",
          "hash": "26ec4628a8691d8be665e470ba0fa69179c3d21e40175fee61959a33d89830ff"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr74.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr74.jpg",
          "hash": "9fc76b2dbc35ec9b2c3b1b0180cfaabce6a1be031e17428bfd9976cc59e6ea0c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr75.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr75.jpg",
          "hash": "f45243b9af8e2d27a9d23d073e6e3edcb86263f466565bbdfad189d12a93dce8"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr76.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr76.jpg",
          "hash": "3821634f024f861ad1fc45daa405f94ec80b33e696ce7118ab3a7408c6f56dea"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr77.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr77.jpg",
          "hash": "41727c2a287b296b8d99460486793b212c945ee14befb82a0f95ef012fe3b6c1"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr78.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr78.jpg",
          "hash": "5630702b7c2c3ed685bed05c9ca0596cf9155783f04813dd32d3fc80d827380e"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr79.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr79.jpg",
          "hash": "a7003b72b569385bba7e576541f6e05d4e7af03d7093c1a9d896a22a18b3d4f2"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr8.jpg",
          "hash": "be24175ec22070e2580ff02c53bea948863939f362155f9debe69a4e27715177"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr80.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr80.jpg",
          "hash": "b6bfba3c73165eb41295531cda4b4223653bc3158b45d856c5f122c2dc46d2b7"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr81.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr81.jpg",
          "hash": "5ba3f316a0d687222c127aa802b4e158379adde013b7670406c523fbbc34813b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr82.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr82.jpg",
          "hash": "2d20dd89c9e32681564b0c4149cee12d0f40eb4e48dbd85d8086decca88b7bea"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr83.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr83.jpg",
          "hash": "cfe1f859e4b127a7beaa9ce941e65d83bd7f6c61d9d53c2b7af3a2ffb40d928b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr84.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr84.jpg",
          "hash": "dc1e888f2142c3a36905494886bea20000e1e5a2d5b4a5305d13edaed3ff7f78"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr85.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr85.jpg",
          "hash": "a9967693c4da97f36d10d930392f572f67893c4a7dcc7358a703982b5c36ba4f"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr86.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr86.jpg",
          "hash": "7f6ccc6cb6a2bc0f4989a1bf5c3b55da4be723144fe1b9f29278b205113e3f78"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr87.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr87.jpg",
          "hash": "963d32c28bf51cbc4928778782196f34aabd5cec6874cb210f3a15714fcbceaa"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr88.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr88.jpg",
          "hash": "d50c59dd9a0ce8a721bd8a86ceffb14c50f4d9370765fb81fd9d184a7c6ac374"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr89.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr89.jpg",
          "hash": "351987a70996cc1d71714fc993aaa3df87ac606ee2bcb99694e8a2b45374637c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr9.jpg",
          "hash": "ba35954b1856850376a293ca3837b561e8b087446b8987ce7140f7bd6d41cc9c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr90.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr90.jpg",
          "hash": "835ccca1fc64ee2328c6d4de436e59d242f57094fb52201a9d3df362223ab93e"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr91.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr91.jpg",
          "hash": "fba6d94ab9db5d0971faae328ae7df7b080f4637edc03399fc3b8eddce639993"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr92.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr92.jpg",
          "hash": "c407fc4e32dfdcdc13e6ddfba3e8da83e4a729447b09a351ee54ed47c512f40c"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr93.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr93.jpg",
          "hash": "bcdfb81a7e9f9c04a2f6ceb49e9b37078ad14ec960425395a49dd38ab99ebf09"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr94.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr94.jpg",
          "hash": "41b13adff86fd9b1bf5d7ae26429c2272c4e2cd122f708a976448132e453feb4"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr95.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr95.jpg",
          "hash": "d7cf71fddec3e9538e891573166ee0d47c4f12db0d02834b098c2657f7081cdf"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr96.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr96.jpg",
          "hash": "eabccb5f1f2adef1f353841aa5e3d6154fd72c3902b4f955c66527cf9cf2632d"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr97.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr97.jpg",
          "hash": "aa9ae633b4de75baffe3221f7a781b1931906011cf8c08c753223668f633ec8a"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr98.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr98.jpg",
          "hash": "4355d2629456152e2d30cd27db8bdaf79596c76df4f7bfe52c4966cc8d8a597b"
        },
        {
          "path": "assets/Keldrasil_Sagrado/ticket/extr99.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Keldrasil_Sagrado/ticket/extr99.jpg",
          "hash": "ba066e25d6cfa40ae67aaffcb7f9dd45116513d4401c035fa68786e6546bb93f"
        },
        {
          "path": "assets/Moinho_Sagrado/background.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/background.jpg",
          "hash": "b55258e50952cef07f0ac0d561b8b385dcc2a273798c0467eba140a2ad85102c"
        },
        {
          "path": "assets/Moinho_Sagrado/segments/Espi.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/segments/Espi.jpg",
          "hash": "ea1e95d6b8c9780ede079aabbb6c04dbb9512b597fe2ff8524c0b3bd7db88114"
        },
        {
          "path": "assets/Moinho_Sagrado/segments/Hix.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/segments/Hix.jpg",
          "hash": "66fe4d1f9dac577953f3d37fc6095e2aa2cf0a2b0607a6451fabdbda83071fca"
        },
        {
          "path": "assets/Moinho_Sagrado/segments/Legrin.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/segments/Legrin.jpg",
          "hash": "1e3d12c5f9d2cb5f2420aaa22dbac184884c73a02f1a6696f04c19441b6f8b82"
        },
        {
          "path": "assets/Moinho_Sagrado/segments/Leo.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/segments/Leo.jpg",
          "hash": "3ace3496a1e4d692ca72c0abe7402c1b0cb1113df52d71fd2bf0ffee23110591"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr1.jpg",
          "hash": "a42705c113b6bf0f338a81bf2d7f20bf0dec7e2565f182ae9399a318b76924e1"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr10.jpg",
          "hash": "e6c23e0c743f818c7399ebeea894c031cb439d5c7057dd0a78a1acc23668a6f2"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr100.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr100.jpg",
          "hash": "b52c57930a77960991e0b119a1d2a99a8b475e2c6ebb7b56fd44e0ad8fe6f00f"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr11.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr11.jpg",
          "hash": "25d7baeca9e7d3224256d8508d9c417b19132d5eb70e82d9bef93895858d794a"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr12.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr12.jpg",
          "hash": "2f027a5dd37e272ecd52a35ef763b093ed6e5ab4400534af98caa08a76427d95"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr13.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr13.jpg",
          "hash": "9beb41ff9f14b4a751c7f3f0eaa279720841abdd8281691eccf6ebd2f50c87d0"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr14.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr14.jpg",
          "hash": "4e9f24842d897926b60062508af2359a506534e5abd79a410dba505d19ab1dd8"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr15.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr15.jpg",
          "hash": "4fe4e4d674cbb344fe6cf208d0237ab652e216a3636ef18eb839be977eb16a9b"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr16.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr16.jpg",
          "hash": "9dee386de701e74d8fabb3b2dc34e0afe5c3e7534a0641bba473eb8e753963fa"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr17.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr17.jpg",
          "hash": "212fbde6ee80b502739ae4fb4baa74bfeb41e55348077c1589116a961c41c821"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr18.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr18.jpg",
          "hash": "47f43db65837352e7bc7460c67f200711d50e3bbc9b38bc17b72348767ae23bb"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr19.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr19.jpg",
          "hash": "ca5a0683de4094fc45d6791748e53848edd3e7ac58b1ed6dc042cf6b4e566fff"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr2.jpg",
          "hash": "af2e6880138be748f12fafaaff5172a3ee0e469ad9488c46d31e6dd2386906c0"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr20.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr20.jpg",
          "hash": "9afb03422cf47580877d7e62df3fa70d2abe992b5b780e7bf7648985ec73edc7"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr21.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr21.jpg",
          "hash": "1e9631d8fc0abb914895df21134a29fa7e8e07f7cc2f56cb2cb8be0e71bf24ef"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr22.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr22.jpg",
          "hash": "526f8956b4f6e7606da9c01ae1359821857a46bce2eb248319fbb6ff2fa09c1e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr23.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr23.jpg",
          "hash": "1b2d68f1648dc486dfd667bdfb490a831b1854867148a47cbdd1528d4fcdd4a7"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr24.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr24.jpg",
          "hash": "7779a6d83bc6c0aec075d978487a11e0eb353a7b1ad5877f7f1623a8bd2e8bf2"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr25.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr25.jpg",
          "hash": "b14cd8bf7a05e241c3d6cea79c7c9296bf037d3a1bcd8fba6af1c98930e3bb29"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr26.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr26.jpg",
          "hash": "a4178d7bafd2d3ac529d356958ad942bc54afc418f3967c6c23bcdfbae9a759e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr27.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr27.jpg",
          "hash": "acdc3f0493a19b460d297b303414ba541f231cb080710e15d6711ff7eb2b24cf"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr28.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr28.jpg",
          "hash": "8e6d3564423266f6fe96ad18484f20a85ec77f37700d39415afb3959fde34129"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr29.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr29.jpg",
          "hash": "d2e5fb6e139c6d1a9ea4e8a310da1f5d0980792f59480c2791c5f9df132bf0c1"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr3.jpg",
          "hash": "fed1a5a46c40dfd88c8554196a4f40d13a5c50b5ae0af43c97aee8fa59cc991e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr30.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr30.jpg",
          "hash": "053496a4d9f46a221d872e52b636f566a4cad17e69cc4cd4e84ddd30ea7974df"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr31.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr31.jpg",
          "hash": "e2e823a23ac57fb377c1aa72ed52ef4bd8fe02549576f577cd42b1ebb2c9145a"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr32.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr32.jpg",
          "hash": "ca0d7af09c0e932ca2ec3b78e7254952afc0ff20eaa9194b66963c82e52f0f0e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr33.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr33.jpg",
          "hash": "7049796e8931094978e329c81ece5dbd6de04b8307059a6fef205e1e85d9cce9"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr34.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr34.jpg",
          "hash": "f69e38747af02d6161e64c8083f471e644f6b19c1dc5faf89a76ac467d641a07"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr35.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr35.jpg",
          "hash": "9a327431f651efec748e142ac92f324d507b059059425cef14e0d867cc711fc1"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr36.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr36.jpg",
          "hash": "96495686acceb8b2f91ca03b3f327359f74a15b77613e645c63a274256ee79c8"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr37.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr37.jpg",
          "hash": "1bbe2ab0fbdea79d29007e1f8b085746c726eab90d57fa55b2f1f266f0fcfb4d"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr38.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr38.jpg",
          "hash": "45460d8dc7f82318679169a8bae1efaeac01f4b2d4eff55639b47e3f3739b048"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr39.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr39.jpg",
          "hash": "72f472ee8abbcb085b8c94553e5d2e3c1f3935f432cdbfec1375d604594b28f1"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr4.jpg",
          "hash": "6d191c8e891d938bf6fb683168a596640d88816b6478d003cbab97252ef291f2"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr40.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr40.jpg",
          "hash": "0b150b8143da11fa9b2677f3fb5deac91c9e9ecfc1724c62e627ec8afbe3281e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr41.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr41.jpg",
          "hash": "7d79e43d3c18a042dbd898b3380cb237e375b0a3847d1b4579662ed010f68ca6"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr42.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr42.jpg",
          "hash": "c5272a109024cd2e9f2a6fe0b1735503642518fd9df9d33ea005bc15a6d058c5"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr43.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr43.jpg",
          "hash": "25bb1b0a46e4feff078c0f1df9982aa825f76c36d4ae49c4ad0fe7a22d97f627"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr44.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr44.jpg",
          "hash": "0ab081db5fd18d1ba435db5d8766195431b856e715fac80c9a2fd1716934bebb"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr45.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr45.jpg",
          "hash": "e41bb3fe9160afaf3ef6bc5e2afa3dffaae6312136d9bf9307390db31681eba3"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr46.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr46.jpg",
          "hash": "4acd909585af75e44db5386651dfc2cfe01d0b33bd9fdf2f3d5d217d44c4ee35"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr47.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr47.jpg",
          "hash": "8823ce28af16f2fffd8f1061fe78ce7dc57c8f3562ab2d0bac640fe26ee6f91e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr48.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr48.jpg",
          "hash": "f98bce44657b3df79c4cd1cdde95dfe50d00fcfe8e6e1c283f5a932bc4913b9c"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr49.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr49.jpg",
          "hash": "35d0e7fc2dbefc167aba1b6947b04bfcc4dbf3e5511a96bb1826bca584b1dd57"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr5.jpg",
          "hash": "80f96592e970024a37b7cef037e80de53ab8c6a4303b934c4b90f192d2f929d3"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr50.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr50.jpg",
          "hash": "9f47ad43c2ed5c629db73ca44de5e56d9ce167680b441f333238b6d8769b8895"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr51.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr51.jpg",
          "hash": "ca0e8c208622f7acdb2d75767e7e2572ad3d5f10d4569264989ab5f459191c7c"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr52.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr52.jpg",
          "hash": "6de55391a62615391f3c77be4fa49518af893a8c198ef2b105b20117d9427846"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr53.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr53.jpg",
          "hash": "f20a898aa663bdb3b60a48c06f14dbda803842877ef06bdd30b27604670980d9"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr54.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr54.jpg",
          "hash": "94ddf4d2978e7e1356d5004f856d8749a5991af778c0547c525fd28a41a8615a"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr55.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr55.jpg",
          "hash": "31c71d5dfb659402a6dd604257c86a7460d600a29edb75119f857500af7fe8ff"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr56.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr56.jpg",
          "hash": "c34f860c6f795cd206d79fb6834069737c57bdeb48dcf327922c99534c5e56ce"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr57.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr57.jpg",
          "hash": "b041467b7de29721b59d2200bb83d46bb38727cd6ac032e53d8b44ea466bcf81"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr58.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr58.jpg",
          "hash": "cda5c5536bcc7721acda5cd07fe219727514044dc46b962dfc13550d6f75c795"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr59.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr59.jpg",
          "hash": "f6a66e2ec0b0dd8809c948c9470a5db75f90f6b9d45d64e9d73a3b2b4e24486f"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr6.jpg",
          "hash": "8438638da1b8d6eaba57520ad2d051ce197dd22b6f363aa71a6a97ba23d3f960"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr60.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr60.jpg",
          "hash": "bf50591a32209b86cc1f9f50c6b64b0fdb43fd30f2d617b02aff8c8393f41579"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr61.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr61.jpg",
          "hash": "94b5c0a373a556e3f811648cc8b373f4a494067eebfbd0130192e1a15ac0c912"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr62.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr62.jpg",
          "hash": "215d0651132ea2d4134b6942d2a6ff8db8e2721d87a5e2c6c1ff3e7c05f2e36d"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr63.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr63.jpg",
          "hash": "80655a6f6b7779ecc2684e911b1ef6e3c769586b0c299a1779ca72048a6ed7b7"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr64.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr64.jpg",
          "hash": "7a3c06e0a74a81ba1f3bfdf2ca1cfd287ae359e978498c909d065556649e8311"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr65.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr65.jpg",
          "hash": "e2c2307f34086cb40d140b7c64580f78b9098fb40660773a9869ab416c73cb19"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr66.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr66.jpg",
          "hash": "1c9d22895bc7c169dbd30d06a7cc8bf0778d4b8787ce800bf713ba5192d552ac"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr67.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr67.jpg",
          "hash": "8f541694ad625eb278159bbf5ffccfcfb9ad451c7d804b9e794cdb51fbebdfd9"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr68.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr68.jpg",
          "hash": "9d770b84fa29c35e168ac32d68ab51489dc40934dc6b694c0787a74366ef3cec"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr69.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr69.jpg",
          "hash": "4d5166c3e70bd11bfd98e5dec74c05dce0cb67489cfdd8816e788f8673b145e4"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr7.jpg",
          "hash": "b596d94f96291c93ca34f3e1cf272956c251cbf99d02743e669e5c2778895f39"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr70.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr70.jpg",
          "hash": "31282fab562a5c441dcc1bdab310777e5aafcac798719d6bab5e9120dcee29ca"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr71.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr71.jpg",
          "hash": "7f03656bbca974b259858dc9f7e1e9d49d2b562a33b33f84ff142366adbdc126"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr72.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr72.jpg",
          "hash": "88f48eb68ff3f86215991623b2f4c5ed039b7ae13b61dbdf9a700f7410f3a42e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr73.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr73.jpg",
          "hash": "fd6b5911b36835033ab2ae29bad326b32a4e5f5afc3cdb82e0011ab8ca756c2c"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr74.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr74.jpg",
          "hash": "6327a089c6532f739c4c01074b7ee31979aeced9a124f852745563a72668c24b"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr75.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr75.jpg",
          "hash": "17a3b983ddc511e584f2751a88d39c9af47b12d6b3e29e0a34855111c021ad13"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr76.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr76.jpg",
          "hash": "6bc9d1d96edf5392d921952135da1e3ee4ed998dc02d337b6cdac593d35a5a2e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr77.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr77.jpg",
          "hash": "1d9da12f21db023291ba3054e072424ce35417306f130b534e80fb6fae105183"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr78.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr78.jpg",
          "hash": "399e16ea056f2b8c07201a50d7f8b4287558183c51577a8664ad84c947185005"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr79.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr79.jpg",
          "hash": "d2fc5e8a6a0437088da81d906440ce0e87addf605510991c9908029f9ab2cd5e"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr8.jpg",
          "hash": "424d0f4b69af5d806616c13d7070beb69565328bf43d96c96021dd990669902c"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr80.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr80.jpg",
          "hash": "fa100e17c7993e638ea114a96cac1834f56831e535f3c76179b3652760863b52"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr81.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr81.jpg",
          "hash": "6f69dcf303e360d74acee3b2e503b68daab8ec242c944edbb249e95cbe434127"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr82.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr82.jpg",
          "hash": "ce824eb3e0b74e77ed1ecc4983cc0a31d7f5575c1b10f9177c51211293980058"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr83.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr83.jpg",
          "hash": "c6b4362d456b504ea8b25561b62820b3c85286e7ea6934452aa2492d2c37f66a"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr84.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr84.jpg",
          "hash": "5ab80dff8394e1f3fba1220cbd64e0c167b51edaff295787e08f428de021c6fa"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr85.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr85.jpg",
          "hash": "349426807c38d4f647f0621d1df5dab96b98eefbc6d76b972de78ed1d2254948"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr86.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr86.jpg",
          "hash": "0802a4b0a1d26801060712e79cffea9d89c8ca484e82ba2004559a101438d64f"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr87.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr87.jpg",
          "hash": "35b6f6d409b5e48dc74501a55ab9049aae0843d795288fd2598c0d458eac6685"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr88.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr88.jpg",
          "hash": "dc081461aa244630f2cadc293ce9109a556cd8e38f822dc12990f390f8f1f4c4"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr89.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr89.jpg",
          "hash": "d89b3b13f21a6ccbcf72885abc971d5244e86553af92fc32c7141b77c1bb1112"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr9.jpg",
          "hash": "7669d1cd6eb90fac349b293a350fe944ddaff6dfabd45050f90dab1640ec0165"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr90.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr90.jpg",
          "hash": "f6eb1b0c2fe98b2484f8c2f0fb6f62f2b03ff2963e1427d4ef7a90ffed92554b"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr91.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr91.jpg",
          "hash": "eb16a4fcec29779c5c7130b6e0d0d5314629bec938e4077b0e90ea292ef9c0ea"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr92.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr92.jpg",
          "hash": "98f5d24ef1459cbff933b39be9918843b213a98f0b99a04f0abe689ec001a01b"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr93.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr93.jpg",
          "hash": "66c0e78d3c94da5ea39f0a68419b235c53a315de7f080dff477395877aa9624b"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr94.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr94.jpg",
          "hash": "c0949a3acaa1f21b5a4ee74afd2760ea98a7327c146350c4991fa85f10bb3c18"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr95.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr95.jpg",
          "hash": "c59c5716f7cedfe36f0820789dde0dd23d89a381845f8455afc4529fb0c925a0"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr96.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr96.jpg",
          "hash": "813747a50474033d2fcfd9951a71dea54c361ae63c0c3b755109f7ca92c3cd59"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr97.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr97.jpg",
          "hash": "e2e789468a745920eb072d9e7b70c187189e5b8643935598e178b93cedb0fbc3"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr98.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr98.jpg",
          "hash": "a48e9eae266d8dee9b6a94740b6c012bf626c6f106843ac5dbc8fd87831c0472"
        },
        {
          "path": "assets/Moinho_Sagrado/ticket/extr99.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Moinho_Sagrado/ticket/extr99.jpg",
          "hash": "a8cdc39ef2c6be52cb74776696cadaf335061417dded1a3b4a453fc57b47f3f5"
        },
        {
          "path": "assets/Pandemonio/background.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/background.jpg",
          "hash": "964b02ce6ebd54a1a1b1326d200a1f558f493c546db78ff76e37b1f30500d871"
        },
        {
          "path": "assets/Pandemonio/segments/Commander.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Commander.jpg",
          "hash": "0d6cc436822079871435833c162c5fd87a0984c43c1a4ecfd100227361110403"
        },
        {
          "path": "assets/Pandemonio/segments/Corridor.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Corridor.jpg",
          "hash": "38973ee6a34e9f817b625991df5d6e59957433cdb124c2cf2d7674d8044a93a8"
        },
        {
          "path": "assets/Pandemonio/segments/Devrogan.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Devrogan.jpg",
          "hash": "f90d891765da81f16f7880df9adc9859e18b8bdba6aa74c3a71c43c1d6e50ab8"
        },
        {
          "path": "assets/Pandemonio/segments/Guardian.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Guardian.jpg",
          "hash": "160138f1cba9e5f4cc09ddf108fa8e11a5e02fcd1e25b9bfd493285cf47457c7"
        },
        {
          "path": "assets/Pandemonio/segments/Guardioes.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Guardioes.jpg",
          "hash": "b51cd04297d606c3e1f839e43e1663dfaf83165d37d2515091cd7b64cf4e388c"
        },
        {
          "path": "assets/Pandemonio/segments/Hall.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Hall.jpg",
          "hash": "646e9d0e1863565feceb851f9214b18d87ccb6efc5f3a418f3372855e2529530"
        },
        {
          "path": "assets/Pandemonio/segments/Kirinto.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Kirinto.jpg",
          "hash": "0f299230bebad466c48a9303b4283e0f9fde05e64b07bd71f1e803ba00a96c5e"
        },
        {
          "path": "assets/Pandemonio/segments/Manticore.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Manticore.jpg",
          "hash": "eb6ce0bd32985c9ff7e7cbd91297823893f9997db11da28a9467d4db2bb2037f"
        },
        {
          "path": "assets/Pandemonio/segments/Nix.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/segments/Nix.jpg",
          "hash": "a8254229892b4708373d8bd70368c895bb3973d25961f8bb47116d48c2461dbf"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket1.jpg",
          "hash": "66b80ffb60becbdc41ac5e2d16ab20bea3b539e5898e1312b009e07eda1f76aa"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket10.jpg",
          "hash": "9a94cfa286afd40c7ea21655a7a641f60333011d728979fdf5f81e37da0c0fe7"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket11.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket11.jpg",
          "hash": "9e594c36ffaf8a04d22e52f82e399a775781e55d0b949205ed6808b7e2672dc1"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket12.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket12.jpg",
          "hash": "61ae9224b7fc15f8aea3c3abac0517176aca31b728c94bd9d164a270cd6d14cb"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket13.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket13.jpg",
          "hash": "603b746696827d2f49a0b463ea9d3eae1757b01bf78620efaef5ee8715f1bc01"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket14.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket14.jpg",
          "hash": "a038966056f9901cfeeb441b689038f7901831ad8442f022401f60ee709e5993"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket15.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket15.jpg",
          "hash": "cb3b8c3de02c4ff5438d77761dc34e13f854f144a82dc6db483e46db16633d14"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket16.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket16.jpg",
          "hash": "1a61b1e699f01c1e2632b4e184ec4571c41b17c244cac03db00dd4e76ea6d272"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket17.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket17.jpg",
          "hash": "e4ede7026e2dcb364ae9f19099f1f7fcb640ba3c45947b2cac02d4e74e4366cf"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket18.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket18.jpg",
          "hash": "3d12b2852bfa374dba2f423bb477dc94a96bd5e6964068716ee8bc59fcc70b8e"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket19.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket19.jpg",
          "hash": "a007dc6c23f0ac9f5b6d77a6cf26265240ed2809d8f97e833c221b41033fd75b"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket2.jpg",
          "hash": "e60a1f7240bf1165e94e954a488c38e2b537140b64643ce69499df385b994a64"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket20.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket20.jpg",
          "hash": "5997e5e498e1ce5c5b86124ae375147dfd45fba67a9643eb6463d9f5d4526a06"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket21.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket21.jpg",
          "hash": "3de9baac5b7a71a12e942715435870c642ac3844c5722b3d58d52b7a0ffb8449"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket22.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket22.jpg",
          "hash": "c411b7df85d42c102ab1b01a27cdfee4fd73cbaf6a42bfd282f1431aa27b5791"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket23.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket23.jpg",
          "hash": "618163e4996bf8dce12f1f301509b707b50532ea4b9b2f0f34b47623a9d5a6e9"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket24.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket24.jpg",
          "hash": "c0b11c738ce2ca2a7cf6cc34b9253b310039985c4a1c81337ed72bff88410d64"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket25.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket25.jpg",
          "hash": "6135b6fb1ccb3ae0c89000b846ebc5aadbb77ac87e00f018fe56b48f2809f09c"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket26.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket26.jpg",
          "hash": "4cc9fdb9bd445ac78bd9f5702640f5e124fdc7f9544ec5cc9836b55a6ff2e28f"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket27.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket27.jpg",
          "hash": "98ae4dd7c1497c323555293e8b7a2d24da3d7888bbd0d2e8c9e37f49a2dfa426"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket28.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket28.jpg",
          "hash": "67648f3437ab1ce95841dee00292f2b08ccd81d5a8bcc8111a6ea0f23f4cc21b"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket29.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket29.jpg",
          "hash": "1d4a9fbb0587a892581127d49ff2a3b65a268773084ee5f65b3216f2f7488204"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket3.jpg",
          "hash": "2e17ed06551feeaacad3456591abb1c4158775ade81fcaf5986139e5ab38653f"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket30.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket30.jpg",
          "hash": "68c5b8e556f74a248317666e48d75e85e58e6d86e7d536fbf296eab42c70252d"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket4.jpg",
          "hash": "c121c6e7bf2f8e5984df94d68a3be447be4fd21c471389ce2172eae547f6a999"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket5.jpg",
          "hash": "e51a5779741770633ed98edc6768b16030e86be0394fb0a1a75f1b42d9b99994"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket6.jpg",
          "hash": "7937ea0afc24eac0415cbad318bbb53f9c6362b8fd560704dcfd202df3b50f2d"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket7.jpg",
          "hash": "a1a1a04596ed3d07234d3b78ffe7649d4978cd0a51cd5bb1157ac5b2ae50d603"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket8.jpg",
          "hash": "9aba4a3b29a9a74b44828585d641c9a856507ad8b5ae960137a2bc51b925ac44"
        },
        {
          "path": "assets/Pandemonio/ticket/ticket9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Pandemonio/ticket/ticket9.jpg",
          "hash": "1e3535febf462c5fe909886cae7cced79b5f98b520009ef59c67fd2144665dab"
        },
        {
          "path": "assets/Parte_do_Mapa/background.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/background.jpg",
          "hash": "9c3eddc0e2216ae7616de97b87959b632e45409f93241a579aba73920f52d79c"
        },
        {
          "path": "assets/Parte_do_Mapa/segments/faello.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/segments/faello.jpg",
          "hash": "e1993cca3c775d85ceee3ac11a39fd7e087cae8dadd770b0fa6bee98bb7da0ce"
        },
        {
          "path": "assets/Parte_do_Mapa/segments/jidarsch.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/segments/jidarsch.jpg",
          "hash": "093756ac66f8966cda938c7b28efd9de2e39c30b1b6ebca833eb8af3c7d282fb"
        },
        {
          "path": "assets/Parte_do_Mapa/segments/minotaur.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/segments/minotaur.jpg",
          "hash": "93a9e1d1537c8fe235656ec1fbca29e4213530572891eee97f03ec588cbbe67e"
        },
        {
          "path": "assets/Parte_do_Mapa/segments/pogarr.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/segments/pogarr.jpg",
          "hash": "2415886a5edcde3cc285133774e0afec245ef20939b54b7f158231127b5e0873"
        },
        {
          "path": "assets/Parte_do_Mapa/segments/rik.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/segments/rik.jpg",
          "hash": "002331fe8c38bcb9b9db4b69a5a8cce1a749137345a5e14237928506166ee282"
        },
        {
          "path": "assets/Parte_do_Mapa/segments/wurk.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/segments/wurk.jpg",
          "hash": "a9be8c89fb90b7889edc799ea45da9c550dc55b8260145be3f94cb68c56cf6f8"
        },
        {
          "path": "assets/Parte_do_Mapa/ticket/ticket.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/Parte_do_Mapa/ticket/ticket.jpg",
          "hash": "1a0ed035be2d5a98ef05181f9ecf5ca8a1823349fd4ad836a0e2915a88073d02"
        },
        {
          "path": "assets/armazem/armazem.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/armazem/armazem.jpg",
          "hash": "30aea525ac0620845f21a6fcea392550249d345ff51ba63c3297f7e00d3b3173"
        },
        {
          "path": "assets/consume_dp/consume_dp.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/consume_dp/consume_dp.jpg",
          "hash": "fcbc42d9970d7b933dcc1726f715f2557bd3c5b84750d165ecb63937fd56e856"
        },
        {
          "path": "assets/cores/aalti1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti1.jpg",
          "hash": "e2337ac9df996219682d87b7908721da37e1476635fa94ca21255241d78dee26"
        },
        {
          "path": "assets/cores/aalti10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti10.jpg",
          "hash": "45817dd2dc6d49c0ff8a809057005eb249b1a0f9857037e2f927f7cc1abeb767"
        },
        {
          "path": "assets/cores/aalti2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti2.jpg",
          "hash": "a42f060b64f6cf629b1a8cd321ef63c45f710d2cbb5ca40747bee5d0355ad405"
        },
        {
          "path": "assets/cores/aalti3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti3.jpg",
          "hash": "bb2a2e507b177e26b3ba46e9f38cc2431b7f733e316021e47b5b0b6bf56af7f5"
        },
        {
          "path": "assets/cores/aalti4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti4.jpg",
          "hash": "bb4038507023d70e4e469e2e86cb49a4d0c4fff5e2abbc37e6e8f2dc64f8d181"
        },
        {
          "path": "assets/cores/aalti5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti5.jpg",
          "hash": "907c9e6e0fa7bb8853f03a4cf9a36efc6614f4405e5205558ee8cf394be210aa"
        },
        {
          "path": "assets/cores/aalti6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti6.jpg",
          "hash": "04458d6f7f023d2122e510c2484b55dd93a4c516efc86722d647587eb79de0fb"
        },
        {
          "path": "assets/cores/aalti7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti7.jpg",
          "hash": "76e18e17751a5c9df17b6dab3aee79e0cc170a4665ee7f84591e8698cb32c8ac"
        },
        {
          "path": "assets/cores/aalti8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti8.jpg",
          "hash": "025b0b28a34f7f88666e639aafcd4d7916ef597539158d1617f175a286969b15"
        },
        {
          "path": "assets/cores/aalti9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aalti9.jpg",
          "hash": "4c18344fc14e5acee7c2a125c3a2a86eb420f21135a89c3c02baa70cfea80ad1"
        },
        {
          "path": "assets/cores/aext1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext1.jpg",
          "hash": "fe9225118336bf357abade2be4fc2a3ca68afcf2c2119fd3eaf8996daf1dd341"
        },
        {
          "path": "assets/cores/aext10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext10.jpg",
          "hash": "dc0544d6aa7c6bc1fd33ac374c4449bd62c1d2f1b4c7dc26f7594861de880c5a"
        },
        {
          "path": "assets/cores/aext2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext2.jpg",
          "hash": "5a69ff4185570ed6dafbc47f13f00b57cb46935419590800068c2bbbedb2f627"
        },
        {
          "path": "assets/cores/aext3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext3.jpg",
          "hash": "5a3d138340daa8cc1dc9ba708493dc83750938f90fcb11c579f947b65689f5eb"
        },
        {
          "path": "assets/cores/aext4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext4.jpg",
          "hash": "12db5df42cc27c02616faf6baae8f5b52581f415cf9e9d492063871e03338701"
        },
        {
          "path": "assets/cores/aext5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext5.jpg",
          "hash": "fce311b98e63084e2cce46428a3d4821f3915c241b10d997e65eb7d82284979f"
        },
        {
          "path": "assets/cores/aext6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext6.jpg",
          "hash": "9cdae4ae08cf56008c4d5580cb1702ad0b81d5168823d34be90cfb16640ac524"
        },
        {
          "path": "assets/cores/aext7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext7.jpg",
          "hash": "5089efb1cbad37ba0151721d5a5743bf3f01c2e7d0ae0b5e7be5f7744a0c4e1c"
        },
        {
          "path": "assets/cores/aext8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext8.jpg",
          "hash": "3d2819b905f594e15c2f3cd91ac5ad61a311fef4caa708029790b77166886932"
        },
        {
          "path": "assets/cores/aext9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/aext9.jpg",
          "hash": "12b2c9fed2573752b377fe9ef4272a1f45ce6524826160734198e53d7f790321"
        },
        {
          "path": "assets/cores/ahigh1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh1.jpg",
          "hash": "adf4d2d383809ce0e1ec249575a47847908ef3d309bff2cc61bf247aca2c5cbe"
        },
        {
          "path": "assets/cores/ahigh10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh10.jpg",
          "hash": "91bf29f4651cbf4112fa80a533d118b167fd571a8030ddd39af41bcf0c5b4a52"
        },
        {
          "path": "assets/cores/ahigh2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh2.jpg",
          "hash": "a424718b683605c34a6a13ac3f3864f5adfac2f1a0530b6282dfa9d1b19bea65"
        },
        {
          "path": "assets/cores/ahigh3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh3.jpg",
          "hash": "ac95f0b8fa2db748a37734ba46ffe2a4aceaab1e64f460ecf62c64c2db2a9f05"
        },
        {
          "path": "assets/cores/ahigh4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh4.jpg",
          "hash": "a2a9af38e264e54ad2cda9b749c6bd447b805f8f3f0aa50f5e7edfa344986c09"
        },
        {
          "path": "assets/cores/ahigh5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh5.jpg",
          "hash": "4412d1e3f4bad651d0887fe165bc0165ca7d67883f63cf14bc6ba1df6859f754"
        },
        {
          "path": "assets/cores/ahigh6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh6.jpg",
          "hash": "fcf58036358de796245f8d760e8f0750eb7675e6fe6f2bb4c23425e0034802c0"
        },
        {
          "path": "assets/cores/ahigh7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh7.jpg",
          "hash": "5fa54eca930847a3b4eb74644479770fca0003601d0b9279d6e593fa91358cac"
        },
        {
          "path": "assets/cores/ahigh8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh8.jpg",
          "hash": "b321e45c66c08d1dce7c7c62c1753f7d34139b8d80196318a5219eb4f018d4a7"
        },
        {
          "path": "assets/cores/ahigh9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/ahigh9.jpg",
          "hash": "e5d6bda32ec477e2274f6abff2347f1b43e223d24f983914f526da9e81531bc7"
        },
        {
          "path": "assets/cores/alow1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow1.jpg",
          "hash": "e7d77e8581a40f88c03b1dfc59f28ada2948516e82254fbce0a8b73e956adfab"
        },
        {
          "path": "assets/cores/alow10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow10.jpg",
          "hash": "8a1f0d8e124973ad1d83ed6ef09ab6a6e38ef4b82fbb1116ea79cb290b6eb266"
        },
        {
          "path": "assets/cores/alow2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow2.jpg",
          "hash": "dea8de1d61fc92d6fa920a48e37eab63323a8b31b36060e5d3c2e658dc7382d1"
        },
        {
          "path": "assets/cores/alow3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow3.jpg",
          "hash": "cd1c812310d229318892ff951918a60c3ba90fec4733bb720cd9c963cf5faeab"
        },
        {
          "path": "assets/cores/alow4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow4.jpg",
          "hash": "f49d61e9ec58b3140fc3a423ad340e1d68fb7483afaac55636844392b134b465"
        },
        {
          "path": "assets/cores/alow5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow5.jpg",
          "hash": "b19359ebf553c5a0f0880bbe69d44e6619cc1b03aea5ddf6dfed1eefbb1918dd"
        },
        {
          "path": "assets/cores/alow6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow6.jpg",
          "hash": "e7716da991418202853243a5a99aaa17e06d6844e2cbcb2e384b6bbeb03bc68c"
        },
        {
          "path": "assets/cores/alow7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow7.jpg",
          "hash": "b483789c18398f1d7690cc4fa3abdde57537ed99665c7c9d37d39b80f02717f7"
        },
        {
          "path": "assets/cores/alow8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow8.jpg",
          "hash": "54ebf08d76a4abc77084c1e2707319c2144bd1050ff85727f61f609e518b3daa"
        },
        {
          "path": "assets/cores/alow9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/alow9.jpg",
          "hash": "11a77cdf19a138b3fb27e2cf38533287cb6e5e59af070d98b62b32a0142cbcef"
        },
        {
          "path": "assets/cores/amed1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed1.jpg",
          "hash": "21a8e87a9575e11a5d71bf60401fb5690f8f93bba7bd7d6daa0bc21b41b1db9c"
        },
        {
          "path": "assets/cores/amed10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed10.jpg",
          "hash": "422575b4663a3478210e0b153aeca63a735598e099a268a064e1929f68de65d1"
        },
        {
          "path": "assets/cores/amed2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed2.jpg",
          "hash": "055846755c169f05a21c1a50bc93eaed6aa3fa74586458dc6b9fe3184c216d8e"
        },
        {
          "path": "assets/cores/amed3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed3.jpg",
          "hash": "c719bb9cb14ecaa1e67a215b49044db84f227fbcb34279a9f78aef5336421dab"
        },
        {
          "path": "assets/cores/amed4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed4.jpg",
          "hash": "2f0d35a2fdc47290936429dda6ad241439a4490d945b9dc3d74486ea616ff72d"
        },
        {
          "path": "assets/cores/amed5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed5.jpg",
          "hash": "13b390e77272d7735a561358128fa7b65a08023144577dda6a55362db672d80e"
        },
        {
          "path": "assets/cores/amed6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed6.jpg",
          "hash": "e9f3490ece69022badeafccc3125676f2cdd0ce8c270749374ebdacc1934896b"
        },
        {
          "path": "assets/cores/amed7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed7.jpg",
          "hash": "90d6eb1c2151ae9e4c29d6d1120d397f04f0919e5f30c34ad5fc93110394ce7c"
        },
        {
          "path": "assets/cores/amed8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed8.jpg",
          "hash": "92517f7b2c7e253491ca838b004ea2b7f8cefa5fa9460a9e11ff9d4d9ff4b54b"
        },
        {
          "path": "assets/cores/amed9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/amed9.jpg",
          "hash": "2302dbe97eeb69ffc113b53b680da0d9b4ff573fd299b20424cd8fdf354bf971"
        },
        {
          "path": "assets/cores/extr1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr1.jpg",
          "hash": "45403f21e6e965007beb5361c2328f50a71d3444a89c28be9456bdae9d8c5125"
        },
        {
          "path": "assets/cores/extr10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr10.jpg",
          "hash": "cb346483962ab1ec03f7fc0e419dd8cea1f123b04fb469446a1c8e98596556f4"
        },
        {
          "path": "assets/cores/extr2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr2.jpg",
          "hash": "8735827d77915db44962a9bc86436769aeb800a38bf45b3acf54302b9e3be972"
        },
        {
          "path": "assets/cores/extr3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr3.jpg",
          "hash": "fabf6bb0a0330bd6759cc3160c545b3a22e464335e5c94fb3b29ce8324aef894"
        },
        {
          "path": "assets/cores/extr4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr4.jpg",
          "hash": "177357c84c21cef3a6ad0abb1ba14b65ee78fee9351b52089067f3e624e86972"
        },
        {
          "path": "assets/cores/extr5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr5.jpg",
          "hash": "8f88948a1b4a917cf204b8cc80ca54ab2d4dd6c5e80a31e79ebb85e5f4ba8b0c"
        },
        {
          "path": "assets/cores/extr6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr6.jpg",
          "hash": "375ca49d760c0e9df00a23d2e44193202c0ee89fbb5d82236a0287f73dce0103"
        },
        {
          "path": "assets/cores/extr7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr7.jpg",
          "hash": "958f69fd5a7aca703b6db35050adf1db54e92850998d5d83eedff73f4288fb02"
        },
        {
          "path": "assets/cores/extr8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr8.jpg",
          "hash": "b4e278bc27e4dd949cf1fae3c7a9b0446ee8e74d1f1f5137462b5495df351375"
        },
        {
          "path": "assets/cores/extr9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/extr9.jpg",
          "hash": "6e130a3eed4a9de2db38c2738989ec0afd6b89d09e0983cc180ba0c7aed994fb"
        },
        {
          "path": "assets/cores/low1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low1.jpg",
          "hash": "b56d249e067adbf6d38891146c12e890e87bd6e037512cfba61865365a6f0265"
        },
        {
          "path": "assets/cores/low10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low10.jpg",
          "hash": "7906781390539b5e670661def56259a7fa7b3f172d713328d867e9ab4e3eab48"
        },
        {
          "path": "assets/cores/low2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low2.jpg",
          "hash": "fe9510ad2cd1da61cb099ba254deff6bfca89891332be6fa8d48a741a3d285b6"
        },
        {
          "path": "assets/cores/low3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low3.jpg",
          "hash": "eade0f048f4d886a9d24fb857a6cf2ea647edc54e4b0657518a4bc549db1c637"
        },
        {
          "path": "assets/cores/low4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low4.jpg",
          "hash": "620da631487ec1d44b64cca34685af4a6c8b259a90691c88c30ea8627b354910"
        },
        {
          "path": "assets/cores/low5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low5.jpg",
          "hash": "78fd2bcdf78ebc79a2f9caa279f95bf82f462c571133b19f35be5d91a916ebf8"
        },
        {
          "path": "assets/cores/low6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low6.jpg",
          "hash": "04087950b24f04ab22fc87ad2501b6221546fee89a542ee8ae193ce2efeac20a"
        },
        {
          "path": "assets/cores/low7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low7.jpg",
          "hash": "c15138b219ffa85130594db7aeee20f0f89aa0dd328650bad1fb2e9b9d157ab3"
        },
        {
          "path": "assets/cores/low8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low8.jpg",
          "hash": "96b9440d630f1ee7452e6b0373dd8d408a7b7f9776d22fa2441995e5b33f8bb1"
        },
        {
          "path": "assets/cores/low9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/low9.jpg",
          "hash": "3848a6a02ccca36af13e7ac416a7a3d86f374855503c0db0b7a8debbbb9be723"
        },
        {
          "path": "assets/cores/mid1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid1.jpg",
          "hash": "df52576986e009fc87ce07acd1913f89b94e42315dd7485ed3a3d4e4d311c952"
        },
        {
          "path": "assets/cores/mid10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid10.jpg",
          "hash": "f5949936eafc0fc3d759adb53946403b62eb500b6d37d7758d8f1c315afcd4b8"
        },
        {
          "path": "assets/cores/mid2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid2.jpg",
          "hash": "e80189cf17d629efebe4d511c40c936ecd30e8f66a430f6c32def3553b008edc"
        },
        {
          "path": "assets/cores/mid3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid3.jpg",
          "hash": "c635bafe441d1689cbf5ee55282606facb3ff4c1bf1ccc769adaf0670746ab14"
        },
        {
          "path": "assets/cores/mid4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid4.jpg",
          "hash": "c5984e0b88057e4f90270b6461561926d4ab22560343c7a5dbd42a1e70745b7e"
        },
        {
          "path": "assets/cores/mid5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid5.jpg",
          "hash": "f124c07a50ef1f77174212e34a5694c5f5de92f4ecaa9759d20a80c571d47e44"
        },
        {
          "path": "assets/cores/mid6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid6.jpg",
          "hash": "415798751d0e70ca43a5189f9da3021b13fba47d619e2d7dda2bc1e853709920"
        },
        {
          "path": "assets/cores/mid7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid7.jpg",
          "hash": "c987e332896f8cb86f0f643b7da727468196ab48fab4dff0c5896a13ff08dba0"
        },
        {
          "path": "assets/cores/mid8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid8.jpg",
          "hash": "f8e9effc3d16b89af3e58e5fadc5809b1785845a963a6ce6549d909015002c20"
        },
        {
          "path": "assets/cores/mid9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/mid9.jpg",
          "hash": "1c4ec86d93b54ded4890e72c89f33606680d24582c333b0127c8ac452d64002e"
        },
        {
          "path": "assets/cores/red1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red1.jpg",
          "hash": "b3b11ecd32ddbb039d219da8eb3c42e06f8427c70f85de141c59ab1166a08e83"
        },
        {
          "path": "assets/cores/red10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red10.jpg",
          "hash": "13073799cdd98376ef812fc3742cf2893b199e83ed2546ef9188edeee844c692"
        },
        {
          "path": "assets/cores/red2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red2.jpg",
          "hash": "4a221cdd9a0d39e0961b083041d6ac318c6331c7cb6d6c91f8cf58fe3785c8f5"
        },
        {
          "path": "assets/cores/red3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red3.jpg",
          "hash": "3069fb1159b27dbef9e026944bae0cf5fcfd197c50a771029ecc8b9f40b80748"
        },
        {
          "path": "assets/cores/red4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red4.jpg",
          "hash": "c5267fa70169b139260bdc510bbe66f7f8bfaa471593fcdcaef37aeb18c8e9d4"
        },
        {
          "path": "assets/cores/red5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red5.jpg",
          "hash": "56119818f784ac541bf3ff0c2db0fc7759b909a02c7c5b132ab87f213f949506"
        },
        {
          "path": "assets/cores/red6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red6.jpg",
          "hash": "a9a4001f48b96216cdfc961659402a22ec7cf56a88074cc09bd828ca58f68576"
        },
        {
          "path": "assets/cores/red7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red7.jpg",
          "hash": "defb380ebcb344e1a48c329b2dbf93326624b102dc8c70c6398144e37a37dfab"
        },
        {
          "path": "assets/cores/red8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red8.jpg",
          "hash": "e2102f2a1a0c071d60fffd812ac281206a0ddc4a067d517381fbfbe01ed5b03c"
        },
        {
          "path": "assets/cores/red9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/red9.jpg",
          "hash": "0c04919fb897c0249447056b88060a03d71ad7471cb73428073b1ec688741c3f"
        },
        {
          "path": "assets/cores/whit1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit1.jpg",
          "hash": "39bf08661a51244b41f2883f16586583606a10496b7dbfb49ccbd487bbefd07b"
        },
        {
          "path": "assets/cores/whit10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit10.jpg",
          "hash": "fe8e48754629b43b058ad8813ed4c52434eedb2551ef0020dd3c67fbd3e16d04"
        },
        {
          "path": "assets/cores/whit2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit2.jpg",
          "hash": "71fabac7dd6accf71ac1d1ffb90aa193460cbb449435b592def9655bb72b45eb"
        },
        {
          "path": "assets/cores/whit3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit3.jpg",
          "hash": "615ab0b92e6043c5bfb4bf45217a38b0724bc05ff88bc8b73f1ba62bb3a9e831"
        },
        {
          "path": "assets/cores/whit4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit4.jpg",
          "hash": "7d3612e66255344f3c93926112681631130c7970f2f8d92e0259e6fb4c25494a"
        },
        {
          "path": "assets/cores/whit5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit5.jpg",
          "hash": "dab658ff4939a57be510ed4e35699b32663c21f0c9bd684f2b10c2724745dae9"
        },
        {
          "path": "assets/cores/whit6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit6.jpg",
          "hash": "7948cde52035dfc049c2017ca4591f8cf38a3a99c37da135b23ac8bd2815efeb"
        },
        {
          "path": "assets/cores/whit7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit7.jpg",
          "hash": "658dd9530958ab83fd307caf6beb1b67810d53098f3e678e2e722cf479cf19cf"
        },
        {
          "path": "assets/cores/whit8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit8.jpg",
          "hash": "65b71d3a3b10058fae53fd41d3b98ad38906557c7b6d82ad363e2cb914bcac1e"
        },
        {
          "path": "assets/cores/whit9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/cores/whit9.jpg",
          "hash": "07ffc64a12b275cf8a888a5346d12534b3cb9a7e580ecdbf6708fb07f5c3e08b"
        },
        {
          "path": "assets/dp_mandarat.png",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/dp_mandarat.png",
          "hash": "298d0cac6d91ff944618de02e967e45de792c7f5729d550a4af634901f07ca29"
        },
        {
          "path": "assets/email/email.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/email/email.jpg",
          "hash": "80fbba6dcf7f2da2f50fe397007e23fa477ada5743ec9338e79ace9dee5272b1"
        },
        {
          "path": "assets/example_dungeon/background.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/example_dungeon/background.jpg",
          "hash": "be6174a0ef049ea63f5ff975205b7cf2e6506255623082f37d72291c29bcf12e"
        },
        {
          "path": "assets/example_dungeon/segment1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/example_dungeon/segment1.jpg",
          "hash": "322036212bdbb1a0bc02fd56f8f3392cd7640686443dd18fc0d944cc7601c12c"
        },
        {
          "path": "assets/example_dungeon/segment2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/example_dungeon/segment2.jpg",
          "hash": "e0e79f8adfdc16bfc7df94c4a831dfbff8efcfe6d8a233d1336b939584ae51c0"
        },
        {
          "path": "assets/example_dungeon/segment3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/example_dungeon/segment3.jpg",
          "hash": "d87ac3aae3288e684839b9cc96c45e4a577722d6acade8bf899998acbf55d7f7"
        },
        {
          "path": "assets/example_dungeon/segment4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/example_dungeon/segment4.jpg",
          "hash": "acd936e65b5bf2d7ea95dd113b5ee7bf194b6c4d1bdf749e404537b91469ef0e"
        },
        {
          "path": "assets/example_dungeon/segment5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/example_dungeon/segment5.jpg",
          "hash": "065700b851a868db68c310d16f161386cf3635c4526020e0d0f6b6367398e6b0"
        },
        {
          "path": "assets/exceptions/azul/azul_region_001_20260221_201047_735669.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_001_20260221_201047_735669.jpg",
          "hash": "b93354cfbc34fe6f4faecab60f20700ff24d5d169dfa05166f45b0b870834255"
        },
        {
          "path": "assets/exceptions/azul/azul_region_002_20260221_201047_852734.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_002_20260221_201047_852734.jpg",
          "hash": "e93fa0b994216561e476cb1e608f38e682c7a64a0afdd763364faf78952dd96e"
        },
        {
          "path": "assets/exceptions/azul/azul_region_003_20260221_201047_968520.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_003_20260221_201047_968520.jpg",
          "hash": "e96a9973e97955ee65e5548316b8eb3ff00749e42ddc0c5775ddd2f1d4f1244e"
        },
        {
          "path": "assets/exceptions/azul/azul_region_004_20260221_201048_085465.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_004_20260221_201048_085465.jpg",
          "hash": "078640d00b6e18ea3c2f67b1d193d77cb996223ee111316925168aff79d7818b"
        },
        {
          "path": "assets/exceptions/azul/azul_region_005_20260221_201048_202704.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_005_20260221_201048_202704.jpg",
          "hash": "a5627dfc97aa736feea5f755d5c17d82f14630e05f00793b4c9b94468e488067"
        },
        {
          "path": "assets/exceptions/azul/azul_region_006_20260221_201048_319212.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_006_20260221_201048_319212.jpg",
          "hash": "1fba000098a80cc85e587746fdc2fa0d24a844d616f2d9e4fef1b6fd381a1f84"
        },
        {
          "path": "assets/exceptions/azul/azul_region_007_20260221_201048_435846.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_007_20260221_201048_435846.jpg",
          "hash": "fb475625f91df315411d6c587d1e492978386ab6bf7d080a8e980d1bdfbebe52"
        },
        {
          "path": "assets/exceptions/azul/azul_region_008_20260221_201048_552701.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_008_20260221_201048_552701.jpg",
          "hash": "bfd043e876c6bb901ad821bf852754a83f55a26ff14a3163d232b18992639e81"
        },
        {
          "path": "assets/exceptions/azul/azul_region_009_20260221_201048_669516.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_009_20260221_201048_669516.jpg",
          "hash": "58f86ad34729fa36d5a1a2f6d2b44d6fe420bbd99ff90af1ca27b521c4615962"
        },
        {
          "path": "assets/exceptions/azul/azul_region_010_20260221_201048_785178.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_010_20260221_201048_785178.jpg",
          "hash": "de1196be1ed8dfb2a867b379105ccdea746c3f7844edfe27df9b907e9ee92b24"
        },
        {
          "path": "assets/exceptions/azul/azul_region_011_20260221_201048_902791.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_011_20260221_201048_902791.jpg",
          "hash": "67e9f7bdf6a3ef0549ea565410adf6485ef68212aa5ad355f63b7f8d2847623d"
        },
        {
          "path": "assets/exceptions/azul/azul_region_012_20260221_201049_018589.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_012_20260221_201049_018589.jpg",
          "hash": "de9773be78fe6faaef81a56e5122fdb145ce05916f157d0b114c4be4115a80ae"
        },
        {
          "path": "assets/exceptions/azul/azul_region_013_20260221_201049_135915.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_013_20260221_201049_135915.jpg",
          "hash": "cd9df335e305df2d0f3e6518bf25412b021085834ab475c52de95a1ead95e5e2"
        },
        {
          "path": "assets/exceptions/azul/azul_region_014_20260221_201049_252525.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_014_20260221_201049_252525.jpg",
          "hash": "b32e706a5a69faa734a7bf9101882db1a506975183f94269eca73d1fc4c64f69"
        },
        {
          "path": "assets/exceptions/azul/azul_region_015_20260221_201049_368823.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_015_20260221_201049_368823.jpg",
          "hash": "fd53e0318ab8598d94acff2e9f71842a5eb7445a083fafa7fa3aca8abd66a64a"
        },
        {
          "path": "assets/exceptions/azul/azul_region_016_20260221_201049_485931.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_016_20260221_201049_485931.jpg",
          "hash": "3056acff156d10940aec9b150fa0a608a589cfc2891e6c7e9b50a8941f71dba4"
        },
        {
          "path": "assets/exceptions/azul/azul_region_017_20260221_201049_602807.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_017_20260221_201049_602807.jpg",
          "hash": "2727836aa374f56c5578506f5e655f712fcadfc943303eed81ec90f7159ff4c1"
        },
        {
          "path": "assets/exceptions/azul/azul_region_018_20260221_201049_718738.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_018_20260221_201049_718738.jpg",
          "hash": "e26015e396691192d857bad7d1bed5bf56a11203651f89db8f4f66509e51b4c6"
        },
        {
          "path": "assets/exceptions/azul/azul_region_019_20260221_201049_835753.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_019_20260221_201049_835753.jpg",
          "hash": "6fa5aae894ffefdda43e072804921cfd415014af2274312fd429d3d33d4ae906"
        },
        {
          "path": "assets/exceptions/azul/azul_region_020_20260221_201049_952623.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul/azul_region_020_20260221_201049_952623.jpg",
          "hash": "92a04c34c7e7092799aa628365ef5e7c239c5a53997a0703af432cb23db552d7"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_001_20260221_201121_585414.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_001_20260221_201121_585414.jpg",
          "hash": "e7db83dff69c7734137737642a52cc1e98cf5a4bce5dc18807e9f3941a4200e9"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_002_20260221_201121_718034.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_002_20260221_201121_718034.jpg",
          "hash": "54f6874dccbe166539683e8b2ba8d6ffec9bae7dadcda59884b8120b351384a6"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_003_20260221_201121_835302.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_003_20260221_201121_835302.jpg",
          "hash": "3e3161fa7584574d9ccac4e00fac549aaef7e2f9ef3b314c33f38e8639ef5185"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_004_20260221_201121_951297.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_004_20260221_201121_951297.jpg",
          "hash": "837e711bcdffab3b04b46bc7568787a4cab8662e906ecab037559ead63c12ef4"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_005_20260221_201122_068557.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_005_20260221_201122_068557.jpg",
          "hash": "cf27ab3c216284e052183b7e985db9bd0df245e861e3c8f679c5f8c8f9532c78"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_006_20260221_201122_185290.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_006_20260221_201122_185290.jpg",
          "hash": "26a950cd0a5d05afcda21227ea36e0aaf7388db5c8346ed4e96a64f4ce622b9d"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_007_20260221_201122_302309.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_007_20260221_201122_302309.jpg",
          "hash": "98b6a7580e90e90e44739dcec1397f0b1f4a0a14effef2ae24acf85a8a2ce3fb"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_008_20260221_201122_418659.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_008_20260221_201122_418659.jpg",
          "hash": "0639848850c35e249deab9dcf8549b0281ca022b05d73314d305dc5ef1fa9f42"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_009_20260221_201122_535052.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_009_20260221_201122_535052.jpg",
          "hash": "8441ca5009ba4776b217200132f313454bdc8cad08aa18d4464027f75430ff68"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_010_20260221_201122_652323.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_010_20260221_201122_652323.jpg",
          "hash": "9bde12726add9104b28307a0fb2c330b193c060d929281394682b56c5e7c24d0"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_011_20260221_201122_768060.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_011_20260221_201122_768060.jpg",
          "hash": "397f9a55898f1fe6b955e41b6af76c0cad1a288219cc692cec064b879b1bbda8"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_012_20260221_201122_884901.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_012_20260221_201122_884901.jpg",
          "hash": "eeaa0ffb47f280a91f6f10bac814438694beda721931c0b3412c8a3d52e27b71"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_013_20260221_201123_000807.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_013_20260221_201123_000807.jpg",
          "hash": "b588581780fb8360f5758ddaa8ae5ee45cd83671ddee6735ad9abcc090468ccd"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_014_20260221_201123_119389.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_014_20260221_201123_119389.jpg",
          "hash": "12045720e2d90a78ab0fa9b0232ff3663daf55a07858563b9e0d4107f59f9e21"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_015_20260221_201123_235883.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_015_20260221_201123_235883.jpg",
          "hash": "674d9b21e2229a9d31f7915b7187cef985e39531637cdca3c9cbb48016f1b418"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_016_20260221_201123_352791.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_016_20260221_201123_352791.jpg",
          "hash": "fd1b0fdac9a694fb207f09298a21407b29c26f48500f47a633612ae48fc85db3"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_017_20260221_201123_467082.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_017_20260221_201123_467082.jpg",
          "hash": "284f1ee0f8b2f120090e2e33367d046e128c3b59bd39f58f3cb4895b18a9933c"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_018_20260221_201123_585320.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_018_20260221_201123_585320.jpg",
          "hash": "fd94a75b748e86e8f89e46f912120aa64d748c0c30ab43a8abe830e6fc8d9fba"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_019_20260221_201123_702840.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_019_20260221_201123_702840.jpg",
          "hash": "df2c10bb0df7782786f60350a6b449bcfbccb1582237e1e5deb038377ec933f4"
        },
        {
          "path": "assets/exceptions/azul_/azul__region_020_20260221_201123_819529.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/azul_/azul__region_020_20260221_201123_819529.jpg",
          "hash": "c6547e09e0f90cdfb51bad32899a7e433ee04716bbb06dc8e246279155cd805f"
        },
        {
          "path": "assets/exceptions/cores/extr1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr1.jpg",
          "hash": "45403f21e6e965007beb5361c2328f50a71d3444a89c28be9456bdae9d8c5125"
        },
        {
          "path": "assets/exceptions/cores/extr10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr10.jpg",
          "hash": "cb346483962ab1ec03f7fc0e419dd8cea1f123b04fb469446a1c8e98596556f4"
        },
        {
          "path": "assets/exceptions/cores/extr2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr2.jpg",
          "hash": "8735827d77915db44962a9bc86436769aeb800a38bf45b3acf54302b9e3be972"
        },
        {
          "path": "assets/exceptions/cores/extr3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr3.jpg",
          "hash": "fabf6bb0a0330bd6759cc3160c545b3a22e464335e5c94fb3b29ce8324aef894"
        },
        {
          "path": "assets/exceptions/cores/extr4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr4.jpg",
          "hash": "177357c84c21cef3a6ad0abb1ba14b65ee78fee9351b52089067f3e624e86972"
        },
        {
          "path": "assets/exceptions/cores/extr5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr5.jpg",
          "hash": "8f88948a1b4a917cf204b8cc80ca54ab2d4dd6c5e80a31e79ebb85e5f4ba8b0c"
        },
        {
          "path": "assets/exceptions/cores/extr6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr6.jpg",
          "hash": "375ca49d760c0e9df00a23d2e44193202c0ee89fbb5d82236a0287f73dce0103"
        },
        {
          "path": "assets/exceptions/cores/extr7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr7.jpg",
          "hash": "958f69fd5a7aca703b6db35050adf1db54e92850998d5d83eedff73f4288fb02"
        },
        {
          "path": "assets/exceptions/cores/extr8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr8.jpg",
          "hash": "b4e278bc27e4dd949cf1fae3c7a9b0446ee8e74d1f1f5137462b5495df351375"
        },
        {
          "path": "assets/exceptions/cores/extr9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/extr9.jpg",
          "hash": "6e130a3eed4a9de2db38c2738989ec0afd6b89d09e0983cc180ba0c7aed994fb"
        },
        {
          "path": "assets/exceptions/cores/low1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low1.jpg",
          "hash": "b56d249e067adbf6d38891146c12e890e87bd6e037512cfba61865365a6f0265"
        },
        {
          "path": "assets/exceptions/cores/low10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low10.jpg",
          "hash": "7906781390539b5e670661def56259a7fa7b3f172d713328d867e9ab4e3eab48"
        },
        {
          "path": "assets/exceptions/cores/low2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low2.jpg",
          "hash": "fe9510ad2cd1da61cb099ba254deff6bfca89891332be6fa8d48a741a3d285b6"
        },
        {
          "path": "assets/exceptions/cores/low3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low3.jpg",
          "hash": "eade0f048f4d886a9d24fb857a6cf2ea647edc54e4b0657518a4bc549db1c637"
        },
        {
          "path": "assets/exceptions/cores/low4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low4.jpg",
          "hash": "620da631487ec1d44b64cca34685af4a6c8b259a90691c88c30ea8627b354910"
        },
        {
          "path": "assets/exceptions/cores/low5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low5.jpg",
          "hash": "78fd2bcdf78ebc79a2f9caa279f95bf82f462c571133b19f35be5d91a916ebf8"
        },
        {
          "path": "assets/exceptions/cores/low6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low6.jpg",
          "hash": "04087950b24f04ab22fc87ad2501b6221546fee89a542ee8ae193ce2efeac20a"
        },
        {
          "path": "assets/exceptions/cores/low7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low7.jpg",
          "hash": "c15138b219ffa85130594db7aeee20f0f89aa0dd328650bad1fb2e9b9d157ab3"
        },
        {
          "path": "assets/exceptions/cores/low8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low8.jpg",
          "hash": "96b9440d630f1ee7452e6b0373dd8d408a7b7f9776d22fa2441995e5b33f8bb1"
        },
        {
          "path": "assets/exceptions/cores/low9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/low9.jpg",
          "hash": "3848a6a02ccca36af13e7ac416a7a3d86f374855503c0db0b7a8debbbb9be723"
        },
        {
          "path": "assets/exceptions/cores/mid1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid1.jpg",
          "hash": "df52576986e009fc87ce07acd1913f89b94e42315dd7485ed3a3d4e4d311c952"
        },
        {
          "path": "assets/exceptions/cores/mid10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid10.jpg",
          "hash": "f5949936eafc0fc3d759adb53946403b62eb500b6d37d7758d8f1c315afcd4b8"
        },
        {
          "path": "assets/exceptions/cores/mid2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid2.jpg",
          "hash": "e80189cf17d629efebe4d511c40c936ecd30e8f66a430f6c32def3553b008edc"
        },
        {
          "path": "assets/exceptions/cores/mid3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid3.jpg",
          "hash": "c635bafe441d1689cbf5ee55282606facb3ff4c1bf1ccc769adaf0670746ab14"
        },
        {
          "path": "assets/exceptions/cores/mid4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid4.jpg",
          "hash": "c5984e0b88057e4f90270b6461561926d4ab22560343c7a5dbd42a1e70745b7e"
        },
        {
          "path": "assets/exceptions/cores/mid5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid5.jpg",
          "hash": "f124c07a50ef1f77174212e34a5694c5f5de92f4ecaa9759d20a80c571d47e44"
        },
        {
          "path": "assets/exceptions/cores/mid6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid6.jpg",
          "hash": "415798751d0e70ca43a5189f9da3021b13fba47d619e2d7dda2bc1e853709920"
        },
        {
          "path": "assets/exceptions/cores/mid7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid7.jpg",
          "hash": "c987e332896f8cb86f0f643b7da727468196ab48fab4dff0c5896a13ff08dba0"
        },
        {
          "path": "assets/exceptions/cores/mid8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid8.jpg",
          "hash": "f8e9effc3d16b89af3e58e5fadc5809b1785845a963a6ce6549d909015002c20"
        },
        {
          "path": "assets/exceptions/cores/mid9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/mid9.jpg",
          "hash": "1c4ec86d93b54ded4890e72c89f33606680d24582c333b0127c8ac452d64002e"
        },
        {
          "path": "assets/exceptions/cores/red1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red1.jpg",
          "hash": "b3b11ecd32ddbb039d219da8eb3c42e06f8427c70f85de141c59ab1166a08e83"
        },
        {
          "path": "assets/exceptions/cores/red10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red10.jpg",
          "hash": "13073799cdd98376ef812fc3742cf2893b199e83ed2546ef9188edeee844c692"
        },
        {
          "path": "assets/exceptions/cores/red2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red2.jpg",
          "hash": "4a221cdd9a0d39e0961b083041d6ac318c6331c7cb6d6c91f8cf58fe3785c8f5"
        },
        {
          "path": "assets/exceptions/cores/red3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red3.jpg",
          "hash": "3069fb1159b27dbef9e026944bae0cf5fcfd197c50a771029ecc8b9f40b80748"
        },
        {
          "path": "assets/exceptions/cores/red4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red4.jpg",
          "hash": "c5267fa70169b139260bdc510bbe66f7f8bfaa471593fcdcaef37aeb18c8e9d4"
        },
        {
          "path": "assets/exceptions/cores/red5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red5.jpg",
          "hash": "56119818f784ac541bf3ff0c2db0fc7759b909a02c7c5b132ab87f213f949506"
        },
        {
          "path": "assets/exceptions/cores/red6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red6.jpg",
          "hash": "a9a4001f48b96216cdfc961659402a22ec7cf56a88074cc09bd828ca58f68576"
        },
        {
          "path": "assets/exceptions/cores/red7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red7.jpg",
          "hash": "defb380ebcb344e1a48c329b2dbf93326624b102dc8c70c6398144e37a37dfab"
        },
        {
          "path": "assets/exceptions/cores/red8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red8.jpg",
          "hash": "e2102f2a1a0c071d60fffd812ac281206a0ddc4a067d517381fbfbe01ed5b03c"
        },
        {
          "path": "assets/exceptions/cores/red9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/red9.jpg",
          "hash": "0c04919fb897c0249447056b88060a03d71ad7471cb73428073b1ec688741c3f"
        },
        {
          "path": "assets/exceptions/cores/whit1.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit1.jpg",
          "hash": "39bf08661a51244b41f2883f16586583606a10496b7dbfb49ccbd487bbefd07b"
        },
        {
          "path": "assets/exceptions/cores/whit10.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit10.jpg",
          "hash": "fe8e48754629b43b058ad8813ed4c52434eedb2551ef0020dd3c67fbd3e16d04"
        },
        {
          "path": "assets/exceptions/cores/whit2.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit2.jpg",
          "hash": "71fabac7dd6accf71ac1d1ffb90aa193460cbb449435b592def9655bb72b45eb"
        },
        {
          "path": "assets/exceptions/cores/whit3.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit3.jpg",
          "hash": "615ab0b92e6043c5bfb4bf45217a38b0724bc05ff88bc8b73f1ba62bb3a9e831"
        },
        {
          "path": "assets/exceptions/cores/whit4.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit4.jpg",
          "hash": "7d3612e66255344f3c93926112681631130c7970f2f8d92e0259e6fb4c25494a"
        },
        {
          "path": "assets/exceptions/cores/whit5.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit5.jpg",
          "hash": "dab658ff4939a57be510ed4e35699b32663c21f0c9bd684f2b10c2724745dae9"
        },
        {
          "path": "assets/exceptions/cores/whit6.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit6.jpg",
          "hash": "7948cde52035dfc049c2017ca4591f8cf38a3a99c37da135b23ac8bd2815efeb"
        },
        {
          "path": "assets/exceptions/cores/whit7.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit7.jpg",
          "hash": "658dd9530958ab83fd307caf6beb1b67810d53098f3e678e2e722cf479cf19cf"
        },
        {
          "path": "assets/exceptions/cores/whit8.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit8.jpg",
          "hash": "65b71d3a3b10058fae53fd41d3b98ad38906557c7b6d82ad363e2cb914bcac1e"
        },
        {
          "path": "assets/exceptions/cores/whit9.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/cores/whit9.jpg",
          "hash": "07ffc64a12b275cf8a888a5346d12534b3cb9a7e580ecdbf6708fb07f5c3e08b"
        },
        {
          "path": "assets/exceptions/ophidia/ophidia_region_001_20260221_193505_622408.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/ophidia/ophidia_region_001_20260221_193505_622408.jpg",
          "hash": "13c49998b85276e75e843d94c77645f449f00ea6742ae24028979a383ee82517"
        },
        {
          "path": "assets/exceptions/ophidia/ophidia_region_002_20260221_193505_855422.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/ophidia/ophidia_region_002_20260221_193505_855422.jpg",
          "hash": "7916a005c019a4f4169d08a5836b3a12d97ac4dbef91b7da70ef06021bc3c5fb"
        },
        {
          "path": "assets/exceptions/ophidia/ophidia_region_003_20260221_193506_072156.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/ophidia/ophidia_region_003_20260221_193506_072156.jpg",
          "hash": "26d1cadbc9a8fee57341f15e82c9a2c97e54c1b9fe09e2704dd7a96c9b86d875"
        },
        {
          "path": "assets/exceptions/ophidia/ophidia_region_004_20260221_193506_289323.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/ophidia/ophidia_region_004_20260221_193506_289323.jpg",
          "hash": "fa1d3ae7c37a24aa8377af785a6c3343763f8f04ab5d7d08210b0b505d767dfa"
        },
        {
          "path": "assets/exceptions/ophidia/ophidia_region_005_20260221_193506_505791.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/ophidia/ophidia_region_005_20260221_193506_505791.jpg",
          "hash": "cca3aaea623a71122a26a3419f934f1d57b956ddfa28f36d9b546d9dff72d64a"
        },
        {
          "path": "assets/exceptions/pain/pain_region_001_20260221_193411_308040.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pain/pain_region_001_20260221_193411_308040.jpg",
          "hash": "25ea9a1f04064771423751b2845b2d6d4105415aae649b923ec5f1e09e0cd163"
        },
        {
          "path": "assets/exceptions/pain/pain_region_002_20260221_193411_540299.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pain/pain_region_002_20260221_193411_540299.jpg",
          "hash": "afcb44eee4770e1a3146e704e72e52318d45a6caeee9e1b5fffad842777fd9da"
        },
        {
          "path": "assets/exceptions/pain/pain_region_003_20260221_193411_756901.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pain/pain_region_003_20260221_193411_756901.jpg",
          "hash": "0685fc6a6ca7eb7adae68fc373c68d8ef8b51810802514ac64ecd30ee982a020"
        },
        {
          "path": "assets/exceptions/pain/pain_region_004_20260221_193411_974060.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pain/pain_region_004_20260221_193411_974060.jpg",
          "hash": "41d41bfebf98b378410521ca5bfda6e52269c0dca37e7d9c0f39fea6514df25a"
        },
        {
          "path": "assets/exceptions/pain/pain_region_005_20260221_193412_190677.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pain/pain_region_005_20260221_193412_190677.jpg",
          "hash": "737d99cb4bc7979c6ed3fc749c22ed67794d7490e38bccc409fc89a7c5bd5a26"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_001_20260221_201028_136704.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_001_20260221_201028_136704.jpg",
          "hash": "fe40fa2ee7991f017aa0be2f2607c734b56a6ad6b9db840e7d62bd048b960524"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_002_20260221_201028_253211.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_002_20260221_201028_253211.jpg",
          "hash": "f1ca97cc8eb34e0efabc5f816f6351281ec219478723e92a60749df10247d6a4"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_003_20260221_201028_369802.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_003_20260221_201028_369802.jpg",
          "hash": "5127af2fd06cd8dfe7b2558f4fc8ec9aff39edc5fe22b6c883bd090e9d7a1beb"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_004_20260221_201028_486028.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_004_20260221_201028_486028.jpg",
          "hash": "5fa763fc5c6dbb93d8cf95f476a2f6a759b490f0177afac20ac73a95ccb3e0c9"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_005_20260221_201028_602624.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_005_20260221_201028_602624.jpg",
          "hash": "ec83b3c7ac401a74707821c25eaf188a30df88ad4c2693c94b2ba12cdcfeeb05"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_006_20260221_201028_718933.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_006_20260221_201028_718933.jpg",
          "hash": "0e7981f4105c0597cb46211530bd6c98b7a8b1c59f326ecfd67f882dd6a77332"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_007_20260221_201028_837413.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_007_20260221_201028_837413.jpg",
          "hash": "3464e0187bf5e698227c05ced7fe32a89078cd05922e0523940746c92081d970"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_008_20260221_201028_953292.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_008_20260221_201028_953292.jpg",
          "hash": "6bb41bf47d659bcdd616d949f7206b83a3dfdd50930ef5e77c007fee52a34d31"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_009_20260221_201029_069999.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_009_20260221_201029_069999.jpg",
          "hash": "b9993f39c3aa260f24d2084f02cdbf8c52914fd054d121e615491b5d021ef8a8"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_010_20260221_201029_186476.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_010_20260221_201029_186476.jpg",
          "hash": "7da611305c977faff1ecf0da8c96d72deeeb0838413c075ea71cec103eccd429"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_011_20260221_201029_302639.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_011_20260221_201029_302639.jpg",
          "hash": "e78f21efb4a009b18ae96b93946dcccce6b13798b026296746fbcb44f2fbc8c1"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_012_20260221_201029_420361.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_012_20260221_201029_420361.jpg",
          "hash": "aeba16aa2b9884fd4d9f3f767b6847f24da561956ecc434fa6408a76ab5e0c74"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_013_20260221_201029_535961.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_013_20260221_201029_535961.jpg",
          "hash": "4595eed223585038b53fce895e02914c67d4128e52ec06cc4b8d1a5480a0ae69"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_014_20260221_201029_653116.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_014_20260221_201029_653116.jpg",
          "hash": "f3a7c91197156fdcfec62c5f07d0e2cb85961251570721444940e5bcb6e733e5"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_015_20260221_201029_768940.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_015_20260221_201029_768940.jpg",
          "hash": "7e5874c3f7a4017277ec32306e2dbe74fca7a249e20959294ea58ad77d12262b"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_016_20260221_201029_886280.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_016_20260221_201029_886280.jpg",
          "hash": "1de9ad3b76f3915d8ec1538d32fbb1e98f88fced01ef3e5c9a7ba9372ababcf0"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_017_20260221_201030_003447.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_017_20260221_201030_003447.jpg",
          "hash": "70d14a8a3d1b7a75a165f3fe9c492f21f81eb72124913db2b887f2ed7b22f870"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_018_20260221_201030_118853.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_018_20260221_201030_118853.jpg",
          "hash": "c19e2bb5300b4497a9697e4eb4b2de2f2f9e247d9fd0e0c68fe1e7b40fd96979"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_019_20260221_201030_236773.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_019_20260221_201030_236773.jpg",
          "hash": "d47b90fc0f7e67e0f423853291b4e5ab92e07433508bf255c3a6e76bb64d6ff9"
        },
        {
          "path": "assets/exceptions/prideus/prideus_region_020_20260221_201030_352604.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/prideus/prideus_region_020_20260221_201030_352604.jpg",
          "hash": "177bb7caa0f9e72a7ddf6bfae837767506c2a1abe72c0f9f1f390121058f34a6"
        },
        {
          "path": "assets/exceptions/pw5/qw7_region_001_20260221_193523_221515.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pw5/qw7_region_001_20260221_193523_221515.jpg",
          "hash": "926b00506af8f3e38252ea56475791d8504b23e9aa0f9dd93b4f5be8cef3416f"
        },
        {
          "path": "assets/exceptions/pw5/qw7_region_002_20260221_193523_455110.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pw5/qw7_region_002_20260221_193523_455110.jpg",
          "hash": "715d48a6bd6d1b5cc717d771808adc5a7db05e84cad44b6c7b7accef2d6644df"
        },
        {
          "path": "assets/exceptions/pw5/qw7_region_003_20260221_193523_672191.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pw5/qw7_region_003_20260221_193523_672191.jpg",
          "hash": "e3593a677cc881f314112928460800bbb6a224bc0562102d72e028b99f685aba"
        },
        {
          "path": "assets/exceptions/pw5/qw7_region_004_20260221_193523_888521.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pw5/qw7_region_004_20260221_193523_888521.jpg",
          "hash": "158195d4013d5dad9e046fe55ec973eeaefdd4b5f13b3739650083a8c16c0394"
        },
        {
          "path": "assets/exceptions/pw5/qw7_region_005_20260221_193524_104615.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/pw5/qw7_region_005_20260221_193524_104615.jpg",
          "hash": "e7f8839833ebc13d5c436596e6bcc2cf374589d0ad0cecdce23b5e31959763ae"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_001_20260221_200840_689836.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_001_20260221_200840_689836.jpg",
          "hash": "b14d0af474036c346d8d754cd4ff177b1b2f4da64713aa9efdc81760c23815c8"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_002_20260221_200840_806055.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_002_20260221_200840_806055.jpg",
          "hash": "ce1b71ccfeec7eac9def6ffb83aa012124b7d4cc6c25cd64ee44112b3bf37d67"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_003_20260221_200840_922884.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_003_20260221_200840_922884.jpg",
          "hash": "d73c082a74c151c5fd43abae89c79f1385bcb9b934f26d0484e5903f76162d4b"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_004_20260221_200841_039294.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_004_20260221_200841_039294.jpg",
          "hash": "74fd8ab533e810b11549cffe9be22b2269b0645e62d80677dcbde63c5f9c9669"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_005_20260221_200841_155761.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_005_20260221_200841_155761.jpg",
          "hash": "392f6823605478263077294f00ac16a123afd88195328e4cd617d4172e102f57"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_006_20260221_200841_272261.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_006_20260221_200841_272261.jpg",
          "hash": "ea6f5a7e3fc749ca65badb60d3018c328f8c4d4f5e995df36dbc9ca43d277bda"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_007_20260221_200841_389823.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_007_20260221_200841_389823.jpg",
          "hash": "92fc7bb946a3adda3eeeba13ddc038e733e5946b3cd76983f7ad9f7e49f2575d"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_008_20260221_200841_506579.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_008_20260221_200841_506579.jpg",
          "hash": "bd786268ef5634214449d220c0711b272622d431da163212c22854b0e28a2919"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_009_20260221_200841_622297.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_009_20260221_200841_622297.jpg",
          "hash": "c48c1e3c1530fe6ef8cdee93aa54d07082d55f4aa627aa1006b485c835549dda"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_010_20260221_200841_739298.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_010_20260221_200841_739298.jpg",
          "hash": "e93527127001d11624ac82f815f0a9ee6d838053f9604a9b7c3c0ac0d206e7e3"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_011_20260221_200841_856221.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_011_20260221_200841_856221.jpg",
          "hash": "b85e3cea2fa8b9efcd92088201ae508192515df2768a4a2082133a5790919909"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_012_20260221_200841_972766.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_012_20260221_200841_972766.jpg",
          "hash": "02f1530daeda8680ae785f953d0024899fb07831a1f31541205124b96e35872b"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_013_20260221_200842_089574.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_013_20260221_200842_089574.jpg",
          "hash": "6bc35ed71447fa0293a53b1d2d02256072b7a4a865e5e27fbd9f6f893e404466"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_014_20260221_200842_205846.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_014_20260221_200842_205846.jpg",
          "hash": "75878ea6b32e65f768e44cc833c413c2d44e7f475d731e2502c06806153bd3af"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_015_20260221_200842_323156.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_015_20260221_200842_323156.jpg",
          "hash": "a0618570f48bbf6ae02484f8fa855383685b6df6c7387e42db9b8d0d49d0f50d"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_016_20260221_200842_438707.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_016_20260221_200842_438707.jpg",
          "hash": "d20e72271436f933d786635b6377d9fd649d62c6e3118a5c86c1fa6f00761b18"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_017_20260221_200842_556907.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_017_20260221_200842_556907.jpg",
          "hash": "6ccb1489bbf07a0193660949d1f253738a2e7d21dd64a1ab3c4654c5a6a16142"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_018_20260221_200842_672348.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_018_20260221_200842_672348.jpg",
          "hash": "776a9d767cbf91f21a90475bf6f622d5f442c124621f942650b103aec452ab6d"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_019_20260221_200842_789827.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_019_20260221_200842_789827.jpg",
          "hash": "1948223e5c8b40f0887e493a26c07425838175fb9cc027ed4368bfc4eb81c2f1"
        },
        {
          "path": "assets/exceptions/qw7/qw7_region_020_20260221_200842_905516.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/qw7/qw7_region_020_20260221_200842_905516.jpg",
          "hash": "1b277d2a8f38bf96abc1c8b8e00ce3bf300f875a29b2e03ae21f436506b72801"
        },
        {
          "path": "assets/exceptions/rw3/rw3_region_001_20260221_193359_924116.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3/rw3_region_001_20260221_193359_924116.jpg",
          "hash": "3f88edad416185fadc0792ba2e13343da5d9dd6567fd9c275868c37019620d2a"
        },
        {
          "path": "assets/exceptions/rw3/rw3_region_002_20260221_193400_157439.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3/rw3_region_002_20260221_193400_157439.jpg",
          "hash": "8edcbd58048c76e243fd6539572a73f3f790cf2a24d7a28261b22bacf95f29a5"
        },
        {
          "path": "assets/exceptions/rw3/rw3_region_003_20260221_193400_374071.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3/rw3_region_003_20260221_193400_374071.jpg",
          "hash": "0f47b7eb37fad78ad2f296f6c63f1de1a35e7d139557afc052f091d96d9eb2b2"
        },
        {
          "path": "assets/exceptions/rw3/rw3_region_004_20260221_193400_590696.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3/rw3_region_004_20260221_193400_590696.jpg",
          "hash": "96a3842cc704808e6204aad9103d5f6531a9006767e244a8997d9ff512260c74"
        },
        {
          "path": "assets/exceptions/rw3/rw3_region_005_20260221_193400_807204.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3/rw3_region_005_20260221_193400_807204.jpg",
          "hash": "c20e2b2ee2df634f1c5255890b688a0eaa04d11d763829f63216f02e6bef3eec"
        },
        {
          "path": "assets/exceptions/rw3_/rw3__region_001_20260221_193543_622592.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3_/rw3__region_001_20260221_193543_622592.jpg",
          "hash": "c2e6a412950493ff5527d8012afeb48207d23893c90b614fca49d489b1196fbf"
        },
        {
          "path": "assets/exceptions/rw3_/rw3__region_002_20260221_193543_854390.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3_/rw3__region_002_20260221_193543_854390.jpg",
          "hash": "924c1a81dc990375a519bd1af376fb4ffbcf4633fe4bbfff242dce43461f4b58"
        },
        {
          "path": "assets/exceptions/rw3_/rw3__region_003_20260221_193544_071991.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3_/rw3__region_003_20260221_193544_071991.jpg",
          "hash": "1a6f79f98f5242599a6f32ec489666a5e6eb1d54abde695bb41137202072dc47"
        },
        {
          "path": "assets/exceptions/rw3_/rw3__region_004_20260221_193544_287845.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3_/rw3__region_004_20260221_193544_287845.jpg",
          "hash": "3ea2040526a6cb52c16166b934d7be5aae70da14c0687e907f324fa3c2e3f3f1"
        },
        {
          "path": "assets/exceptions/rw3_/rw3__region_005_20260221_193544_504724.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exceptions/rw3_/rw3__region_005_20260221_193544_504724.jpg",
          "hash": "b92320836434167b4cf457df220799d5db8e19e8ae157b0009c577248babcc50"
        },
        {
          "path": "assets/exit/exit.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exit/exit.jpg",
          "hash": "4f326ffc37a67da545d70e976065ad6d8146bc84b0e79aceebb00d5ad68e9bce"
        },
        {
          "path": "assets/exit/saia.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/exit/saia.jpg",
          "hash": "fe0c191f516ae346baa0ea9ea31fc8e275b5e962bb67088ed0369f659725cbf2"
        },
        {
          "path": "assets/gear.png",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/gear.png",
          "hash": "5dc540a72931df49533761a8901ddaeed8534cec26be5871ad54659dfa7a62bf"
        },
        {
          "path": "assets/inventario/inventario.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/inventario/inventario.jpg",
          "hash": "c79b747b250a85f621a6e828caeae1acf8e178c36bbf3e96170e197a64ad92db"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_001_20260217_181005_365862.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_001_20260217_181005_365862.jpg",
          "hash": "86a2c2785e440ad334324ad528598295e470b2978bc7599923f10a74baa7de30"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_002_20260217_181005_398005.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_002_20260217_181005_398005.jpg",
          "hash": "3d5b5182526510bd97a1edf6ff3fe63662f25b43c3b1eb5238ab5249fd875800"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_003_20260217_181005_415122.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_003_20260217_181005_415122.jpg",
          "hash": "8484615e6482fed5748b15e87151299d1d3ea5df215deab3469af7e922473064"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_004_20260217_181005_431746.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_004_20260217_181005_431746.jpg",
          "hash": "27de8171491b331e5687f8c4579db88d709fe1437466208599212d5333a2bd17"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_005_20260217_181005_447305.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_005_20260217_181005_447305.jpg",
          "hash": "cc11398a2722995726d56a95a5680c2654bec7c2df8fe10f4a8e5219d8b02c5e"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_006_20260217_181005_465958.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_006_20260217_181005_465958.jpg",
          "hash": "41862411012fa284401538ddcf80d02d00cad16d404cce9bbe27b64c7b07254c"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_007_20260217_181005_481112.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_007_20260217_181005_481112.jpg",
          "hash": "9c47440e5992df195a15295f989db29cd7272302f195d1b5fae7c75798b3652e"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_008_20260217_181005_498178.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_008_20260217_181005_498178.jpg",
          "hash": "73a34b05a24e19c142e2d666fb51eb0484b15e7f4bf9088b735bd5e6d754dbfc"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_009_20260217_181005_515729.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_009_20260217_181005_515729.jpg",
          "hash": "83fa4af2fd85bc2ab1bf1dd1b54ec087ede8c1e203c94e8bb4307c4f533b441e"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_010_20260217_181005_531254.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_010_20260217_181005_531254.jpg",
          "hash": "0818155131ccf9850b3444b1a6db7bc4f1fb6bd3f48fdf07ebceaed4b6f86079"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_011_20260217_181005_548849.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_011_20260217_181005_548849.jpg",
          "hash": "59ee7e6dfc9a0a04ec39f8e54b3cd26d57ed7787464a77e056bf745f77547f89"
        },
        {
          "path": "assets/items_to_break/female/Celestita/item_012_20260217_181005_565933.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Celestita/item_012_20260217_181005_565933.jpg",
          "hash": "bca76b01b4b8a026f97653dfe57d0c690791c98a4ea5e2f2e90cf2105356a0f9"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_001_20260217_191306_284893.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_001_20260217_191306_284893.jpg",
          "hash": "5fbb30ea51470da64be213fba47c24ef8846daf6eadbab7114a275f2ceee261e"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_002_20260217_191306_317384.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_002_20260217_191306_317384.jpg",
          "hash": "55a1d8a242acfbcb0e3274555f65c91af604b6eb2210abbfebead90ccc1abc60"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_003_20260217_191306_334389.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_003_20260217_191306_334389.jpg",
          "hash": "17a6cc22dfb3c65ae91be74fefa4137cce88bedd72eb836305281401137fd629"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_004_20260217_191306_350495.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_004_20260217_191306_350495.jpg",
          "hash": "6aa47196512ae1d904a423d4d21e50b457340ba147c0395f4b67280e17cfa275"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_005_20260217_191306_368047.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_005_20260217_191306_368047.jpg",
          "hash": "a02a4153fe21e8fe40408595a5eca72b0fefdd68934d14668ebf7ef1c9dc5edc"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_006_20260217_191306_384124.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_006_20260217_191306_384124.jpg",
          "hash": "ea62f4cd41857fbe6fdfc2bb35cf162a784293c37f81ea17c80deefaa97bbab3"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_007_20260217_191306_400681.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_007_20260217_191306_400681.jpg",
          "hash": "552fb75921467946a2a893f81e0f56fa2b29263b0f4c7242cbc55fc10898e2e5"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_008_20260217_191306_417710.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_008_20260217_191306_417710.jpg",
          "hash": "2129d12baedccba71c42ac12673e6c5160b745164795f24f098c1d36d38d9688"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_009_20260217_191306_434268.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_009_20260217_191306_434268.jpg",
          "hash": "b75b26eca16ebeb8b564b8ce6ba42a10338c0ac0d4cf21df83498533339f0053"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_010_20260217_191306_452428.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_010_20260217_191306_452428.jpg",
          "hash": "fc10138f30f9c435958397a891227b9d48d3d23babe62fe5fcb5eba66dd2ffbe"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_011_20260217_191306_468381.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_011_20260217_191306_468381.jpg",
          "hash": "329084854ed6ad6d62a876b6a922d5be2175efc0c1d0da592e11189197cb2175"
        },
        {
          "path": "assets/items_to_break/female/Demonite/item_012_20260217_191306_484463.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Demonite/item_012_20260217_191306_484463.jpg",
          "hash": "cb7fde1cc68ca594360b86300d1dc90bbff6eb0a8a452ac813ca190c74fc143d"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 171950.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 171950.jpg",
          "hash": "051124deac1970c4c98013beafad5a3707cae27f778f5efa224bf286376ca9e6"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 171959.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 171959.jpg",
          "hash": "1dcc40ca292a4e1cc322aaf434f935143ebf27ad10f401a4bfd3820a3ca9e585"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172005.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172005.jpg",
          "hash": "8f7a664ff5f77fd6f90b237709bc11781216041701e4e2e5bcadff189fa8a618"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172010.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172010.jpg",
          "hash": "7a29e253de499d34235a63126269a54439f8f79158da9d286c9175e7106f188a"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172015.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172015.jpg",
          "hash": "719f89dab934aadfe81309a969d364d57bfba8ce56b0406f2385335ed260633e"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172021.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172021.jpg",
          "hash": "816a23147b9dc6fb8a2e672a2f6c1e43244cd60704a39585ff514b7b4b67baec"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172026.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172026.jpg",
          "hash": "3b2ff3e0a79c49811d5fcb09c5e34e4ab4763afc00d4b213e021c048d9b0d799"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172041.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172041.jpg",
          "hash": "99f9b4f995faf0e1599274cc5ee687f9d4a110935967c55db8b5e0c598f7d6c7"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172047.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172047.jpg",
          "hash": "93bb43f010e7ddb332b94e381e35269092f0629b430f9b2a362f395f25deeeff"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172052.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172052.jpg",
          "hash": "e763d3e7fdcecb3c5312b3c78b55672a02e7075ff305ec1423e6183a569152de"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172058.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172058.jpg",
          "hash": "49efc8674c1a30b5f0463b77945342bf41c2fa6d44223eb03437053a947a24bb"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172103.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172103.jpg",
          "hash": "c0d685685986348ce7eeeba7fc210fb22b475f0043f7858589810092c438263b"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172334.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172334.jpg",
          "hash": "3fe0b65ba37469ef81ea1781109a29a163ac932c9dae06586073f4e0f899bad3"
        },
        {
          "path": "assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172351.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Dragonio/Screenshot 2025-12-06 172351.jpg",
          "hash": "0d3e22815090f7edc8add9259356c767b9399119dbb229dfe32c56ce03a493a4"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_008_20260217_183744_256311.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_008_20260217_183744_256311.jpg",
          "hash": "656c94ec8333dcc9911f6bdc1b80d36a2649528fd063d3b738c299db05c8e168"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_009_20260217_183744_272368.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_009_20260217_183744_272368.jpg",
          "hash": "00be7f1d475da2164245962d13649bf4fb211863ffdc05aebf3cb4f22994e4b9"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_010_20260217_183744_289356.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_010_20260217_183744_289356.jpg",
          "hash": "93ae239752f48b5ec9dee363db59f2c7d403dfb3be772b14f07d07991c2fd625"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_011_20260217_183744_305944.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_011_20260217_183744_305944.jpg",
          "hash": "59f1fa3c47b1a5a4a3e927d5b228801e302c5c88375a5d8aa88bcebe688d3a8c"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_012_20260217_183744_322616.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_012_20260217_183744_322616.jpg",
          "hash": "ee83bc4474dd6f963d7af72701f97148758a5530ea3bd6b9dcf850a1a19c7e00"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_013_20260217_183744_340152.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_013_20260217_183744_340152.jpg",
          "hash": "3653eb9d8b2cdc15f69ea50b0a42739dfac49607c8f71bcba6a4dbc57f71b149"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_014_20260217_183744_355692.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_014_20260217_183744_355692.jpg",
          "hash": "337c6030cba769546b92e2c4778ad3358ec6bdced1b74c37a860cfaedefdf9d1"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_015_20260217_183744_372803.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_015_20260217_183744_372803.jpg",
          "hash": "8d77457ac8a82b4554353243a87a8f194d4bdc5b4854b19debcd39a927f6123f"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_016_20260217_183744_389297.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_016_20260217_183744_389297.jpg",
          "hash": "021216a8bb30ccc7975c5b677decd6a64033c76607ef637b0fffd6ac9fd4c553"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_017_20260217_183744_405359.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_017_20260217_183744_405359.jpg",
          "hash": "9b0d85706d9c1d064a568b5e727ecd53760406487d46c25cc8e9523fbf2ffcfe"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_018_20260217_183744_422369.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_018_20260217_183744_422369.jpg",
          "hash": "000e0cda95a977cecda2461231aa73b656ad5786bf7e8db87e606be485805a20"
        },
        {
          "path": "assets/items_to_break/female/Guarda/item_019_20260217_183744_438963.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Guarda/item_019_20260217_183744_438963.jpg",
          "hash": "7d3f8ec8c8268bee2279ba73644b08a88556df92f6f8912f7329621fc3f0a001"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_001_20260217_185656_793155.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_001_20260217_185656_793155.jpg",
          "hash": "67a6055d24c3aaa3ebc76f7557dd41c6e50183c63e169ab74a5e397bb5897861"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_002_20260217_185656_826189.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_002_20260217_185656_826189.jpg",
          "hash": "00e1b28608e825e3d929c5dbd21bb287d970a0f0ac67e383825b38d27381a34e"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_003_20260217_185656_842767.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_003_20260217_185656_842767.jpg",
          "hash": "a69909401a8cba8c83f83a4caa8b23f1968221f645fb1b85af2a6c11f75321e6"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_004_20260217_185656_860784.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_004_20260217_185656_860784.jpg",
          "hash": "00c285fdd3fa67b72aff9e783c983ffb9fda2245aa97553492ebd6a199374f54"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_005_20260217_185656_876876.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_005_20260217_185656_876876.jpg",
          "hash": "d68493003da3fbb07419d8c1b24688d2a22e048dfe18f476b217f999fde4737e"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_006_20260217_185656_892407.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_006_20260217_185656_892407.jpg",
          "hash": "70cda6a453c6c43c98317e491db459c67faaad6da56a7de1af6a65baf22dd596"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_007_20260217_185656_910011.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_007_20260217_185656_910011.jpg",
          "hash": "f7bb2fde6c0496a879c1275a175666215dde12573b26ce6cbcc00754f061c5f8"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_008_20260217_185656_926519.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_008_20260217_185656_926519.jpg",
          "hash": "fb9f8af7fed6e8039c00cc73becf813cab306836f1627d89cf0de674667626f1"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_009_20260217_185656_942583.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_009_20260217_185656_942583.jpg",
          "hash": "d5c7192498230a3ef87ea0330429626580cdfd98a651f73d857cddd02ab03443"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_010_20260217_185656_959179.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_010_20260217_185656_959179.jpg",
          "hash": "9e69a3e2589703a8510cccb72027108a4f92800e690c1425ed3de63d9159d483"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_011_20260217_185656_976656.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_011_20260217_185656_976656.jpg",
          "hash": "70703d3127590039cefd0a6bec37be14926dd387433afd0e994c2be5af1efefc"
        },
        {
          "path": "assets/items_to_break/female/Mitril/item_012_20260217_185656_993253.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Mitril/item_012_20260217_185656_993253.jpg",
          "hash": "44c0161007af67ad419cc40ef89961379cf08e4e5387541d4d99bff2527ccb31"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_001_20260217_190202_051729.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_001_20260217_190202_051729.jpg",
          "hash": "e55ba8ea7056be3aefe1950595782904ddf1e94c66eaed4d7223401349482122"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_002_20260217_190202_085410.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_002_20260217_190202_085410.jpg",
          "hash": "de579ff352a6b18c97cf90b9774c0b50e6ed2b0ff05ecec5827448cd793b7125"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_003_20260217_190202_101505.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_003_20260217_190202_101505.jpg",
          "hash": "d48adfef5569cab38c21ed3c9982b2f83c3b7530137381570bb9a02ffc2e3c0b"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_004_20260217_190202_118550.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_004_20260217_190202_118550.jpg",
          "hash": "5adc33d873d88f9238932043a97c2f4d4e38d2e7deb62f79b0133ddbed2f18eb"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_005_20260217_190202_135608.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_005_20260217_190202_135608.jpg",
          "hash": "3761cd6cc6cddd5067eaaf8a998d4b396a0f55e963ea4b4cfdecbe8f0655802b"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_006_20260217_190202_152176.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_006_20260217_190202_152176.jpg",
          "hash": "bcdabeaf68bcb9405c208b00315c29fab28a9d8ee92c0dc3909fc6460bf9f172"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_007_20260217_190202_168765.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_007_20260217_190202_168765.jpg",
          "hash": "13e09e48b149f92e932d6e59d10f200584f574860085f6731809579063a1fc7d"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_008_20260217_190202_186404.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_008_20260217_190202_186404.jpg",
          "hash": "d4f032e2dc6b024288af36fe7f08f4f5b23b8b06ef5531edbce10ef53546eb9b"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_009_20260217_190202_202034.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_009_20260217_190202_202034.jpg",
          "hash": "9997fdb6489abdbbe7139bc828237c2901a824150646d92cb0b1267af5c1363a"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_010_20260217_190202_218767.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_010_20260217_190202_218767.jpg",
          "hash": "657434b5ea53f110624617389a41c88656645b69c18d7655186438b3a0846957"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_011_20260217_190202_235819.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_011_20260217_190202_235819.jpg",
          "hash": "f87b2faaba781d861373412511a77201ab717ad776d9db3c33ae6e043c9faa1a"
        },
        {
          "path": "assets/items_to_break/female/Orichalco/item_012_20260217_190202_251845.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Orichalco/item_012_20260217_190202_251845.jpg",
          "hash": "9ce0461885cc8965fc0c50206db242d62890e2018407657ba7ebe1e386d7218d"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_001_20260217_183038_966446.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_001_20260217_183038_966446.jpg",
          "hash": "9f7ec2312c44c5bf731410fa85aeaeddb9e0f2892663806a11b66d79f4a86759"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_002_20260217_183039_000030.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_002_20260217_183039_000030.jpg",
          "hash": "be3b6c5f0680b5c8a8db50a5b37d5f0d6963a673bb01da1a1ed92128a2314656"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_003_20260217_183039_016630.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_003_20260217_183039_016630.jpg",
          "hash": "4c48b6d5136cb84cdb1381e2d7db836429b4b562276e7f8db7781300e4e29f85"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_004_20260217_183039_033634.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_004_20260217_183039_033634.jpg",
          "hash": "6df70cdfd22ab96482eb5fa32d1384a0d90014a95449255d2c52ce67de2e5c80"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_005_20260217_183039_050265.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_005_20260217_183039_050265.jpg",
          "hash": "aa7b6fac83eebcef2943ed282e55e759d8ef2dedb7b55830a4a85b1af85a73a0"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_006_20260217_183039_067830.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_006_20260217_183039_067830.jpg",
          "hash": "f5984af997b35f37499979ae929d5807ec2144ddeddc5eb69d8933da1ab9e378"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_007_20260217_183039_083406.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_007_20260217_183039_083406.jpg",
          "hash": "f0d452271c30bd962b8a93b66e1ac6134177729077888b584cb9bfe4010476d2"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_008_20260217_183039_099551.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_008_20260217_183039_099551.jpg",
          "hash": "4b7a78a60464b4a02c08651049bb28666b77ef2cbad84846d2b0529927f06389"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_009_20260217_183039_116990.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_009_20260217_183039_116990.jpg",
          "hash": "2075bdd14cf32a1fcb6270e0c332f8bd9b9beee6c10621ba3dfa7d61375ee709"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_010_20260217_183039_133560.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_010_20260217_183039_133560.jpg",
          "hash": "783fb18e6b088de1c47597daffc2b730cc117a757eee3e999d82a53edc1e90d7"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_011_20260217_183039_150103.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_011_20260217_183039_150103.jpg",
          "hash": "cf632468250286bda2419777769895940c4a1c1808f799ed2a871c431489127d"
        },
        {
          "path": "assets/items_to_break/female/Osmio/item_012_20260217_183039_165702.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Osmio/item_012_20260217_183039_165702.jpg",
          "hash": "0202d50cf3147196b8ff763476ee13ea48de006311ea512f31bb1751454c0293"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_001_20260217_190848_341734.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_001_20260217_190848_341734.jpg",
          "hash": "26d215871dc5e6c0476b00fff68972b7e0c57fa273c9813ea6178cdc0081cc40"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_002_20260217_190848_373858.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_002_20260217_190848_373858.jpg",
          "hash": "c0d5f2a0b1b84eba26519927b5ee180fc744e3575a08bdd409818e84c5f97a86"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_003_20260217_190848_390905.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_003_20260217_190848_390905.jpg",
          "hash": "a4731cbe63739fcfea9e9903705d8fa8a0f7ebded1b9946a6dead49e5106ff11"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_004_20260217_190848_408516.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_004_20260217_190848_408516.jpg",
          "hash": "ab3be3324d0991d1cfd2f509e412bad5fca95a912c25f99c7500b1f2ba1a00d8"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_005_20260217_190848_425118.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_005_20260217_190848_425118.jpg",
          "hash": "2a075d7dbc5fd070bc4f3a78a48eaadbaabdc72a96f183f84c5efe9bbb3af399"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_006_20260217_190848_440605.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_006_20260217_190848_440605.jpg",
          "hash": "276e99af5a3e9fc268571c78d14bb30297a0cfc261657d1e388535686edf05b4"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_007_20260217_190848_457810.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_007_20260217_190848_457810.jpg",
          "hash": "08c80878f0a7e81d2e276e8bac3bcda7973c00f58d40f6ea609953bda9de2ba7"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_008_20260217_190848_474876.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_008_20260217_190848_474876.jpg",
          "hash": "df9f0d1f378de040649a084affbe7bd92cc17b26f07da20e73c7bdb4ae6dac0b"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_009_20260217_190848_491914.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_009_20260217_190848_491914.jpg",
          "hash": "7a14ac07729f3e753baea9bc12d5097343344f418b92cfbea1d78801812df137"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_010_20260217_190848_508053.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_010_20260217_190848_508053.jpg",
          "hash": "aaa6e31d11888cab0aedc7efabbfccdf6a7598261edd55adc6a695a5b3e94dbe"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_011_20260217_190848_525071.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_011_20260217_190848_525071.jpg",
          "hash": "35f6391bf0aab96469152ec5b42160314f511db18f331925337593a35f4978bc"
        },
        {
          "path": "assets/items_to_break/female/Paladio/item_012_20260217_190848_541212.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Paladio/item_012_20260217_190848_541212.jpg",
          "hash": "0308c618f917cafcdd49789176715a61447f485f2cfede91b87735c18244cd50"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_001_20260217_185033_585234.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_001_20260217_185033_585234.jpg",
          "hash": "890f260955677500fc5af0345d1b266d5a80e9519ce0ce1139e8bc713dccef40"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_002_20260217_185033_619823.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_002_20260217_185033_619823.jpg",
          "hash": "016cd47c0d90138ce75ec54d8a64f139ee5e1db355133b8aacb5fefbd92821b0"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_003_20260217_185033_635877.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_003_20260217_185033_635877.jpg",
          "hash": "abe9e546ee36b31603f973da6381e99559cb1e7706ca097c3776551a2f754f93"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_004_20260217_185033_652898.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_004_20260217_185033_652898.jpg",
          "hash": "53ea9bfdd829e0ef4fae3bccbeb10c8d9abf0d24e4573fdec1be3e8a145be3bc"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_005_20260217_185033_669420.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_005_20260217_185033_669420.jpg",
          "hash": "2d87f70361c240040fdc31101426633d0cd19436794fd8b3d44b6d6bf61a765a"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_006_20260217_185033_687012.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_006_20260217_185033_687012.jpg",
          "hash": "2d5e274752fe3b478fe969017829ab69fe0633767e54b80ada038a0bd44c4190"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_007_20260217_185033_703084.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_007_20260217_185033_703084.jpg",
          "hash": "2fed2e2aed66304115e48c77065672e6e1f9e2d7df956cd9ce06b9d3828ec870"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_008_20260217_185033_719210.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_008_20260217_185033_719210.jpg",
          "hash": "242f3d0cce61ab0e658acedf188b8560f03f91dce957fe3b787399957eb2fc12"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_009_20260217_185033_736232.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_009_20260217_185033_736232.jpg",
          "hash": "c4d8cdc4d7954853bbb3e75d0b1c248ddf2223a47dff2bcc8573192f5710b53e"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_010_20260217_185033_752704.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_010_20260217_185033_752704.jpg",
          "hash": "f2a9c2435b0e1f82afa4595ca98c6d852147b4f0eb49171dbe05922d31dc55f0"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_011_20260217_185033_769745.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_011_20260217_185033_769745.jpg",
          "hash": "f9c131d3189eab6a8daa30cf440ac1d855f0ee8d18e65580139e68b531cf78ca"
        },
        {
          "path": "assets/items_to_break/female/Sigmetal/item_012_20260217_185033_786326.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Sigmetal/item_012_20260217_185033_786326.jpg",
          "hash": "20986e4abfdde095c9a69380b3a8a20fecbfcb300ebd7fd334ab535462f28d33"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_001_20260217_182131_163469.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_001_20260217_182131_163469.jpg",
          "hash": "9eeb1376851fb526c5e0cfa01b98d7e8d368aea3fbf7ba474b8a5a3f69de359b"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_002_20260217_182131_197629.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_002_20260217_182131_197629.jpg",
          "hash": "290363832080a76cbad150885bffdca49e55b3886f27a6543a4f2f701e020804"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_003_20260217_182131_213121.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_003_20260217_182131_213121.jpg",
          "hash": "be6607764036fac79bf8a84bfd82cc2bc482995de91e2fe6ca6df674191e336f"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_004_20260217_182131_230753.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_004_20260217_182131_230753.jpg",
          "hash": "22a98754eddadb063096821e5ffb8b1823e32738e372f28e21a044b7749f34ae"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_005_20260217_182131_247324.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_005_20260217_182131_247324.jpg",
          "hash": "02dd02496115649f918d8def1f4711df11f423e36eefe1d882cdbf9dc552c3c1"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_006_20260217_182131_264869.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_006_20260217_182131_264869.jpg",
          "hash": "1b84edb4cc19a76283ce6e417b2e2b456a8c17b5567eaa5679f990c537c1073a"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_007_20260217_182131_280980.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_007_20260217_182131_280980.jpg",
          "hash": "1bcc29fc3ffda3e2bf4bf5193c27e512ba1a0e8ef2889b8f0519a6e24e1591bf"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_008_20260217_182131_298047.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_008_20260217_182131_298047.jpg",
          "hash": "5a4c4fa9a44c985ff5ffbaa49e5f362b99c3cd1d2e81dcf3db377bef36f03a7e"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_009_20260217_182131_314141.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_009_20260217_182131_314141.jpg",
          "hash": "3914f33f5831f1471c4465e22b85ffd658e338d310402fe30aa01a568d469c71"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_010_20260217_182131_330604.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_010_20260217_182131_330604.jpg",
          "hash": "dfc3dc44664772e8a8c18815db71bade4d385b06cf94d060b7e9fe94394b131f"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_011_20260217_182131_347622.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_011_20260217_182131_347622.jpg",
          "hash": "a154c16dc7c4c24c89901e48bfc365d802f5388ea715c624fa098c16139f96e9"
        },
        {
          "path": "assets/items_to_break/female/Titanio Negro/item_012_20260217_182131_364211.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio Negro/item_012_20260217_182131_364211.jpg",
          "hash": "9ed3e41e1c4b074ea4085476511fdff9d961104c9b8231db659ea9a8334653b0"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_009_20260217_181229_344127.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_009_20260217_181229_344127.jpg",
          "hash": "6dc6769c6ba768e381cdd744eb7f4df178ae4261317cf63c1ccda1989e619055"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_010_20260217_181229_360695.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_010_20260217_181229_360695.jpg",
          "hash": "d028d6d0501f59142f1d8abd13c8fcb9e59c74b88ac6d23f73d684d3606e19cb"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_011_20260217_181229_378201.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_011_20260217_181229_378201.jpg",
          "hash": "34a829f873bd85b96aca03a8429e95c4361df0eca7c8d27e664b9e94290c3762"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_012_20260217_181229_393902.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_012_20260217_181229_393902.jpg",
          "hash": "80ffcc2248591578d29f29179294588b2f1ff14ff447d4ef630fb5adf8154c09"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_013_20260217_181229_412486.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_013_20260217_181229_412486.jpg",
          "hash": "11e911ccd77190213cd26a4395aa1c5a1cea6ef0247cf6842efba96764621fa6"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_014_20260217_181229_427506.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_014_20260217_181229_427506.jpg",
          "hash": "d769303dd7a1d8f74a50c1c9a8e6377b87f6debc4fb767df999df0f9fb32cf54"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_015_20260217_181229_444100.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_015_20260217_181229_444100.jpg",
          "hash": "aa94beb82fc3dd3e099e357da48b0f81ddb19850d5c3c4b379f0eaec59468ab1"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_016_20260217_181229_461128.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_016_20260217_181229_461128.jpg",
          "hash": "a50016b140a6b4192d64c43d5cb587c3748eb1de5275120dd31b27b0f6468c4e"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_017_20260217_181229_478166.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_017_20260217_181229_478166.jpg",
          "hash": "90d9022e655acec4f34041066c46430e5478f35ee2779bbaa525e537c25ccb8a"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_018_20260217_181229_494678.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_018_20260217_181229_494678.jpg",
          "hash": "2f13385c14e70c5c83f47e2b7c0ec2aa70474dcd477cc1dfb913a6809981c9cc"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_019_20260217_181229_511197.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_019_20260217_181229_511197.jpg",
          "hash": "aeb3c3d3d4107d69db06fcf645fa67633648ae0efaec32445820537d1f4c80ae"
        },
        {
          "path": "assets/items_to_break/female/Titanio/item_020_20260217_181229_528743.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/female/Titanio/item_020_20260217_181229_528743.jpg",
          "hash": "159e2c7afe3a46cf5b2df1e3b63444957782738adef9babc4e26f42cbe26230a"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_009_20260217_180504_456514.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_009_20260217_180504_456514.jpg",
          "hash": "4f2ce1f9a10ff4f394d87fbd33bfd3b5ba7fe4601b7b112c0d416e0b412587a3"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_010_20260217_180504_473574.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_010_20260217_180504_473574.jpg",
          "hash": "84c8f172d1e8d985d34d9a24cf20dd5af19ebe12e98d7ec5d84dfb04282c766a"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_011_20260217_180504_490025.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_011_20260217_180504_490025.jpg",
          "hash": "8f5963251baa4a1e9d62312f4592e8318c8b69283365fe9176f411bf5aabcd7a"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_012_20260217_180504_506064.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_012_20260217_180504_506064.jpg",
          "hash": "108fc9c717e9a5b35be6ae805b8e213b0e7cb96e1c442ebc372fde50cd814418"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_013_20260217_180504_523074.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_013_20260217_180504_523074.jpg",
          "hash": "dd94b61b22d6a589fa1456c2e72e07d8153e926c5c6062138c815d5f531c880a"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_014_20260217_180504_539151.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_014_20260217_180504_539151.jpg",
          "hash": "8e6c77f8ad44d9a306f2cae3c160cfef531b32893701f4a5f69d824bba974cc7"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_015_20260217_180504_556616.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_015_20260217_180504_556616.jpg",
          "hash": "5d8f73a63ad4e24265e0c53a4f77921a42d4ac175fa711ef70715ecafaf99ec9"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_016_20260217_180504_573200.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_016_20260217_180504_573200.jpg",
          "hash": "b888b92848f6bdb17490708b81e47ae9a34042d53af7577ffc395fe0cfbb6fce"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_017_20260217_180504_589688.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_017_20260217_180504_589688.jpg",
          "hash": "cee5ccaf09d01a8d1181619553d2bd33ab99e7693dea3568345902a8243f1229"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_018_20260217_180504_605808.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_018_20260217_180504_605808.jpg",
          "hash": "5bcda8b0e9926a585511c0e7fadfe2666aea56d3cb3cbcdce07ff647da7d8d04"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_019_20260217_180504_622837.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_019_20260217_180504_622837.jpg",
          "hash": "8981a7846054ea6857393d06b2d7b763c68b11485ac7868630c4be14c6b439f8"
        },
        {
          "path": "assets/items_to_break/male/Celestita/item_020_20260217_180504_638402.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Celestita/item_020_20260217_180504_638402.jpg",
          "hash": "9db02c9cee5f8832e019219e0570e721654fb2c48bea6262670e290103967974"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_001_20260217_191426_716162.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_001_20260217_191426_716162.jpg",
          "hash": "7f0bbc2d3d7528a5727fe68449e73e33dd8d9f9dfbe0ffcb453e4ff373a3ff17"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_002_20260217_191426_749785.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_002_20260217_191426_749785.jpg",
          "hash": "72a5beab9f4990fa19099abeb81a7ce232d2e123f06d9f09eb3f6b7c028e4769"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_003_20260217_191426_766408.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_003_20260217_191426_766408.jpg",
          "hash": "401d84fb8ae7418978a362bb88a46ca3f997eab1506a0bc9ab3be9b76d115ae9"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_004_20260217_191426_782992.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_004_20260217_191426_782992.jpg",
          "hash": "82c009d95166465a3034d95f2c51ac8b0abba3c79a060a20895fc1f86ccb3bfd"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_005_20260217_191426_799544.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_005_20260217_191426_799544.jpg",
          "hash": "da43e46ebb6fca94f93651d415b5e6db4a381d0876b92474d542e4b3cbab367e"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_006_20260217_191426_816143.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_006_20260217_191426_816143.jpg",
          "hash": "1055f7a91b645e671a211a5df145add8d323cb06184764b82bf1fb0503099109"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_007_20260217_191426_833123.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_007_20260217_191426_833123.jpg",
          "hash": "3cbc8e131772d3a42675a60b5e41453a62afed333c9a30169523be027196e44d"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_008_20260217_191426_849260.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_008_20260217_191426_849260.jpg",
          "hash": "28bea1db294a7eb08754cc1cd6d8056a8a03b166813859d774a2e4404a0a9360"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_009_20260217_191426_865851.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_009_20260217_191426_865851.jpg",
          "hash": "b3d4446d59124a7e651a0f28a2cfb34825a7a039e84bf1f501dc9c338533b96a"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_010_20260217_191426_882864.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_010_20260217_191426_882864.jpg",
          "hash": "089af2186fedaa82e0143b973f75daec594d5e9cf1887dc51966683710684cfd"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_011_20260217_191426_899497.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_011_20260217_191426_899497.jpg",
          "hash": "129522f67d7c57980bb141d96ed2fb15c72bbe925ef6883ade134a747a9e1ca0"
        },
        {
          "path": "assets/items_to_break/male/Demonite/item_012_20260217_191426_915995.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Demonite/item_012_20260217_191426_915995.jpg",
          "hash": "2219103c20753b9ea52812d9dd74928c1f588af607bb3c55f72d4eee44294769"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172737.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172737.jpg",
          "hash": "c888e012ec49c167db4f541bb154986752e8f26a013594e7ab3f8034a04f14f3"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172746.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172746.jpg",
          "hash": "e3a998386ad9f361c1742fcebd84385cea839057b0ccd3ce3eeeb42a0c7bc02f"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172801.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172801.jpg",
          "hash": "746efc26f053fe743f78678ec195c1db8b9de3ad77ac73de71759fb77f952c0c"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172806.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172806.jpg",
          "hash": "4e2d52989b80de0ce4d3c5982532de2314b6c24dc6a64e70c17018273a85fbc3"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172812.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172812.jpg",
          "hash": "aa345b4d54cbede09e05db68076d18bdd729016d67adb91939f592e4c66cecd6"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172818.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172818.jpg",
          "hash": "da7b6c08ab9a4a184610750da8beb696ea2bdb71fe32ab1f18dfff8f705fdaa3"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172823.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172823.jpg",
          "hash": "e017cb24ef3005a72228f4a4dff40f33dbf10b33917924c8080eb8ece6399e2c"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172828.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172828.jpg",
          "hash": "264e7d35bbd42dc3adf34b906944ff6eb87fc404fb35035e5771a86fc2b9dd84"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172834.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172834.jpg",
          "hash": "1ce8ec3af4cd7328715357b9be87a1a369182bbe9d1e0bd642cc3fb7421fd19f"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172839.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172839.jpg",
          "hash": "d36b326b0f6416aa48f3fe62ebc16bea761ca8da76432ff19ee5c49b53e75b35"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172846.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172846.jpg",
          "hash": "9a88dc8f58dad0f3a14192a6b8667875cc8e82e7e851f105c18be0bb8ee7cd8d"
        },
        {
          "path": "assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172852.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Dragonio/Screenshot 2025-12-06 172852.jpg",
          "hash": "9a1dc42fbb035dd80be4a348fe20ebf82a4be34803b379703a4b3579f616ff61"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_001_20260217_183925_936253.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_001_20260217_183925_936253.jpg",
          "hash": "aaf5eae9fed230a6a8b4a317884341100724eae9b8c9912d3598fb14d1ce35a6"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_002_20260217_183925_971282.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_002_20260217_183925_971282.jpg",
          "hash": "caed1a53e6979eb5e986cfe6b82c08b1979ad710cf5e95d7c309e05e7fa1466e"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_003_20260217_183925_987338.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_003_20260217_183925_987338.jpg",
          "hash": "e5de60e415a54f71ffba60aba40e6a22cb9fb0aa76e340cec664d76c12844daf"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_004_20260217_183926_004451.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_004_20260217_183926_004451.jpg",
          "hash": "a547a9f0e24b7dd0da7b9985dd768b44ebddcab1eebdd41254dcd74c2f975c35"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_005_20260217_183926_020015.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_005_20260217_183926_020015.jpg",
          "hash": "8188293a69cf435c734246342d581fad8f750cb0b18809e1a23646022d4e3159"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_006_20260217_183926_036468.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_006_20260217_183926_036468.jpg",
          "hash": "67dcb48fe0aa05a808725de482336f83c917d75ba236349e4c9d365931590840"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_007_20260217_183926_053518.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_007_20260217_183926_053518.jpg",
          "hash": "ddbbd1b612ddefc98d3c40771c6e36e9167e26ded57bfe2cf629ef2947178820"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_008_20260217_183926_070152.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_008_20260217_183926_070152.jpg",
          "hash": "aafbd9b85e4bcf1c14580fddd16fc0e28e7c6f621b9cc432bb3e027ea4b0bca5"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_009_20260217_183926_087196.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_009_20260217_183926_087196.jpg",
          "hash": "b7f37e34898251aa6befa6498d1d9ff91ea21da0b25efeb8eaa348e9b80ebd49"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_010_20260217_183926_102661.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_010_20260217_183926_102661.jpg",
          "hash": "668175eb333f7afef9aa299aa80ca7112dce5eec2d9fc0185e86d9dbdf579045"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_011_20260217_183926_119758.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_011_20260217_183926_119758.jpg",
          "hash": "423a71067d3440d725aac48ad0ade32b7fc0800e12fd41f04d59180922911be9"
        },
        {
          "path": "assets/items_to_break/male/Guarda/item_012_20260217_183926_136329.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Guarda/item_012_20260217_183926_136329.jpg",
          "hash": "5d9a55e02a6e1d4aa52e14fda7dcba70c91b0686a9b468c93a39b0a0f2ac81da"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_001_20260217_185509_562151.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_001_20260217_185509_562151.jpg",
          "hash": "16af3350700ea5908ed3d61b900728ed0794710ae85c6fe15a56a8a59a7cd432"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_002_20260217_185509_595732.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_002_20260217_185509_595732.jpg",
          "hash": "0dbe045711c1b6bb6d7a6b7ad28a37fd9e8fdfd13a509da3d4cee74b0f458699"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_003_20260217_185509_611206.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_003_20260217_185509_611206.jpg",
          "hash": "3a2d0ed6093df34c6f4522ceb0133ec193909c7ac9360d91d76da6508f6c6691"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_004_20260217_185509_628857.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_004_20260217_185509_628857.jpg",
          "hash": "d31289158bda72e3072e9ec43f28a5ea7cbffcae5d1122a8d775945b47e37c3e"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_005_20260217_185509_645874.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_005_20260217_185509_645874.jpg",
          "hash": "f0ba60a52b807b9d3d122697ffe3e5e2860a748e0c6156b6d1fb2d0e943a2e9e"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_006_20260217_185509_663881.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_006_20260217_185509_663881.jpg",
          "hash": "adfce3d5748a902c3cfc045fe80bbf51a67fd40d86e54f91a151cce88c0f6101"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_007_20260217_185509_679078.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_007_20260217_185509_679078.jpg",
          "hash": "9beaf1208b3f4c90c38bc73de1e7b8f23bc12d4f36b0981fc4e0faaf6ca2be6b"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_008_20260217_185509_696103.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_008_20260217_185509_696103.jpg",
          "hash": "784517d70e1c120038f1d834226b85f951f53caac6120adac86bfce610448222"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_009_20260217_185509_711646.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_009_20260217_185509_711646.jpg",
          "hash": "f57983ca5049c17f6c552f42ea392d0dc370f7ce0ce6a83e2755341047f189b8"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_010_20260217_185509_729720.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_010_20260217_185509_729720.jpg",
          "hash": "2f0b117d9effc859a6ea13c1f771e3e742bf1e3dafd09f3ad0f1f70d2c5a5cc9"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_011_20260217_185509_745223.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_011_20260217_185509_745223.jpg",
          "hash": "6a4b61588b573e28b016d510eb9ef231d9db6ca2923fed784b1596f641015332"
        },
        {
          "path": "assets/items_to_break/male/Mitril/item_012_20260217_185509_763908.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Mitril/item_012_20260217_185509_763908.jpg",
          "hash": "28763435c44d2166b3d951c50d1028e153d413d49cfcb3461af430ee0c2660de"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_001_20260217_190357_282115.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_001_20260217_190357_282115.jpg",
          "hash": "685e431e0784d7c93ef6d51d24789eb1ff57a2292adf9198ff48e2d957137a0c"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_002_20260217_190357_315611.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_002_20260217_190357_315611.jpg",
          "hash": "e8a8340a99b6c31b3bbeeaa940a27605fe43b8d3dec02931f120052d9a87cbb4"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_003_20260217_190357_331603.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_003_20260217_190357_331603.jpg",
          "hash": "db257917dc5938ab50739eaa17b1a47a53432ac6261831a40ff619b2c33681c5"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_004_20260217_190357_350201.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_004_20260217_190357_350201.jpg",
          "hash": "30729bf716942f49fa1de57e0a97270df9f2debdec67a4127d25367c86c648aa"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_005_20260217_190357_365727.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_005_20260217_190357_365727.jpg",
          "hash": "3b47a11ab2025762ef6c2f8ea9abacc78503b6c3011bfb371104bd8342d2c4ec"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_006_20260217_190357_382798.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_006_20260217_190357_382798.jpg",
          "hash": "02307ae2bb5c7ab797b9ac7991ba2f48e86a6acba38de439272dc1713552557e"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_007_20260217_190357_400360.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_007_20260217_190357_400360.jpg",
          "hash": "a9363b473924b53c1240580aae1de53ee599eaa3f763338d141817217bc38810"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_008_20260217_190357_415445.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_008_20260217_190357_415445.jpg",
          "hash": "1ced1039ec5c2104e47a2dd76ba6efe553b07b30fc6d909c1d780ebd7b60f966"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_009_20260217_190357_431946.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_009_20260217_190357_431946.jpg",
          "hash": "44d3a77cd30ddeae1fe99e80b3b72acbaeb68d2bd3cbcf5a8739535284148ce2"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_010_20260217_190357_448516.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_010_20260217_190357_448516.jpg",
          "hash": "4ea4fa4ac149055b0c0da377e160ea0e1682905943602878429f71489b2b39f4"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_011_20260217_190357_466056.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_011_20260217_190357_466056.jpg",
          "hash": "07384c7635fe659ddd5411439e7929fe46abe5e83c2e993ff6a25a15f9ddb554"
        },
        {
          "path": "assets/items_to_break/male/Orichalco/item_012_20260217_190357_481593.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Orichalco/item_012_20260217_190357_481593.jpg",
          "hash": "226c2ab5b2968e6bc9451d5f5ba3191f910a515ce66a9c742bc1e0cdb7870931"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_001_20260217_182807_120558.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_001_20260217_182807_120558.jpg",
          "hash": "cafa1e89c5f7c5274dc3a31c473ce8c784a079ca0bac9df58bd9ea834d9b382f"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_002_20260217_182807_154065.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_002_20260217_182807_154065.jpg",
          "hash": "3e2e2d7c4fc5268e92c4e1c6aa26a1c12f7cca62ce1eeef25d11bc9cd04ce854"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_003_20260217_182807_169601.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_003_20260217_182807_169601.jpg",
          "hash": "bf465664751d367fc9a48c78661601cc4782de816cadfa577e3d0a362aeadf48"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_004_20260217_182807_187707.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_004_20260217_182807_187707.jpg",
          "hash": "835138d68479d47e7cc1d6de64f7f5cefe08e9293ff43b3917739a61db61789d"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_005_20260217_182807_204322.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_005_20260217_182807_204322.jpg",
          "hash": "3bfedb069d6bb8e9cdede12de737eb7783473abd85ee13928161b76128bd3ee6"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_006_20260217_182807_219844.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_006_20260217_182807_219844.jpg",
          "hash": "5291f4cc8be830b3405838a429a8e7d63668d275652eb3baaca32d5eb246da27"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_007_20260217_182807_236495.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_007_20260217_182807_236495.jpg",
          "hash": "d7fc3b82f3ef5388dbda3e9ac32611a8f9fe6edea55228e5ed2d29e7614c4db1"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_008_20260217_182807_254555.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_008_20260217_182807_254555.jpg",
          "hash": "ec522d7194db36ef9ece9834e9837597919a6271bdcfb5e65f42a9246d187674"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_009_20260217_182807_270105.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_009_20260217_182807_270105.jpg",
          "hash": "eb38c81640f39971a73c5e3c403c39bcf2dbd38e6a00bfbe79130e88c5441495"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_010_20260217_182807_287128.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_010_20260217_182807_287128.jpg",
          "hash": "46cd5b6ef0fe3fe7c97316a1a1395ab48855639a9475c0457c5d3da27ba53c2b"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_011_20260217_182807_303253.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_011_20260217_182807_303253.jpg",
          "hash": "da8f5ab15d35eba3de4ce6eb458540abaa12bd0ca111568693fa59577b0a1be4"
        },
        {
          "path": "assets/items_to_break/male/Osmio/item_012_20260217_182807_319858.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Osmio/item_012_20260217_182807_319858.jpg",
          "hash": "6c046b3197b650d8e526c38c2843ece273faf888a84069045ff553f186bcadc1"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_001_20260217_190715_876428.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_001_20260217_190715_876428.jpg",
          "hash": "bb889a8d145bfa52e9c21f05c886d2911c65319ecf22e9ed579f3924c4c3282e"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_002_20260217_190715_910609.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_002_20260217_190715_910609.jpg",
          "hash": "2cad3a2ac5c36ada283c18163771525decf2d83d9d9e6ba9114f63d3a8d94444"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_003_20260217_190715_927149.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_003_20260217_190715_927149.jpg",
          "hash": "24680c3c17510d1ee55040e0a9d0aab33a56ef37cd85b0cb6877de7695628ea1"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_004_20260217_190715_943746.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_004_20260217_190715_943746.jpg",
          "hash": "834bfb02476ff63d8b9530cf88e38149999f64b48d5134dfa72e25fed5947a16"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_005_20260217_190715_960723.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_005_20260217_190715_960723.jpg",
          "hash": "8689af9f512f0246cd84bb6e517113411501ffe113f66ae693c29e74e9a6c4a3"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_006_20260217_190715_977243.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_006_20260217_190715_977243.jpg",
          "hash": "4541e13c44726d89e6c9b833dc2044bffec5a1fa58e030b1230475d1aaae8c03"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_007_20260217_190715_992749.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_007_20260217_190715_992749.jpg",
          "hash": "faf13875cb4df318be5dd6644e842e2c7104eb1466973fd54f4723ff7b6eca6a"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_008_20260217_190716_010452.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_008_20260217_190716_010452.jpg",
          "hash": "6e48ec08fbe234885b676fe556ca2abcf32965da4fdf931a714de0068093b3ca"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_009_20260217_190716_027487.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_009_20260217_190716_027487.jpg",
          "hash": "e32af44fff54db235a02975ad8b9af068c7fd453809211857456838a0b0de145"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_010_20260217_190716_043030.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_010_20260217_190716_043030.jpg",
          "hash": "d08ecd1db1a0573d2bc5c80c04cca07f194266cf15d71f2ee010d99461c281f5"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_011_20260217_190716_060703.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_011_20260217_190716_060703.jpg",
          "hash": "f19b6a118cdf127ddd6d2c315b96183aed73a1f77b71b2e46231cbb1359125b8"
        },
        {
          "path": "assets/items_to_break/male/Paladio/item_012_20260217_190716_076222.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Paladio/item_012_20260217_190716_076222.jpg",
          "hash": "1d7d229ac43f59973d8f2642e8d7f274821afcd35f4d4efefad063c519862e7b"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_001_20260217_185124_400899.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_001_20260217_185124_400899.jpg",
          "hash": "3845c89368c65f503222a3ba119cfb01056d72fce806b64c97515dda90d568a3"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_002_20260217_185124_434439.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_002_20260217_185124_434439.jpg",
          "hash": "ec275b4de05b874d9aa56f0cc9f60e2d0997e5c2abd54a029b27021d1a994ff4"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_003_20260217_185124_451536.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_003_20260217_185124_451536.jpg",
          "hash": "2a34322133a0ceea0dda5ff4cf5a1110b398f400538e4adc56bff766c5c41278"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_004_20260217_185124_467536.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_004_20260217_185124_467536.jpg",
          "hash": "bee5a9dd442377c26f2760e9135ddfbaaa03027f203e638522b2c7b58cc79daf"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_005_20260217_185124_484625.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_005_20260217_185124_484625.jpg",
          "hash": "f4bdbcb47c3a37f800ea8073a8bf023a2efa57740c8b8aa42c4d7115e973ce02"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_006_20260217_185124_501837.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_006_20260217_185124_501837.jpg",
          "hash": "2c6ce8414140f268c48adc9c6ae2faf8c03eeb4badc497bee74548486d4ed6d1"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_007_20260217_185124_517330.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_007_20260217_185124_517330.jpg",
          "hash": "b5004cd99a1ce01b11b2e6fab87182ae21d0492bcd08296527fdc6fc893eee97"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_008_20260217_185124_534388.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_008_20260217_185124_534388.jpg",
          "hash": "8151ae6276ddef3788832332b070c867274577e164f254aa5263e392e113e036"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_009_20260217_185124_550504.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_009_20260217_185124_550504.jpg",
          "hash": "7acd347f5a5b339a791592c7973a3bcd7de42197007278ce15d0b1d81f4fa789"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_010_20260217_185124_569558.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_010_20260217_185124_569558.jpg",
          "hash": "ade594287c302cf5e16573ec16e71024aef1c9145680b6925b3f55d8b038f4f4"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_011_20260217_185124_584198.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_011_20260217_185124_584198.jpg",
          "hash": "806dc05e2132a9ae2c4a3558889340e536b83b13bf93b21331ab4ef4776f4217"
        },
        {
          "path": "assets/items_to_break/male/Sigmetal/item_012_20260217_185124_600727.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Sigmetal/item_012_20260217_185124_600727.jpg",
          "hash": "026e5c334bed213f6af939c0774daefd39967c39acf11352d2f5cca4f34accb1"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_001_20260217_182030_881070.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_001_20260217_182030_881070.jpg",
          "hash": "4795954704dfdc9a6ea519e124b06d1660f63fed3f77799159d5e673aa9de10f"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_002_20260217_182030_915122.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_002_20260217_182030_915122.jpg",
          "hash": "5b2222b8cc21f07dad868274ffe7e3d414a630abc06a902d9e1eae9d5b4ea4fe"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_003_20260217_182030_932242.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_003_20260217_182030_932242.jpg",
          "hash": "4a7f7cb531bd605b6939b7b58e9ff1abcadf6ad5a209ac1c5e1a08bf5a8fc9a2"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_004_20260217_182030_948300.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_004_20260217_182030_948300.jpg",
          "hash": "c7328e81862b83cdea7d9ae8b4585faba5b20bcbedf68c8ad07c9eba929b8683"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_005_20260217_182030_965287.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_005_20260217_182030_965287.jpg",
          "hash": "847508581d96f5a3ae7bbae623f3d314ed5cc3098f9733ad00f479eee24fd8d2"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_006_20260217_182030_981199.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_006_20260217_182030_981199.jpg",
          "hash": "c2bde414228c51a53cff9ba1e71203d4917bec11a7b5d424d2b7262f2ff49a07"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_007_20260217_182030_997729.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_007_20260217_182030_997729.jpg",
          "hash": "358d91b48e49b7df81190577c622f1b4417c28368abdadee416a69066480df58"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_008_20260217_182031_015400.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_008_20260217_182031_015400.jpg",
          "hash": "15311b33471b2426d04997761a3db633b3af40e434dd9ff8d734e78ef61affcb"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_009_20260217_182031_031918.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_009_20260217_182031_031918.jpg",
          "hash": "b35309e3c4d0278c72da072ec836608b54e3b5271384fa615ae35392d7389923"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_010_20260217_182031_048919.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_010_20260217_182031_048919.jpg",
          "hash": "3289621efeec07346b583024b35c1c884986a4356e649bae5e6d3eceb926eeb3"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_011_20260217_182031_064871.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_011_20260217_182031_064871.jpg",
          "hash": "eacd00436f333d9e4da2600d274e97ea32fc09f5b9d2ab32dbc3f1f3017a15f2"
        },
        {
          "path": "assets/items_to_break/male/Titanio Negro/item_012_20260217_182031_081377.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio Negro/item_012_20260217_182031_081377.jpg",
          "hash": "fb627d5febaa14658aaf541cd26e3908e53aca7023d5996922f5dffdcb3b885c"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_001_20260217_181440_341095.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_001_20260217_181440_341095.jpg",
          "hash": "fed65f4cd1648b049e8d642b933ca15f437d3ed05fdc30fb2f5754f75c96e39c"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_002_20260217_181440_373518.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_002_20260217_181440_373518.jpg",
          "hash": "a04c9ab0f38668c33b67a841f7261e0ad0d973a8a12b262022e5b1b6ba0cd93a"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_003_20260217_181440_391563.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_003_20260217_181440_391563.jpg",
          "hash": "cc9bef481d36603d05a487f55a02d02b45cab17fb1272f77ab131d3ea138acff"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_004_20260217_181440_408170.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_004_20260217_181440_408170.jpg",
          "hash": "41ccd894e87d54901e20e51ab5973cd3ee5e632020c78646344948e095a22aa6"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_005_20260217_181440_424265.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_005_20260217_181440_424265.jpg",
          "hash": "b73823f6c3b024d3d00e12753f0a90d03fc2e9f247b660073fcb6fa937480cb8"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_006_20260217_181440_441765.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_006_20260217_181440_441765.jpg",
          "hash": "3e935e2cced902a7e87b833fc3860af23ac83cc4b5333e79d0a1a9a0694788af"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_007_20260217_181440_457325.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_007_20260217_181440_457325.jpg",
          "hash": "7b82375ca3a31ee1acab63893ac3d1d728161f1df5e36f0e34a1513ae938a83b"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_008_20260217_181440_474820.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_008_20260217_181440_474820.jpg",
          "hash": "3be6818e06bd19b14742ad7547a26c965036c4f391da88595c47ea68df2e06f5"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_009_20260217_181440_491284.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_009_20260217_181440_491284.jpg",
          "hash": "e7730590ca635cd4abbc05e5bde156755ad07e3381da14ae7696079e4c269c8a"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_010_20260217_181440_508271.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_010_20260217_181440_508271.jpg",
          "hash": "831fd722d7b3524f135fee83927720862fdfb8bead03a19316625fa847b4d566"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_011_20260217_181440_524875.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_011_20260217_181440_524875.jpg",
          "hash": "74459a0ac9601866409390968d844aaa049fc0913240cead1bb369bd449b9be2"
        },
        {
          "path": "assets/items_to_break/male/Titanio/item_012_20260217_181440_540399.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/male/Titanio/item_012_20260217_181440_540399.jpg",
          "hash": "54006cdfec7697098adc788f6cfc45122e4ec8fb695b99dfe21adebbbd43f2ba"
        },
        {
          "path": "assets/items_to_break/weapons/Celestita/item_001_20260217_180504_305863.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Celestita/item_001_20260217_180504_305863.jpg",
          "hash": "b34cdd799b3e3599074c1d162e78ad167644b2eb654406f8d02b78dc00d53073"
        },
        {
          "path": "assets/items_to_break/weapons/Celestita/item_002_20260217_180504_340464.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Celestita/item_002_20260217_180504_340464.jpg",
          "hash": "95eeee00b51b06b762a49c4439b31036afc14922f176dedba9a95f102803a995"
        },
        {
          "path": "assets/items_to_break/weapons/Celestita/item_003_20260217_180504_355047.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Celestita/item_003_20260217_180504_355047.jpg",
          "hash": "5ba6717be86e35a0fef42a35e4426cf091b614a7a0f555444ec7594213e74f4d"
        },
        {
          "path": "assets/items_to_break/weapons/Celestita/item_004_20260217_180504_372660.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Celestita/item_004_20260217_180504_372660.jpg",
          "hash": "eb9e000ec308fb223cd5a98bd43fac88da7b924445f4d94b7fa932fb12bd6740"
        },
        {
          "path": "assets/items_to_break/weapons/Celestita/item_005_20260217_180504_389701.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Celestita/item_005_20260217_180504_389701.jpg",
          "hash": "c2c14481df68bc799bd0c49af0e39c63df1f71cc8073f642d58a06be9127a5e9"
        },
        {
          "path": "assets/items_to_break/weapons/Celestita/item_006_20260217_180504_406310.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Celestita/item_006_20260217_180504_406310.jpg",
          "hash": "a0b496c770ea794a09a6c005e0e05492fb43b39ab28a052e77066e178206077d"
        },
        {
          "path": "assets/items_to_break/weapons/Celestita/item_007_20260217_180504_423359.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Celestita/item_007_20260217_180504_423359.jpg",
          "hash": "ac4ece995abf1bf44170033a7fece5c9441cd9373fc2c59582992dd9e7e7a614"
        },
        {
          "path": "assets/items_to_break/weapons/Demonite/item_013_20260217_191306_501943.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Demonite/item_013_20260217_191306_501943.jpg",
          "hash": "bbf8cecc01b3a306bf68f51aa2e35fb3523d0487b9b4d621ebc147f20e33a216"
        },
        {
          "path": "assets/items_to_break/weapons/Demonite/item_014_20260217_191306_518480.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Demonite/item_014_20260217_191306_518480.jpg",
          "hash": "2a14c6efd02c51b2335f4bedd9a514093837ec9f13402e56ba72788a735b58ef"
        },
        {
          "path": "assets/items_to_break/weapons/Demonite/item_015_20260217_191306_535006.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Demonite/item_015_20260217_191306_535006.jpg",
          "hash": "75fd4f214773536e7f49f485ce3cab56acd316d5c173da6530e275634b3f4054"
        },
        {
          "path": "assets/items_to_break/weapons/Demonite/item_016_20260217_191306_552037.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Demonite/item_016_20260217_191306_552037.jpg",
          "hash": "5fb0c4eeacf673a2021e1513bb119f458c10a644bf58b04918f12352fc685b3a"
        },
        {
          "path": "assets/items_to_break/weapons/Demonite/item_017_20260217_191306_569159.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Demonite/item_017_20260217_191306_569159.jpg",
          "hash": "06658efc0d63bd2e3ec1e1950801d5e2e789ca6d86f851961445129723049226"
        },
        {
          "path": "assets/items_to_break/weapons/Demonite/item_018_20260217_191306_585217.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Demonite/item_018_20260217_191306_585217.jpg",
          "hash": "c1606da67f71d52b70e1b70e5b4f2bfa6cf96ab47db39b56a4a4b3d1f6217f7a"
        },
        {
          "path": "assets/items_to_break/weapons/Demonite/item_019_20260217_191306_601338.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Demonite/item_019_20260217_191306_601338.jpg",
          "hash": "e75faf03650e40a9c7ef169078f645b97c6ae7b5c2a414bf79212ead316df450"
        },
        {
          "path": "assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183013.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183013.jpg",
          "hash": "579d257a133a78b3a3fe8fe1b7fdd91dfd8f74f9f297518af5684d634677551d"
        },
        {
          "path": "assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183023.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183023.jpg",
          "hash": "293ae4ab6021155586857fa1f1108b5a1680aec236fe19809f105d8c35708bab"
        },
        {
          "path": "assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183028.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183028.jpg",
          "hash": "9767ac82f9ea39654f3a1f8da7cb5cd223b637e4b5f7112368d210c6f5083369"
        },
        {
          "path": "assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183036.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183036.jpg",
          "hash": "975c6362c46ad1cc33098a1b988569bbebd8cfcdd69e3be6a7c55e9f1a5b25e5"
        },
        {
          "path": "assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183044.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183044.jpg",
          "hash": "f0d0f0d54e1b03cb0314378061dd8c966b2a9d4a74eea25db739a696d8856a1e"
        },
        {
          "path": "assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183050.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183050.jpg",
          "hash": "b00a2e0080775bd0b940182cb1c8bebe548154870f6d0f326600e1b091bd44f9"
        },
        {
          "path": "assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183057.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Dragonio/Screenshot 2025-12-06 183057.jpg",
          "hash": "af3174ba05cb80dcb4e9d621477bae24e46b3dee5a0bce17599493c9cf2b4f93"
        },
        {
          "path": "assets/items_to_break/weapons/Guarda/item_001_20260217_183744_122636.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Guarda/item_001_20260217_183744_122636.jpg",
          "hash": "e886d15ee790dc9a4f165b6109b7f0ba2eeb9a0f8d770ffd3263d7ab16536d93"
        },
        {
          "path": "assets/items_to_break/weapons/Guarda/item_002_20260217_183744_155873.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Guarda/item_002_20260217_183744_155873.jpg",
          "hash": "fc62bfb04cb51e775f3e563196f1ff348555b9d031717ff442293c20d8aa46ca"
        },
        {
          "path": "assets/items_to_break/weapons/Guarda/item_003_20260217_183744_171413.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Guarda/item_003_20260217_183744_171413.jpg",
          "hash": "342b7c3b78248f556e6981780e04290a99f53bb4093ec0640a2a2bc2e78452d4"
        },
        {
          "path": "assets/items_to_break/weapons/Guarda/item_004_20260217_183744_187998.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Guarda/item_004_20260217_183744_187998.jpg",
          "hash": "6ca04112b174a3c8a4b03a50cf5ecac14711897ca50ebaa83ea7eccdf9ee33d4"
        },
        {
          "path": "assets/items_to_break/weapons/Guarda/item_005_20260217_183744_205023.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Guarda/item_005_20260217_183744_205023.jpg",
          "hash": "8ccf8bfed439f60002100c7429118dc234634e1b35d31700726c56621effc883"
        },
        {
          "path": "assets/items_to_break/weapons/Guarda/item_006_20260217_183744_222627.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Guarda/item_006_20260217_183744_222627.jpg",
          "hash": "160d81091ea38808c0e6ba8cf501fa0100d1f2a808c44581a53e5c23e286a4a1"
        },
        {
          "path": "assets/items_to_break/weapons/Guarda/item_007_20260217_183744_239207.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Guarda/item_007_20260217_183744_239207.jpg",
          "hash": "9686afd6f50f6ea12480df5aabc00e235040019c34fe4e6218b91052be6bd157"
        },
        {
          "path": "assets/items_to_break/weapons/Mitril/item_013_20260217_185509_778393.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Mitril/item_013_20260217_185509_778393.jpg",
          "hash": "75be7c285895d49035289bd2ac93093ec09bbd6cd95ded8cc5814d6658fee7f6"
        },
        {
          "path": "assets/items_to_break/weapons/Mitril/item_014_20260217_185509_795915.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Mitril/item_014_20260217_185509_795915.jpg",
          "hash": "76472e3ccd7fccf46534cbd10410433113b2eea5b450fb99bc075056480df064"
        },
        {
          "path": "assets/items_to_break/weapons/Mitril/item_015_20260217_185509_812492.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Mitril/item_015_20260217_185509_812492.jpg",
          "hash": "a942b0fab9c998310880ae1d593d813fc3a87fd72ccc00fa92f4406733e7d6d1"
        },
        {
          "path": "assets/items_to_break/weapons/Mitril/item_016_20260217_185509_829008.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Mitril/item_016_20260217_185509_829008.jpg",
          "hash": "2cb7969fbd478928fe179cd123dc285ddb5ed3bb360ab16a32b65acf98590070"
        },
        {
          "path": "assets/items_to_break/weapons/Mitril/item_017_20260217_185509_846073.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Mitril/item_017_20260217_185509_846073.jpg",
          "hash": "2e160af4a58916d71e443a122d97f2b41a9a3abd90b3f935a2a27545445f7200"
        },
        {
          "path": "assets/items_to_break/weapons/Mitril/item_018_20260217_185509_861563.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Mitril/item_018_20260217_185509_861563.jpg",
          "hash": "70f319a82cba06a9e1a5538ff92593453854ea4eb9528143a0f39a5fdf606c78"
        },
        {
          "path": "assets/items_to_break/weapons/Mitril/item_019_20260217_185509_879718.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Mitril/item_019_20260217_185509_879718.jpg",
          "hash": "ab56d6217c3cdf78e51efff03ae92470f2d71936facad12cf97831cf854bd665"
        },
        {
          "path": "assets/items_to_break/weapons/Orichalco/item_013_20260217_190202_268944.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Orichalco/item_013_20260217_190202_268944.jpg",
          "hash": "c6e114296a0d797d79e268dc9a11bbda8a4b765827ee2c2292091db72bf9f414"
        },
        {
          "path": "assets/items_to_break/weapons/Orichalco/item_014_20260217_190202_285625.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Orichalco/item_014_20260217_190202_285625.jpg",
          "hash": "b72573cc71cdbb869f2635dc5b82b5d2f49a28437f0a00ddd8ba6f785b5418eb"
        },
        {
          "path": "assets/items_to_break/weapons/Orichalco/item_015_20260217_190202_301145.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Orichalco/item_015_20260217_190202_301145.jpg",
          "hash": "b29c8ee053f80698fb6c28509ecaf7f584d83bdb4eaeb42378941b9d7dfbb6f1"
        },
        {
          "path": "assets/items_to_break/weapons/Orichalco/item_016_20260217_190202_318236.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Orichalco/item_016_20260217_190202_318236.jpg",
          "hash": "9451e6b0b231743eced65794da4a3b9e5598998bb08db81c02a1c7f8715ddec3"
        },
        {
          "path": "assets/items_to_break/weapons/Orichalco/item_017_20260217_190202_336842.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Orichalco/item_017_20260217_190202_336842.jpg",
          "hash": "1a0954cb1ebc88be693288664d0c9270cd785c233e6912066ed03f4a2a6b7d6a"
        },
        {
          "path": "assets/items_to_break/weapons/Orichalco/item_018_20260217_190202_351807.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Orichalco/item_018_20260217_190202_351807.jpg",
          "hash": "dfc79d5ca93e456b10a249024484b81c9cc80eb92e4b6e682c60632f170df786"
        },
        {
          "path": "assets/items_to_break/weapons/Orichalco/item_019_20260217_190202_368342.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Orichalco/item_019_20260217_190202_368342.jpg",
          "hash": "4c27333e6fa3d1db4d96cb8157130ae1980b920407f826d7f3854b4fa05e9846"
        },
        {
          "path": "assets/items_to_break/weapons/Osmio/item_001_20260217_182903_134622.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Osmio/item_001_20260217_182903_134622.jpg",
          "hash": "abf1172a8ca46b989bab02cdd75fe2761517b86c303d737cc093353322bb83fb"
        },
        {
          "path": "assets/items_to_break/weapons/Osmio/item_002_20260217_182903_170292.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Osmio/item_002_20260217_182903_170292.jpg",
          "hash": "9fd16d15370f8834344ce412c67faea848bf92434cf36bb01046272c0a44e3ea"
        },
        {
          "path": "assets/items_to_break/weapons/Osmio/item_003_20260217_182903_184809.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Osmio/item_003_20260217_182903_184809.jpg",
          "hash": "ba4b7141b20103003b27f7370d8ed21199e73ce58a5c4197746013e61b48fbd6"
        },
        {
          "path": "assets/items_to_break/weapons/Osmio/item_004_20260217_182903_202869.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Osmio/item_004_20260217_182903_202869.jpg",
          "hash": "c7a6f0ef7d5e8f7e78e41f9a6d53e2b522068c75a502e117f030aed911fd5309"
        },
        {
          "path": "assets/items_to_break/weapons/Osmio/item_005_20260217_182903_219452.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Osmio/item_005_20260217_182903_219452.jpg",
          "hash": "eba4013dee2be56154bc149be830f5dcfe114a4088e6742f1ad603182780bdb8"
        },
        {
          "path": "assets/items_to_break/weapons/Osmio/item_006_20260217_182903_236093.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Osmio/item_006_20260217_182903_236093.jpg",
          "hash": "5a151dc580d683558161b60d4e6d02abb60aad36f6c5cab7ec6ebaba85a66799"
        },
        {
          "path": "assets/items_to_break/weapons/Osmio/item_007_20260217_182903_253100.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Osmio/item_007_20260217_182903_253100.jpg",
          "hash": "a529635b6be54f2ad7361540ca777f24512fdd791ea6a7ab72df7896e0369c8c"
        },
        {
          "path": "assets/items_to_break/weapons/Paladio/item_013_20260217_190716_093261.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Paladio/item_013_20260217_190716_093261.jpg",
          "hash": "376fcd8cb13405c583b426291d6c08943ec0efd921ae1708469651076c41663f"
        },
        {
          "path": "assets/items_to_break/weapons/Paladio/item_014_20260217_190716_110944.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Paladio/item_014_20260217_190716_110944.jpg",
          "hash": "94a4a4e687c681ad460e521977c7437f67badf860e60f5f8b3ffdc5cf06752a0"
        },
        {
          "path": "assets/items_to_break/weapons/Paladio/item_015_20260217_190716_126445.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Paladio/item_015_20260217_190716_126445.jpg",
          "hash": "a9ba79538680064d26f79a33a8a89ef2f191c1e0d23e9b59e1e489575341b0be"
        },
        {
          "path": "assets/items_to_break/weapons/Paladio/item_016_20260217_190716_143056.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Paladio/item_016_20260217_190716_143056.jpg",
          "hash": "e8e1634743d49d847de46d2de4bafcb51dfc20f805137d510b9be0b2a2dc14c6"
        },
        {
          "path": "assets/items_to_break/weapons/Paladio/item_017_20260217_190716_160564.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Paladio/item_017_20260217_190716_160564.jpg",
          "hash": "9dc99bfc1121aad467a1f774460d0db19252c74491c2d0bf24568194baafaed1"
        },
        {
          "path": "assets/items_to_break/weapons/Paladio/item_018_20260217_190716_176155.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Paladio/item_018_20260217_190716_176155.jpg",
          "hash": "52e6de39455d715c5d98ac91f66190ca6b32f36119b77736e90644a62f851bad"
        },
        {
          "path": "assets/items_to_break/weapons/Paladio/item_019_20260217_190716_194261.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Paladio/item_019_20260217_190716_194261.jpg",
          "hash": "a9fcbaf4f98d2180169843bdaf814f92ae6099e4bb3f5d74467481da95a5562c"
        },
        {
          "path": "assets/items_to_break/weapons/Sigmetal/item_001_20260217_184627_842200.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Sigmetal/item_001_20260217_184627_842200.jpg",
          "hash": "207de321984b0a6e114f6921febf110a10b60ca6f1d6728d45fbf781952ef9f4"
        },
        {
          "path": "assets/items_to_break/weapons/Sigmetal/item_002_20260217_184627_875872.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Sigmetal/item_002_20260217_184627_875872.jpg",
          "hash": "8c9488e2c5c103ce1b329a8f7e042f23d9ca8f7e6c2d3624cf0ad9c02e6f335c"
        },
        {
          "path": "assets/items_to_break/weapons/Sigmetal/item_003_20260217_184627_892356.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Sigmetal/item_003_20260217_184627_892356.jpg",
          "hash": "b76c0a2e2f5a985e0e90a13e92b9115624a471714d2626390f28ee922ed906d7"
        },
        {
          "path": "assets/items_to_break/weapons/Sigmetal/item_004_20260217_184627_908965.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Sigmetal/item_004_20260217_184627_908965.jpg",
          "hash": "be229de49ad56ee60968c80a3bbd2f88df82451ca9c074800f0a3a74e7386503"
        },
        {
          "path": "assets/items_to_break/weapons/Sigmetal/item_005_20260217_184627_926058.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Sigmetal/item_005_20260217_184627_926058.jpg",
          "hash": "de03f5cc801232b834822c5765c3d14735e85d364da89dcf3eaff97b10589482"
        },
        {
          "path": "assets/items_to_break/weapons/Sigmetal/item_006_20260217_184627_942106.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Sigmetal/item_006_20260217_184627_942106.jpg",
          "hash": "4c9bfc5167e54fb62ec59773b01c254a3e57b10d87dc7d8f9063b46196c92471"
        },
        {
          "path": "assets/items_to_break/weapons/Sigmetal/item_007_20260217_184627_959148.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Sigmetal/item_007_20260217_184627_959148.jpg",
          "hash": "768dc42681033fa1750d4d38f16f61ee839f897a30d09361b371d4da40c5b611"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio Negro/item_001_20260217_182615_439834.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio Negro/item_001_20260217_182615_439834.jpg",
          "hash": "f7db03b06725e6bf1a204c5fd3275790c477a1eacf7c28bf84e95d3f2e50399b"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio Negro/item_002_20260217_182615_473363.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio Negro/item_002_20260217_182615_473363.jpg",
          "hash": "059e1905ce270c9b58e2969c624fe893a646f501256fc34db6c6267a04054ff2"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio Negro/item_003_20260217_182615_490395.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio Negro/item_003_20260217_182615_490395.jpg",
          "hash": "2b2e5d42f6f0cf29a794a46e71f5e3f38b40c6bb00b4bdd7369061ae85e77279"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio Negro/item_004_20260217_182615_506974.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio Negro/item_004_20260217_182615_506974.jpg",
          "hash": "a789b456aeaa7f64d602af6ff3b53fdb87e53338d9769da4a35b03cac98364c6"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio Negro/item_005_20260217_182615_523590.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio Negro/item_005_20260217_182615_523590.jpg",
          "hash": "b25dd38e94829bcce69357cfa4a165dadfb3aab81dc62f4e16a19d24587372d8"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio Negro/item_006_20260217_182615_540130.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio Negro/item_006_20260217_182615_540130.jpg",
          "hash": "74a952b82297cf7dc7776c8a3bf352805d8fe1d89f51bcf40f67e18418d1bef6"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio Negro/item_007_20260217_182615_555705.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio Negro/item_007_20260217_182615_555705.jpg",
          "hash": "0910c71dc28938cf5ff850e34bdd07c97df7c17b0dc3eec9e71ae2d055f729c0"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio/item_001_20260217_181229_194698.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio/item_001_20260217_181229_194698.jpg",
          "hash": "b65a018540a437b61d3da4bc657ef253b9f0f6c9856c87f63437efc28e40ad1a"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio/item_002_20260217_181229_227731.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio/item_002_20260217_181229_227731.jpg",
          "hash": "dc6953bce630bdb560175a475a828405434591b130f015a5640e5f3ec5bb680c"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio/item_003_20260217_181229_243690.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio/item_003_20260217_181229_243690.jpg",
          "hash": "903d99269eed5a288069153e63a1796e089ad1bbd890c3ed49c4ae342aca096d"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio/item_004_20260217_181229_261809.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio/item_004_20260217_181229_261809.jpg",
          "hash": "8bf02b0efe5a399d8b3dffd15dbc0f06cb1e43e041b1156d006c1d99bb727c11"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio/item_005_20260217_181229_277909.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio/item_005_20260217_181229_277909.jpg",
          "hash": "df55716ea7f80a32300fe6544bfcd18a5b02b1b6371da256f4d19f4f804bb8e6"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio/item_006_20260217_181229_295963.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio/item_006_20260217_181229_295963.jpg",
          "hash": "3ccee571b24b6a6300785984c98696ff1a7a40c9d11ebc52a640085f133f50d9"
        },
        {
          "path": "assets/items_to_break/weapons/Titanio/item_007_20260217_181229_310915.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/items_to_break/weapons/Titanio/item_007_20260217_181229_310915.jpg",
          "hash": "b78481ecc805a8c792cd71e07724d5feee2333a400409f15fbf87e1fbef20bba"
        },
        {
          "path": "assets/mobkind/boss.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/mobkind/boss.jpg",
          "hash": "b8f69f7171758deab5eca95af6178d4512a49d7979461a84a5183136e33760aa"
        },
        {
          "path": "assets/mobkind/none.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/mobkind/none.jpg",
          "hash": "2688d23296e9c651f35d2c584c740d16dfa5726db592fb2d30fda116bb7ec55e"
        },
        {
          "path": "assets/mobkind/normal.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/mobkind/normal.jpg",
          "hash": "b37d46a93165bfabe573127adfc16b963115bae17806ecc471f067774e43629a"
        },
        {
          "path": "assets/mobkind/tech.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/mobkind/tech.jpg",
          "hash": "0aeed40819d7fb436c2edc1f17fbb64fc4441b41604bd9342b21a8ef40107fad"
        },
        {
          "path": "assets/multiple/azul/azul_region_001_20260221_193554_654340.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul/azul_region_001_20260221_193554_654340.jpg",
          "hash": "c85e9fb6efbced3145ff609aaae720307be91aa6a5555aa1c6e8d25b48c38168"
        },
        {
          "path": "assets/multiple/azul/azul_region_002_20260221_193554_887077.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul/azul_region_002_20260221_193554_887077.jpg",
          "hash": "d31b310083b15a7e4ee47634530a293b76969924aa330ac0b3648c6f94ea642f"
        },
        {
          "path": "assets/multiple/azul/azul_region_003_20260221_193555_103213.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul/azul_region_003_20260221_193555_103213.jpg",
          "hash": "a1ccf65a33ad838c2911b3b81e7dafbde2ea5470902eae31d9ef737edce678cb"
        },
        {
          "path": "assets/multiple/azul/azul_region_004_20260221_193555_321005.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul/azul_region_004_20260221_193555_321005.jpg",
          "hash": "f65ed3de1db2c59516637cb797efa83e144f3034ca20f7c6f55e5639e5f97ab5"
        },
        {
          "path": "assets/multiple/azul/azul_region_005_20260221_193555_537467.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul/azul_region_005_20260221_193555_537467.jpg",
          "hash": "8015378fef59aadd05b7719675e2721440d713355969dba57c614f2d91d88a50"
        },
        {
          "path": "assets/multiple/azul_/azul__region_001_20260221_193605_721250.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul_/azul__region_001_20260221_193605_721250.jpg",
          "hash": "ad7164ab6053e5a382a00e8583f9bf02983445552ae681acb750416d9c5d7fd5"
        },
        {
          "path": "assets/multiple/azul_/azul__region_002_20260221_193605_937485.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul_/azul__region_002_20260221_193605_937485.jpg",
          "hash": "a282dba52cef2224353dcc62cecb86e06c6dfb13c7956b98f1e96e78ebfd791a"
        },
        {
          "path": "assets/multiple/azul_/azul__region_003_20260221_193606_154608.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul_/azul__region_003_20260221_193606_154608.jpg",
          "hash": "71a6f9d5a781909926b73acc7cbd38e6a0ed888b92a32ea7838e7564e28b9969"
        },
        {
          "path": "assets/multiple/azul_/azul__region_004_20260221_193606_369892.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul_/azul__region_004_20260221_193606_369892.jpg",
          "hash": "004b6be35ecc4d11e979acd480b287836e90b74231c56107f74e65f177c9fc24"
        },
        {
          "path": "assets/multiple/azul_/azul__region_005_20260221_193606_587541.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/azul_/azul__region_005_20260221_193606_587541.jpg",
          "hash": "4a7c6194b4748968412b28fe0997328b70f9c8dedc40ffe20fe46146110b7037"
        },
        {
          "path": "assets/multiple/ophidia/ophidia_region_001_20260221_193505_622408.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/ophidia/ophidia_region_001_20260221_193505_622408.jpg",
          "hash": "13c49998b85276e75e843d94c77645f449f00ea6742ae24028979a383ee82517"
        },
        {
          "path": "assets/multiple/ophidia/ophidia_region_002_20260221_193505_855422.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/ophidia/ophidia_region_002_20260221_193505_855422.jpg",
          "hash": "7916a005c019a4f4169d08a5836b3a12d97ac4dbef91b7da70ef06021bc3c5fb"
        },
        {
          "path": "assets/multiple/ophidia/ophidia_region_003_20260221_193506_072156.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/ophidia/ophidia_region_003_20260221_193506_072156.jpg",
          "hash": "26d1cadbc9a8fee57341f15e82c9a2c97e54c1b9fe09e2704dd7a96c9b86d875"
        },
        {
          "path": "assets/multiple/ophidia/ophidia_region_004_20260221_193506_289323.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/ophidia/ophidia_region_004_20260221_193506_289323.jpg",
          "hash": "fa1d3ae7c37a24aa8377af785a6c3343763f8f04ab5d7d08210b0b505d767dfa"
        },
        {
          "path": "assets/multiple/ophidia/ophidia_region_005_20260221_193506_505791.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/ophidia/ophidia_region_005_20260221_193506_505791.jpg",
          "hash": "cca3aaea623a71122a26a3419f934f1d57b956ddfa28f36d9b546d9dff72d64a"
        },
        {
          "path": "assets/multiple/pain/pain_region_001_20260221_193411_308040.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pain/pain_region_001_20260221_193411_308040.jpg",
          "hash": "25ea9a1f04064771423751b2845b2d6d4105415aae649b923ec5f1e09e0cd163"
        },
        {
          "path": "assets/multiple/pain/pain_region_002_20260221_193411_540299.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pain/pain_region_002_20260221_193411_540299.jpg",
          "hash": "afcb44eee4770e1a3146e704e72e52318d45a6caeee9e1b5fffad842777fd9da"
        },
        {
          "path": "assets/multiple/pain/pain_region_003_20260221_193411_756901.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pain/pain_region_003_20260221_193411_756901.jpg",
          "hash": "0685fc6a6ca7eb7adae68fc373c68d8ef8b51810802514ac64ecd30ee982a020"
        },
        {
          "path": "assets/multiple/pain/pain_region_004_20260221_193411_974060.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pain/pain_region_004_20260221_193411_974060.jpg",
          "hash": "41d41bfebf98b378410521ca5bfda6e52269c0dca37e7d9c0f39fea6514df25a"
        },
        {
          "path": "assets/multiple/pain/pain_region_005_20260221_193412_190677.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pain/pain_region_005_20260221_193412_190677.jpg",
          "hash": "737d99cb4bc7979c6ed3fc749c22ed67794d7490e38bccc409fc89a7c5bd5a26"
        },
        {
          "path": "assets/multiple/prideus/prideus_region_001_20260221_193532_355866.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/prideus/prideus_region_001_20260221_193532_355866.jpg",
          "hash": "09b13526aa51ced04a6c05d962d251435e9506cf8174849bdf776a9081b8fc58"
        },
        {
          "path": "assets/multiple/prideus/prideus_region_002_20260221_193532_587249.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/prideus/prideus_region_002_20260221_193532_587249.jpg",
          "hash": "b90577bd24eddace04fcf202c9dbf56a97e2421ebcf8e1717354e176d1f22f93"
        },
        {
          "path": "assets/multiple/prideus/prideus_region_003_20260221_193532_804251.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/prideus/prideus_region_003_20260221_193532_804251.jpg",
          "hash": "6f877619537b11d670228367c3c7089b306449d3a2b9ad81d352a4443bc8bd6a"
        },
        {
          "path": "assets/multiple/prideus/prideus_region_004_20260221_193533_021710.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/prideus/prideus_region_004_20260221_193533_021710.jpg",
          "hash": "cac0fd56553295aafaa3fa947c32f4eb949e8ff5759234606fcda9002dfde36e"
        },
        {
          "path": "assets/multiple/prideus/prideus_region_005_20260221_193533_236933.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/prideus/prideus_region_005_20260221_193533_236933.jpg",
          "hash": "bd160aff4baa67c8de4811922c9818a184821fb627ce26bc7387f97e9e7b1b6d"
        },
        {
          "path": "assets/multiple/pw5/pw5_region_001_20260221_193453_821256.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pw5/pw5_region_001_20260221_193453_821256.jpg",
          "hash": "3e9bbc07bcb3c9250b9130bba91b1a31e9569b6ac396a97ab949fbd0c1b58070"
        },
        {
          "path": "assets/multiple/pw5/pw5_region_002_20260221_193454_039151.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pw5/pw5_region_002_20260221_193454_039151.jpg",
          "hash": "d2eff941761a8a031e660d17709679c2d49aed050ddadadc8d641ff9436963f9"
        },
        {
          "path": "assets/multiple/pw5/pw5_region_003_20260221_193454_256298.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pw5/pw5_region_003_20260221_193454_256298.jpg",
          "hash": "4f27426523ff3533c1924e6eb3dcdb05ca97c72c876635024efa649734704942"
        },
        {
          "path": "assets/multiple/pw5/pw5_region_004_20260221_193454_473227.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pw5/pw5_region_004_20260221_193454_473227.jpg",
          "hash": "1fa4fce2d885f13910334014e750bc72c47a7f5ff1cf681536d5aace003d11d1"
        },
        {
          "path": "assets/multiple/pw5/pw5_region_005_20260221_193454_689270.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/pw5/pw5_region_005_20260221_193454_689270.jpg",
          "hash": "d25406227a2e8b9bfb6f072af97464c7e6c2daa3761220e3420aab4a30cfa1ce"
        },
        {
          "path": "assets/multiple/qw7/qw7_region_001_20260221_193523_221515.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/qw7/qw7_region_001_20260221_193523_221515.jpg",
          "hash": "926b00506af8f3e38252ea56475791d8504b23e9aa0f9dd93b4f5be8cef3416f"
        },
        {
          "path": "assets/multiple/qw7/qw7_region_002_20260221_193523_455110.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/qw7/qw7_region_002_20260221_193523_455110.jpg",
          "hash": "715d48a6bd6d1b5cc717d771808adc5a7db05e84cad44b6c7b7accef2d6644df"
        },
        {
          "path": "assets/multiple/qw7/qw7_region_003_20260221_193523_672191.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/qw7/qw7_region_003_20260221_193523_672191.jpg",
          "hash": "e3593a677cc881f314112928460800bbb6a224bc0562102d72e028b99f685aba"
        },
        {
          "path": "assets/multiple/qw7/qw7_region_004_20260221_193523_888521.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/qw7/qw7_region_004_20260221_193523_888521.jpg",
          "hash": "158195d4013d5dad9e046fe55ec973eeaefdd4b5f13b3739650083a8c16c0394"
        },
        {
          "path": "assets/multiple/qw7/qw7_region_005_20260221_193524_104615.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/qw7/qw7_region_005_20260221_193524_104615.jpg",
          "hash": "e7f8839833ebc13d5c436596e6bcc2cf374589d0ad0cecdce23b5e31959763ae"
        },
        {
          "path": "assets/multiple/rw3/rw3_region_001_20260221_193359_924116.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3/rw3_region_001_20260221_193359_924116.jpg",
          "hash": "3f88edad416185fadc0792ba2e13343da5d9dd6567fd9c275868c37019620d2a"
        },
        {
          "path": "assets/multiple/rw3/rw3_region_002_20260221_193400_157439.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3/rw3_region_002_20260221_193400_157439.jpg",
          "hash": "8edcbd58048c76e243fd6539572a73f3f790cf2a24d7a28261b22bacf95f29a5"
        },
        {
          "path": "assets/multiple/rw3/rw3_region_003_20260221_193400_374071.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3/rw3_region_003_20260221_193400_374071.jpg",
          "hash": "0f47b7eb37fad78ad2f296f6c63f1de1a35e7d139557afc052f091d96d9eb2b2"
        },
        {
          "path": "assets/multiple/rw3/rw3_region_004_20260221_193400_590696.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3/rw3_region_004_20260221_193400_590696.jpg",
          "hash": "96a3842cc704808e6204aad9103d5f6531a9006767e244a8997d9ff512260c74"
        },
        {
          "path": "assets/multiple/rw3/rw3_region_005_20260221_193400_807204.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3/rw3_region_005_20260221_193400_807204.jpg",
          "hash": "c20e2b2ee2df634f1c5255890b688a0eaa04d11d763829f63216f02e6bef3eec"
        },
        {
          "path": "assets/multiple/rw3_/rw3__region_001_20260221_193543_622592.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3_/rw3__region_001_20260221_193543_622592.jpg",
          "hash": "c2e6a412950493ff5527d8012afeb48207d23893c90b614fca49d489b1196fbf"
        },
        {
          "path": "assets/multiple/rw3_/rw3__region_002_20260221_193543_854390.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3_/rw3__region_002_20260221_193543_854390.jpg",
          "hash": "924c1a81dc990375a519bd1af376fb4ffbcf4633fe4bbfff242dce43461f4b58"
        },
        {
          "path": "assets/multiple/rw3_/rw3__region_003_20260221_193544_071991.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3_/rw3__region_003_20260221_193544_071991.jpg",
          "hash": "1a6f79f98f5242599a6f32ec489666a5e6eb1d54abde695bb41137202072dc47"
        },
        {
          "path": "assets/multiple/rw3_/rw3__region_004_20260221_193544_287845.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3_/rw3__region_004_20260221_193544_287845.jpg",
          "hash": "3ea2040526a6cb52c16166b934d7be5aae70da14c0687e907f324fa3c2e3f3f1"
        },
        {
          "path": "assets/multiple/rw3_/rw3__region_005_20260221_193544_504724.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/multiple/rw3_/rw3__region_005_20260221_193544_504724.jpg",
          "hash": "b92320836434167b4cf457df220799d5db8e19e8ae157b0009c577248babcc50"
        },
        {
          "path": "assets/obter_mandarat/obter_mandarat.jpg",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/assets/obter_mandarat/obter_mandarat.jpg",
          "hash": "dedcc112ac9469decc45439688b93547cf5c2c5f91c5e45ae49f16a887e83708"
        },
        {
          "path": "dungeon_scripts/Altar_Sagrado.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Altar_Sagrado.json",
          "hash": "702ff34f77be81071ee7ceca528fd8e200aca3f509c6d26c6997925f13021732"
        },
        {
          "path": "dungeon_scripts/Altar_Sagrado.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Altar_Sagrado.py",
          "hash": "28abe0b2df696a6a9b9f36f5d4be7e6cb129077bbd0ab93a716a3d4c35b5dc27"
        },
        {
          "path": "dungeon_scripts/Desfiladeiro_Congelado.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Desfiladeiro_Congelado.json",
          "hash": "9f597d981c96862485d5e449785219603ec70e377b83555c32b70a2e5c3a8d09"
        },
        {
          "path": "dungeon_scripts/Desfiladeiro_Congelado.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Desfiladeiro_Congelado.py",
          "hash": "5abcbfce9056747cfd5b09a05925ce68d08a174f33ca0d61f484a3f296970e13"
        },
        {
          "path": "dungeon_scripts/Keldrasil_Sagrado.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Keldrasil_Sagrado.json",
          "hash": "9ab4b1f88d080dce20fe4c5625eda70a3a61fceedcfe7abb88ec6db0f39e3924"
        },
        {
          "path": "dungeon_scripts/Keldrasil_Sagrado.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Keldrasil_Sagrado.py",
          "hash": "b506a3be66bf450e133606bc3392ca2f069392eaf91c0e50c0d37c00f56eea8f"
        },
        {
          "path": "dungeon_scripts/Moinho_Sagrado.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Moinho_Sagrado.json",
          "hash": "25e0c25c24096e3f1dd0bc5579e6f5b5762a41f2b6eeef20be24f478bc0b92c5"
        },
        {
          "path": "dungeon_scripts/Moinho_Sagrado.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Moinho_Sagrado.py",
          "hash": "d4519b031efc2041c4ee64b56479065ab38d3b3600966c0c7726c8ed59c55872"
        },
        {
          "path": "dungeon_scripts/Pandemonio.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Pandemonio.json",
          "hash": "2b0aa487f133f041eb9a7ea0b4c231a2303c338df720de1f8e8997f7fce18870"
        },
        {
          "path": "dungeon_scripts/Pandemonio.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Pandemonio.py",
          "hash": "e17539f6f95264a8305c819c253095978f77ce1a6937de928e5a15f8aee71647"
        },
        {
          "path": "dungeon_scripts/Parte_do_Mapa copy.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Parte_do_Mapa copy.py",
          "hash": "a39e981bced41108e2ded4553182824b55c5ddd2f7bb155eb82ab056079f2adf"
        },
        {
          "path": "dungeon_scripts/Parte_do_Mapa.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Parte_do_Mapa.json",
          "hash": "f512d50a0eea29bd975830b27c0d7b35923dd9d0830685802374bd30b19b001d"
        },
        {
          "path": "dungeon_scripts/Parte_do_Mapa.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/Parte_do_Mapa.py",
          "hash": "3c8bb7b40d7376ad25dd40e73f2e2b97b064b1bd7011ee4dad2bd7d89de312b0"
        },
        {
          "path": "dungeon_scripts/check.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/check.py",
          "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        },
        {
          "path": "dungeon_scripts/scope.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/scope.py",
          "hash": "169b13d528f73bbf65674b442655bb12bcac2c0aa7f6a956fe1fe9a4c209115f"
        },
        {
          "path": "dungeon_scripts/test_segment.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/test_segment.py",
          "hash": "6ecf3e8318044334eda86eeed28cd884be9db05f6345095a25f6883da9755812"
        },
        {
          "path": "dungeon_scripts/test_segment_en.py",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/dungeon_scripts/test_segment_en.py",
          "hash": "67d6e1ddcb2f9a671239a8df33af875fe2d26cc3dca04cca6136fe360e81945e"
        },
        {
          "path": "sequence.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/sequence.json",
          "hash": "e0ef28ffde1ca5f836ff0b891915261016099cea64ce4300718a572d4892dd18"
        },
        {
          "path": "settings.json",
          "url": "https://raw.githubusercontent.com/Gabrielcesar9/project_newton/main/settings.json",
          "hash": "bd5aa1ca47f2a256232753bc3c5a4c123667adcb4f174d92cf6ce4e4297a7faa"
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
