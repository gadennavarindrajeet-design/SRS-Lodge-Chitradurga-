import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        scannerRef.current?.clear();
        onClose();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-black mb-6">Scan Aadhaar QR</h3>
        <div id="qr-reader" className="overflow-hidden rounded-2xl border-none" />
      </div>
    </div>
  );
};
