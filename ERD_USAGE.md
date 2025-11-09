# ERD (Entity Relationship Diagram) Features

This document describes how to use the ERD features in the UI Diagram Generator.

## Overview

The application now supports creating Entity Relationship Diagrams (ERD) alongside traditional flowcharts. You can create database table nodes with column-level connections and relationship edges showing cardinality.

## Features

### 1. TableNode Component

The TableNode represents a database table with the following features:

- **Table Header**: Displays the table name with a purple gradient background
- **Column Rows**: Each row shows:
  - Column name
  - Data type (e.g., INT, VARCHAR, TEXT)
  - Primary Key indicator (🔑) for `isPK: true`
  - Foreign Key indicator (🔗) for `isFK: true`
- **Connection Handles**: Each column has:
  - Left handle (target) for incoming connections
  - Right handle (source) for outgoing connections

### 2. RelationshipEdge Component

The RelationshipEdge represents relationships between table columns with:

- Custom purple edge styling
- Cardinality label (e.g., "1:1", "1:N", "N:N") displayed at the center
- White background with purple border for visibility

## Usage

### Creating a TableNode

1. In the sidebar, click on "📊 Database Table"
2. Click "➕ Add to Canvas"
3. A new table node will be created with sample columns

The default structure when adding a table node:
```javascript
{
  tableName: 'table_X',
  columns: [
    { id: 'col-X-1', name: 'id', type: 'INT', isPK: true, isFK: false },
    { id: 'col-X-2', name: 'name', type: 'VARCHAR', isPK: false, isFK: false },
    { id: 'col-X-3', name: 'created_at', type: 'TIMESTAMP', isPK: false, isFK: false },
  ]
}
```

### Creating Column-Level Connections

To create a relationship between two table columns:

1. Hover over the right handle (source) of a column in one table
2. Click and drag to the left handle (target) of a column in another table
3. Release to create the connection

### Using RelationshipEdge

When programmatically creating edges, use the following structure:

```javascript
{
  id: 'edge-id',
  source: 'source-table-id',
  sourceHandle: 'col-id-src',  // e.g., 'col-u1-src'
  target: 'target-table-id',
  targetHandle: 'col-id-tgt',   // e.g., 'col-p2-tgt'
  type: 'relationship',
  data: { relationship: '1:N' }  // Can be '1:1', '1:N', or 'N:N'
}
```

### Example: Users and Profiles Tables

The application includes a sample ERD showing the relationship between `users` and `profiles` tables:

**Users Table:**
- id (INT, Primary Key)
- username (VARCHAR)
- email (VARCHAR)

**Profiles Table:**
- id (INT, Primary Key)
- user_id (INT, Foreign Key)
- bio (TEXT)

**Relationship:**
- users.id → profiles.user_id (1:N relationship)

## Programmatic Usage

### Adding TableNode Programmatically

```javascript
const tableNode = {
  id: 'table-1',
  type: 'tableNode',
  position: { x: 100, y: 100 },
  data: {
    tableName: 'users',
    columns: [
      { id: 'col-u1', name: 'id', type: 'INT', isPK: true, isFK: false },
      { id: 'col-u2', name: 'username', type: 'VARCHAR', isPK: false, isFK: false },
      { id: 'col-u3', name: 'email', type: 'VARCHAR', isPK: false, isFK: false },
    ]
  }
};
```

### Adding RelationshipEdge Programmatically

```javascript
const relationshipEdge = {
  id: 'rel-1',
  source: 'table-1',
  sourceHandle: 'col-u1-src',
  target: 'table-2',
  targetHandle: 'col-p2-tgt',
  type: 'relationship',
  data: { relationship: '1:N' }
};
```

## Coexistence with Flowchart Features

The ERD features work seamlessly alongside traditional flowchart nodes:
- Rectangle nodes
- Diamond nodes (for decisions)
- Oval nodes (for start/end)
- Circle nodes (for connectors)

You can mix both ERD and flowchart elements on the same canvas.

## Tips

1. **Unique Column IDs**: Each column must have a unique ID for handles to work properly
2. **Handle Naming**: Handles follow the pattern `{columnId}-src` for source and `{columnId}-tgt` for target
3. **Visual Indicators**: Use the 🔑 and 🔗 icons to quickly identify primary and foreign keys
4. **Relationship Labels**: Choose appropriate cardinality labels (1:1, 1:N, N:N) to accurately represent relationships
