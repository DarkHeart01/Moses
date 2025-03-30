import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Error({ 
  title = "Error", 
  message, 
  actionLabel, 
  onAction 
}: ErrorProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      
      {actionLabel && onAction && (
        <div className="flex justify-center">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
