import { useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import { getNodesBounds, useReactFlow } from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// PDF Export constants
const PDF_EXPORT_PADDING = 150;
const PDF_FIT_VIEW_DURATION = 200;
const PDF_FIT_VIEW_WAIT_TIME = 300;

export function useFlowExport(nodes: Node[], edges: Edge[]) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNodes, fitView } = useReactFlow();

  // Export canvas to PDF
  const exportToPDF = useCallback(async () => {
    try {
      await fitView({ padding: 0.2, duration: PDF_FIT_VIEW_DURATION });
      await new Promise(resolve => setTimeout(resolve, PDF_FIT_VIEW_WAIT_TIME + 200));

      const nodesBounds = getNodesBounds(getNodes());
      const width = nodesBounds.width + PDF_EXPORT_PADDING * 2;
      const height = nodesBounds.height + PDF_EXPORT_PADDING * 2;

      const flowElement = reactFlowWrapper.current?.querySelector('.react-flow__viewport');
      
      if (!flowElement || !(flowElement instanceof HTMLElement)) {
        console.error('React Flow viewport not found, trying main container');
        const mainFlowElement = reactFlowWrapper.current?.querySelector('.react-flow');
        if (!mainFlowElement || !(mainFlowElement instanceof HTMLElement)) {
          console.error('React Flow element not found');
          alert('Failed to find diagram element. Please try again.');
          return;
        }
      }

      const targetElement = reactFlowWrapper.current?.querySelector('.react-flow__viewport') || 
                           reactFlowWrapper.current?.querySelector('.react-flow');
      
      if (!targetElement || !(targetElement instanceof HTMLElement)) {
        console.error('No suitable React Flow element found');
        alert('Failed to find diagram element. Please try again.');
        return;
      }
      
      const dataUrl = await toPng(targetElement, {
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        filter: (node) => {
          if (!node.classList) return true;
          
          const exclusionClasses = [
            'react-flow__controls', 
            'react-flow__minimap',
            'react-flow__panel',
            'react-flow__attribution'
          ];
          
          if (node.classList.contains('react-flow__background')) {
            return true;
          }
          
          if (node.classList.contains('react-flow__edge') || 
              node.classList.contains('react-flow__edge-path') ||
              node.classList.contains('react-flow__edge-text') ||
              node.classList.contains('react-flow__edge-textbg')) {
            return true;
          }
          
          if (node.classList.contains('react-flow__node') ||
              node.classList.contains('react-flow__handle')) {
            return true;
          }
          
          return !exclusionClasses.some(classname => node.classList.contains(classname));
        },
      });

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
        pdf.save('diagram.pdf');
      };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export diagram to PDF. Please try again.');
    }
  }, [getNodes, fitView]);

  // Alternative export function as backup
  const exportToPDFAlternative = useCallback(async () => {
    try {
      await fitView({ padding: 0.1, duration: 500 });
      await new Promise(resolve => setTimeout(resolve, 800));

      const reactFlowContainer = reactFlowWrapper.current;
      
      if (!reactFlowContainer) {
        alert('Failed to find diagram container. Please try again.');
        return;
      }

      const dataUrl = await toPng(reactFlowContainer, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        style: {
          width: reactFlowContainer.offsetWidth + 'px',
          height: reactFlowContainer.offsetHeight + 'px',
        }
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [reactFlowContainer.offsetWidth, reactFlowContainer.offsetHeight],
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        pdf.addImage(dataUrl, 'PNG', 0, 0, reactFlowContainer.offsetWidth, reactFlowContainer.offsetHeight);
        pdf.save('diagram-full.pdf');
      };
    } catch (error) {
      console.error('Error in alternative export:', error);
      alert('Failed to export diagram. Please try again.');
    }
  }, [fitView]);

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
