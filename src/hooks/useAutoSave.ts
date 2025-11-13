import { useState, useEffect, useRef } from 'react';
import type { Node, Edge } from 'reactflow';

const AUTO_SAVE_KEY = 'ui-diagram-autosave';
const AUTO_SAVE_DELAY = 2000; // 2 seconds after last change

export type AutoSaveStatus = 'saved' | 'saving' | 'idle';

export function useAutoSave(nodes: Node[], edges: Edge[]) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save diagram to localStorage when nodes or edges change
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set a new timer to save after delay
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        setAutoSaveStatus('saving');
        const flowData = {
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(flowData));
        setAutoSaveStatus('saved');
        
        // Reset status to idle after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
        
        console.log('Auto-saved diagram to localStorage');
      } catch (error) {
        console.error('Error auto-saving diagram:', error);
        setAutoSaveStatus('idle');
      }
    }, AUTO_SAVE_DELAY);

    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [nodes, edges]);

  const clearAutoSave = () => {
    try {
      const confirmed = window.confirm('Are you sure you want to clear the auto-saved diagram? This action cannot be undone.');
      if (confirmed) {
        localStorage.removeItem(AUTO_SAVE_KEY);
        setAutoSaveStatus('idle');
        alert('Auto-saved data cleared successfully!');
      }
    } catch (error) {
      console.error('Error clearing auto-save:', error);
      alert('Failed to clear auto-saved data.');
    }
  };

  return { autoSaveStatus, setAutoSaveStatus, clearAutoSave, AUTO_SAVE_KEY };
}
