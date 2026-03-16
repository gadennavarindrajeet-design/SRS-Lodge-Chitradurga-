import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Common';

export const Camera = ({ onCapture, onClose }: { onCapture: (img: string) => void, onClose: () => void }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => alert("Camera access denied: " + err.message));
    
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        onCapture(data);
        stream?.getTracks().forEach(t => t.stop());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-3xl bg-zinc-800" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-4 mt-8">
        <Button variant="secondary" onClick={onClose} className="rounded-full w-16 h-16 p-0"><X size={24} /></Button>
        <button onClick={capture} className="w-20 h-20 bg-white rounded-full border-8 border-zinc-200 active:scale-90 transition-transform" />
      </div>
    </div>
  );
};
