export function LoadingScreen() {
  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '5px solid #e0e0e0',
        borderTop: '5px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{
        marginTop: '20px',
        fontSize: '18px',
        color: '#007bff',
        fontWeight: '500',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        Generating your diagram...
      </p>
    </div>
  );
}
