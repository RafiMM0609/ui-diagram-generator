interface FloatingActionButtonProps {
  showBubble: boolean;
  setShowBubble: (show: boolean) => void;
}

export function FloatingActionButton({ showBubble, setShowBubble }: FloatingActionButtonProps) {
  return (
    <div 
      onClick={() => setShowBubble(!showBubble)}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#1E93AB',
        color: 'white',
        borderRadius: '50%',
        width: '70px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 6px 16px rgba(30,147,171,0.4)',
        zIndex: 1001,
        fontSize: '32px',
        transition: 'all 0.3s ease',
        animation: showBubble ? 'none' : 'pulseButton 2s ease-in-out infinite'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.15) rotate(15deg)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(30,147,171,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(30,147,171,0.4)';
      }}
    >
      💬
    </div>
  );
}

interface SidebarToggleButtonProps {
  isSidebarVisible: boolean;
  setIsSidebarVisible: (visible: boolean) => void;
}

export function SidebarToggleButton({ isSidebarVisible, setIsSidebarVisible }: SidebarToggleButtonProps) {
  return (
    <button
      onClick={() => setIsSidebarVisible(!isSidebarVisible)}
      style={{
        position: 'absolute',
        top: '20px',
        left: isSidebarVisible ? '270px' : '10px',
        backgroundColor: '#1E93AB',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 16px',
        cursor: 'pointer',
        fontSize: '20px',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(30,147,171,0.3)',
        transition: 'all 0.3s ease',
        zIndex: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#167589';
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,147,171,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1E93AB';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,147,171,0.3)';
      }}
      title={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
    >
      {isSidebarVisible ? '◀' : '▶'}
    </button>
  );
}
