# Backend Validation Server

This is a simple Node.js Express server to validate user-hardware access for your application.

## How to Run

1. Open a terminal in the `backend` folder.
2. Install dependencies:
   
   npm install express

3. Start the server:
   
   node server.js

The server will listen on port 3000 by default.

## API Endpoint

POST /validate

Body (JSON):
```
{
  "username": "Mark",
  "hardware_id": "MB123456789"
}
```

Response:
- `{ "status": "allowed" }` if access is granted
- `{ "status": "denied" }` if not

## Notes
- The allowed users/hardware are hardcoded in `server.js` for now. Replace with a database for production use.
