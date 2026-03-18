import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  size?: number;
}

const QRCodeDisplay = ({ value, title = "Medicine QR Code", size = 180 }: QRCodeDisplayProps) => (
  <Card className="w-fit">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-center">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex justify-center p-4">
      <div className="rounded-lg bg-background p-3 border">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
    </CardContent>
  </Card>
);

export default QRCodeDisplay;
