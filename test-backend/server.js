// Simple Express backend server for testing database auto-save functionality
// This is a mock server for development/testing purposes only

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory storage (replace with actual database in production)
const diagrams = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Save diagram endpoint
app.post('/api/diagrams/save', (req, res) => {
  try {
    const { id, nodes, edges, savedAt } = req.body;
    
    // Validate request
    if (!nodes || !edges || !Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ 
        error: 'Invalid request: nodes and edges are required and must be arrays' 
      });
    }
    
    let diagramId = id;
    
    // Generate new ID if not provided
    if (!diagramId) {
      diagramId = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`Creating new diagram with ID: ${diagramId}`);
    } else {
      console.log(`Updating diagram with ID: ${diagramId}`);
    }
    
    // Save to in-memory storage
    const diagramData = {
      id: diagramId,
      nodes,
      edges,
      savedAt: savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodeCount: nodes.length,
      edgeCount: edges.length
    };
    
    diagrams.set(diagramId, diagramData);
    
    console.log(`Diagram saved: ${nodes.length} nodes, ${edges.length} edges`);
    
    res.json({
      id: diagramId,
      message: 'Diagram saved successfully',
      savedAt: diagramData.updatedAt
    });
    
  } catch (error) {
    console.error('Error saving diagram:', error);
    res.status(500).json({ 
      error: 'Failed to save diagram',
      details: error.message 
    });
  }
});

// Get diagram by ID
app.get('/api/diagrams/:id', (req, res) => {
  try {
    const { id } = req.params;
    const diagram = diagrams.get(id);
    
    if (!diagram) {
      return res.status(404).json({ 
        error: 'Diagram not found' 
      });
    }
    
    console.log(`Retrieved diagram: ${id}`);
    res.json(diagram);
    
  } catch (error) {
    console.error('Error retrieving diagram:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve diagram',
      details: error.message 
    });
  }
});

// List all diagrams
app.get('/api/diagrams', (req, res) => {
  try {
    const allDiagrams = Array.from(diagrams.values()).map(d => ({
      id: d.id,
      savedAt: d.savedAt,
      updatedAt: d.updatedAt,
      nodeCount: d.nodeCount,
      edgeCount: d.edgeCount
    }));
    
    console.log(`Listed ${allDiagrams.length} diagrams`);
    
    res.json({
      diagrams: allDiagrams,
      count: allDiagrams.length
    });
    
  } catch (error) {
    console.error('Error listing diagrams:', error);
    res.status(500).json({ 
      error: 'Failed to list diagrams',
      details: error.message 
    });
  }
});

// Delete diagram by ID
app.delete('/api/diagrams/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!diagrams.has(id)) {
      return res.status(404).json({ 
        error: 'Diagram not found' 
      });
    }
    
    diagrams.delete(id);
    console.log(`Deleted diagram: ${id}`);
    
    res.json({ 
      message: 'Diagram deleted successfully',
      id 
    });
    
  } catch (error) {
    console.error('Error deleting diagram:', error);
    res.status(500).json({ 
      error: 'Failed to delete diagram',
      details: error.message 
    });
  }
});

// AI flow generation endpoint (existing from the codebase)
app.post('/api/generate/flow', (req, res) => {
  try {
    const { promp } = req.body;
    
    // Mock response - in production this would call an AI service
    console.log('AI Generation request received:', promp);
    
    // Return a simple mock diagram
    const mockDiagram = {
      response: JSON.stringify({
        nodes: [
          { id: '1', type: 'oval', position: { x: 250, y: 50 }, data: { label: 'Start' } },
          { id: '2', type: 'default', position: { x: 250, y: 150 }, data: { label: 'Process' } },
          { id: '3', type: 'oval', position: { x: 250, y: 250 }, data: { label: 'End' } }
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true },
          { id: 'e2-3', source: '2', target: '3', type: 'custom', animated: true }
        ]
      })
    };
    
    res.json(mockDiagram);
    
  } catch (error) {
    console.error('Error generating flow:', error);
    res.status(500).json({ 
      error: 'Failed to generate flow',
      details: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log('='.repeat(60));
  console.log(`Mock Backend Server for UI Diagram Generator`);
  console.log('='.repeat(60));
  console.log(`Server running on: http://127.0.0.1:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /api/health              - Health check`);
  console.log(`  POST /api/diagrams/save       - Save diagram`);
  console.log(`  GET  /api/diagrams/:id        - Get diagram by ID`);
  console.log(`  GET  /api/diagrams            - List all diagrams`);
  console.log(`  DELETE /api/diagrams/:id      - Delete diagram`);
  console.log(`  POST /api/generate/flow       - Generate flow (mock)`);
  console.log('='.repeat(60));
  console.log(`\nPress Ctrl+C to stop the server\n`);
});

module.exports = app;
