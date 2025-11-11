# Test Backend Server

This is a simple mock backend server for testing the database auto-save functionality.

## Installation

```bash
cd test-backend
npm install
```

## Running the Server

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

The server will run on http://127.0.0.1:3000

## Testing the Integration

1. Start the backend server:
   ```bash
   cd test-backend
   npm install
   npm start
   ```

2. In another terminal, start the frontend:
   ```bash
   cd ..
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

4. Enable "Database Auto-save" in the sidebar

5. Make changes to the diagram (add nodes, move nodes, etc.)

6. Watch the console logs in the backend terminal to see save requests

7. Check the status indicators in the frontend sidebar

## API Endpoints

- `GET /api/health` - Check server status
- `POST /api/diagrams/save` - Save a diagram
- `GET /api/diagrams/:id` - Get a specific diagram
- `GET /api/diagrams` - List all diagrams
- `DELETE /api/diagrams/:id` - Delete a diagram
- `POST /api/generate/flow` - Generate flow (mock)

## Notes

- This is an in-memory mock server - data is lost when the server restarts
- For production use, replace the Map storage with a real database (MongoDB, PostgreSQL, etc.)
- No authentication or authorization is implemented - add this for production use
