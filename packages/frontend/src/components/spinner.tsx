export const SimpleLoadingSpinner: React.FC = () => (
  <>
    <style jsx>{`
      .spinner-container {
        background: radial-gradient(circle at center, #FFFFFF, #F8F9FF);
      }
      
      .spinner {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          #7B42FF 80%,
          transparent 100%
        );
        animation: spin 1s linear infinite;
        filter: drop-shadow(0 0 8px rgba(123, 66, 255, 0.3));
      }

      .spinner::after {
        content: '';
        position: absolute;
        inset: 5px;
        border-radius: 50%;
        background: white;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>

    <div className="spinner-container flex justify-center items-center min-h-screen">
      <div className="relative spinner" />
    </div>
  </>
);