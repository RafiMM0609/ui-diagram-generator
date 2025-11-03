import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactFlowProvider } from 'reactflow'
import './index.css'
import FlowCanvas from './Home.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  </StrictMode>,
)
