# Database Auto-Save Feature

## Overview

The UI Diagram Generator now supports automatic saving of diagrams to a backend database in addition to the existing localStorage auto-save functionality.

## Features

### Dual Auto-Save System

1. **Local Storage Auto-Save** (Always Active)
   - Automatically saves diagrams to browser's localStorage
   - Serves as a fallback/backup mechanism
   - Persists across browser sessions
   - No network dependency

2. **Database Auto-Save** (Optional)
   - Saves diagrams to a backend database via REST API
   - Can be toggled on/off via UI checkbox
   - Provides persistent storage across devices
   - Enables collaboration and sharing capabilities

## Technical Implementation

### Backend API Endpoint

The frontend expects a backend API endpoint at:

```
POST http://127.0.0.1:3000/api/diagrams/save
```

**Request Body:**
```json
{
  "id": "diagram-id-or-null",
  "nodes": [...],
  "edges": [...],
  "savedAt": "2025-11-11T06:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "generated-or-existing-diagram-id",
  "message": "Diagram saved successfully"
}
```

### How It Works

1. **Auto-Save Trigger**: When nodes or edges change, a 2-second debounce timer starts
2. **Local Save**: First, the diagram is saved to localStorage
3. **Database Save**: If database auto-save is enabled, the diagram is sent to the backend API
4. **Status Updates**: Both save operations update their respective status indicators in the UI

### State Management

New state variables added:
- `dbAutoSaveEnabled`: Boolean to enable/disable database auto-save
- `dbAutoSaveStatus`: Status of database save ('saved' | 'saving' | 'error' | 'idle')
- `diagramId`: Unique identifier for the diagram (returned by backend on first save)

## UI Components

### Database Auto-Save Toggle

Located in the left sidebar below the local auto-save indicator:
- Checkbox to enable/disable database auto-save
- Real-time status indicator showing save state
- Displays diagram ID when available

### Status Indicators

**Local Auto-Save:**
- ✅ Green: Successfully saved to localStorage
- ⏳ Yellow: Currently saving
- 💾 Gray: Ready to save

**Database Auto-Save:**
- ✅ Green: Successfully saved to database
- ⏳ Yellow: Currently saving to database
- ❌ Red: Save failed (network error or server issue)
- 🗄️ Gray: Ready to save

## Backend Implementation Requirements

To fully implement this feature, you need to create a backend API with the following capabilities:

### Required Endpoints

1. **Save Diagram**
   ```
   POST /api/diagrams/save
   ```
   - Accept diagram data (id, nodes, edges, savedAt)
   - If id is null, create a new diagram and return new id
   - If id exists, update the existing diagram
   - Return the diagram id in response

2. **Load Diagram** (Future Enhancement)
   ```
   GET /api/diagrams/:id
   ```
   - Retrieve diagram by id
   - Return nodes, edges, and metadata

3. **List Diagrams** (Future Enhancement)
   ```
   GET /api/diagrams
   ```
   - List all diagrams for the user
   - Support pagination and filtering

### Example Backend Implementation (Node.js/Express)

```javascript
const express = require('express');
const app = express();
app.use(express.json());

// In-memory storage (replace with actual database)
const diagrams = new Map();

app.post('/api/diagrams/save', (req, res) => {
  try {
    const { id, nodes, edges, savedAt } = req.body;
    
    let diagramId = id;
    if (!diagramId) {
      // Generate new ID
      diagramId = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Save to database (here using Map as example)
    diagrams.set(diagramId, {
      id: diagramId,
      nodes,
      edges,
      savedAt,
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      id: diagramId,
      message: 'Diagram saved successfully'
    });
  } catch (error) {
    console.error('Error saving diagram:', error);
    res.status(500).json({ error: 'Failed to save diagram' });
  }
});

app.listen(3000, () => {
  console.log('Backend running on http://127.0.0.1:3000');
});
```

## Configuration

### Backend URL Configuration

The backend URL is configured in the constants at the top of `src/Home.tsx`:

```typescript
const BACKEND_API_URL = 'http://127.0.0.1:3000';
```

To use a different backend URL, modify this constant.

### Auto-Save Delay

The auto-save delay (debounce time) can be adjusted:

```typescript
const AUTO_SAVE_DELAY = 2000; // milliseconds
```

## Error Handling

The system gracefully handles errors:

1. **Network Errors**: If the backend is unreachable, the error is logged and the status shows "DB Save Failed"
2. **Fallback to Local**: Local storage save continues to work even if database save fails
3. **Auto-Retry**: Users can toggle the database auto-save off and on to retry
4. **Error Status**: Red error indicator appears for 3 seconds before resetting to idle

## Usage

### For End Users

1. Open the diagram editor
2. Locate the "Database Auto-save" checkbox in the left sidebar
3. Check the box to enable database auto-save
4. Make changes to your diagram
5. Watch the status indicators to confirm saves are working
6. The diagram ID will be displayed once the first save is complete

### For Developers

1. Ensure backend API is running at `http://127.0.0.1:3000`
2. Implement the `/api/diagrams/save` endpoint
3. Test by making changes to a diagram
4. Verify POST requests are being sent to your backend
5. Check database to confirm data is being stored

## Security Considerations

**Important:** This implementation does not include:
- User authentication
- Authorization checks
- Data validation
- Rate limiting
- CORS configuration

For production use, you should add:
1. User authentication (JWT, OAuth, etc.)
2. Authorization to ensure users can only save their own diagrams
3. Input validation and sanitization
4. Rate limiting to prevent abuse
5. Proper CORS configuration
6. HTTPS for secure data transmission

## Future Enhancements

Potential improvements for future versions:

1. **Load from Database**: Add ability to load diagrams from database
2. **Diagram List**: Show list of saved diagrams
3. **Version History**: Track changes and allow rollback
4. **Sharing**: Share diagrams with other users
5. **Collaboration**: Real-time collaborative editing
6. **Conflict Resolution**: Handle conflicts when same diagram is edited simultaneously
7. **Offline Support**: Queue saves when offline and sync when online
8. **Export/Import**: Backup and restore diagrams

## Troubleshooting

### Database save not working

1. Check browser console for errors
2. Verify backend is running and accessible
3. Check network tab to see if requests are being sent
4. Verify backend endpoint URL is correct
5. Check backend logs for errors

### Diagram ID not persisting

1. Clear browser's localStorage
2. Refresh the page
3. Make a new change to trigger auto-save
4. Check that new ID is generated and stored

### Status always shows "DB Save Failed"

1. Verify backend API is running
2. Check CORS configuration on backend
3. Verify request format matches backend expectations
4. Check backend error logs

## Conclusion

The database auto-save feature provides a robust, dual-layer saving mechanism that ensures diagram data is preserved both locally and remotely. The implementation is designed to be resilient, user-friendly, and easily extensible for future enhancements.
