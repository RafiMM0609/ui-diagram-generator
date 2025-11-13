interface PromptBubbleProps {
  showBubble: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  promptHistory: string[];
  isLoading: boolean;
  handleGenerateFlow: () => void;
}

export function PromptBubble({
  showBubble,
  prompt,
  setPrompt,
  promptHistory,
  isLoading,
  handleGenerateFlow,
}: PromptBubbleProps) {
  if (!showBubble) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '80px',
      right: '20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
      maxWidth: '420px',
      width: '420px',
      zIndex: 1000,
      animation: 'slideUp 0.3s ease-out',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '500px',
    }}>
      {/* Prompt History Section */}
      {promptHistory.length > 0 && (
        <div style={{
          padding: '16px 20px 12px 20px',
          borderBottom: '1px solid #f0f0f0',
          maxHeight: '200px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📜 Prompt History
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {promptHistory.map((historyPrompt, index) => (
              <div
                key={index}
                style={{
                  fontSize: '13px',
                  color: '#444',
                  backgroundColor: '#f8f9fa',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setPrompt(historyPrompt)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e9ecef';
                }}
              >
                <span style={{ color: '#999', fontSize: '11px', marginRight: '6px' }}>
                  #{index + 1}
                </span>
                {historyPrompt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Section */}
      <div style={{ padding: '16px 20px' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your diagram in detail..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerateFlow();
            }
          }}
          style={{
            border: '2px solid #e0e0e0',
            outline: 'none',
            width: '100%',
            fontSize: '14px',
            padding: '12px',
            backgroundColor: '#fafafa',
            resize: 'vertical',
            minHeight: '80px',
            maxHeight: '150px',
            borderRadius: '10px',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#007bff';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.backgroundColor = '#fafafa';
          }}
        />
        <div style={{ fontSize: '11px', color: '#999', marginTop: '6px', marginBottom: '10px' }}>
          💡 Press Enter to generate • Shift+Enter for new line
        </div>
        {(() => {
          const isPromptEmpty = !prompt.trim();
          const isDisabled = isLoading || isPromptEmpty;
          return (
            <button
              onClick={handleGenerateFlow}
              disabled={isDisabled}
              style={{
                backgroundColor: isDisabled ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 20px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                width: '100%',
                transition: 'all 0.3s ease',
                boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(0,123,255,0.3)',
                opacity: isDisabled ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,123,255,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                }
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}>
                  </span>
                  Generating...
                </span>
              ) : "✨ Generate Diagram"}
            </button>
          );
        })()}
      </div>
    </div>
  );
}
