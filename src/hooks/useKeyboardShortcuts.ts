import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  deleteSelectedNodes: () => void;
  deleteSelectedEdges: () => void;
  editingNodeId: string | null;
  editingEdgeId: string | null;
  editingTableNodeId: string | null;
}

export function useKeyboardShortcuts({
  deleteSelectedNodes,
  deleteSelectedEdges,
  editingNodeId,
  editingEdgeId,
  editingTableNodeId,
}: UseKeyboardShortcutsProps) {
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if user is currently typing in an input field
    const activeElement = document.activeElement;
    const isTyping = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT'
    );
    
    if ((event.key === 'Delete' || event.key === 'Backspace') && !editingNodeId && !editingEdgeId && !editingTableNodeId && !isTyping) {
      deleteSelectedNodes();
      deleteSelectedEdges();
    }
  }, [deleteSelectedNodes, deleteSelectedEdges, editingNodeId, editingEdgeId, editingTableNodeId]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
}
