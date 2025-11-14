import { useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import { getNodesBounds, getViewportForBounds, useReactFlow } from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// PDF Export constants
const PDF_EXPORT_PADDING = 20;
const PDF_FIT_VIEW_WAIT_TIME = 300;
const IMAGE_PIXEL_RATIO = 0.8;

export function useFlowExport(nodes: Node[], edges: Edge[]) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNodes } = useReactFlow();

  // Export canvas to PDF
  const exportToPDF = useCallback(async () => {
    try {
      const allNodes = getNodes();
      
      if (allNodes.length === 0) {
        alert('No nodes to export. Please add some nodes to the canvas first.');
        return;
      }
      
      const nodesBounds = getNodesBounds(allNodes);
      
      // Calculate dimensions with padding
      const imageWidth = nodesBounds.width + PDF_EXPORT_PADDING * 2;
      const imageHeight = nodesBounds.height + PDF_EXPORT_PADDING * 2;
      
      // Get the viewport transformation needed to fit all nodes
      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5, // min zoom
        2,   // max zoom
        0
      );
      
      const viewportElement = reactFlowWrapper.current?.querySelector('.react-flow__viewport');
      
      if (!viewportElement || !(viewportElement instanceof HTMLElement)) {
        console.error('React Flow viewport not found');
        alert('Failed to find diagram viewport. Please try again.');
        return;
      }

      // Store original transform
      const originalTransform = viewportElement.style.transform;
      
      // Apply the calculated viewport transform temporarily
      viewportElement.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
      
      // Wait for the transform to be applied
      await new Promise(resolve => setTimeout(resolve, PDF_FIT_VIEW_WAIT_TIME));

      // Capture the image with exact dimensions
      const dataUrl = await toPng(viewportElement, {
        backgroundColor: '#ffffff',
        width: imageWidth,
        height: imageHeight,
        pixelRatio: IMAGE_PIXEL_RATIO,
        cacheBust: true,
        filter: (node) => {
          if (!node.classList) return true;
          
          const exclusionClasses = [
            'react-flow__controls', 
            'react-flow__minimap',
            'react-flow__panel',
            'react-flow__attribution'
          ];
          
          return !exclusionClasses.some(classname => node.classList.contains(classname));
        },
      });
      
      // Restore original transform
      viewportElement.style.transform = originalTransform;

      const pdf = new jsPDF({
        orientation: imageWidth > imageHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imageWidth, imageHeight],
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        pdf.addImage(dataUrl, 'PNG', 0, 0, imageWidth, imageHeight);
        pdf.save('diagram.pdf');
      };
      img.onerror = () => {
        console.error('Error loading image for PDF');
        alert('Failed to create PDF image. Please try again.');
      };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export diagram to PDF. Please try again.');
    }
  }, [getNodes]);

  // Alternative export function as backup
  const exportToPDFAlternative = useCallback(async () => {
    try {
      const allNodes = getNodes();
      
      if (allNodes.length === 0) {
        alert('No nodes to export. Please add some nodes to the canvas first.');
        return;
      }
      
      const nodesBounds = getNodesBounds(allNodes);
      
      // Calculate dimensions with padding
      const imageWidth = nodesBounds.width + PDF_EXPORT_PADDING * 2;
      const imageHeight = nodesBounds.height + PDF_EXPORT_PADDING * 2;
      
      // Get the viewport transformation needed to fit all nodes
      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5,
        2,
        PDF_EXPORT_PADDING
      );

      const reactFlowContainer = reactFlowWrapper.current;
      
      if (!reactFlowContainer) {
        alert('Failed to find diagram container. Please try again.');
        return;
      }

      const viewportElement = reactFlowContainer.querySelector('.react-flow__viewport');
      
      if (!viewportElement || !(viewportElement instanceof HTMLElement)) {
        console.error('React Flow viewport not found');
        alert('Failed to find diagram viewport. Please try again.');
        return;
      }

      // Store original transform
      const originalTransform = viewportElement.style.transform;
      
      // Apply the calculated viewport transform temporarily
      viewportElement.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
      
      // Wait for the transform to be applied
      await new Promise(resolve => setTimeout(resolve, PDF_FIT_VIEW_WAIT_TIME));

      const dataUrl = await toPng(viewportElement, {
        backgroundColor: '#ffffff',
        width: imageWidth,
        height: imageHeight,
        pixelRatio: IMAGE_PIXEL_RATIO,
        cacheBust: true,
        skipFonts: false,
      });
      
      // Restore original transform
      viewportElement.style.transform = originalTransform;

      const pdf = new jsPDF({
        orientation: imageWidth > imageHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imageWidth, imageHeight],
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        pdf.addImage(dataUrl, 'PNG', 0, 0, imageWidth, imageHeight);
        pdf.save('diagram-full.pdf');
      };
      img.onerror = () => {
        console.error('Error loading image for PDF');
        alert('Failed to create PDF image. Please try again.');
      };
    } catch (error) {
      console.error('Error in alternative export:', error);
      alert('Failed to export diagram. Please try again.');
    }
  }, [getNodes]);

  // Export canvas to JSON
  const exportToJSON = useCallback(() => {
    try {
      const flowData = {
        nodes,
        edges,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      
      const dataStr = JSON.stringify(flowData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagram-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Diagram exported successfully!');
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      alert('Failed to export diagram to JSON. Please try again.');
    }
  }, [nodes, edges]);

  // Import canvas from JSON
  const importFromJSON = useCallback((
    setNodes: (nodes: Node[]) => void,
    setEdges: (edges: Edge[]) => void,
    setNodeIdCounter: (counter: number) => void
  ) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const flowData = JSON.parse(content);
            
            if (!flowData.nodes || !flowData.edges) {
              alert('Invalid JSON file format. Missing nodes or edges.');
              return;
            }
            
            setNodes(flowData.nodes);
            setEdges(flowData.edges);
            
            const maxId = flowData.nodes.reduce((max: number, node: Node) => {
              const nodeId = parseInt(node.id);
              return isNaN(nodeId) ? max : Math.max(max, nodeId);
            }, 0);
            setNodeIdCounter(maxId + 1);
            
            alert('Diagram imported successfully!');
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Failed to parse JSON file. Please check the file format.');
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      console.error('Error importing from JSON:', error);
      alert('Failed to import diagram. Please try again.');
    }
  }, []);

  return {
    reactFlowWrapper,
    exportToPDF,
    exportToPDFAlternative,
    exportToJSON,
    importFromJSON,
  };
}
