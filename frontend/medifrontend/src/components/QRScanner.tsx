import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err: any) {
      setError(
        err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access."
          : "Unable to access camera. Make sure your device has a camera."
      );
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30"
        style={{ minHeight: isScanning ? 300 : 0 }}
      />

      {!isScanning && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Camera className="h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground text-center">
            Point your camera at a medicine QR code to verify authenticity
          </p>
          <Button onClick={startScanning} className="gap-2">
            <Camera className="h-4 w-4" /> Start Camera
          </Button>
        </div>
      )}

      {isScanning && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={stopScanning} className="gap-2">
            <CameraOff className="h-4 w-4" /> Stop Camera
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default QRScanner;