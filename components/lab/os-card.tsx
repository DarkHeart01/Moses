import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface OSCardProps {
  name: string;
  description: string;
  features: string[];
  logoSrc: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  onStart: () => void;
}

export default function OSCard({
  name,
  description,
  features,
  logoSrc,
  isLoading = false,
  isDisabled = false,
  disabledReason,
  onStart
}: OSCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="h-8 w-8 mr-2 relative">
            <Image 
              src={logoSrc} 
              alt={name} 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          {name}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={onStart}
          disabled={isLoading || isDisabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Lab
            </>
          )}
        </Button>
        {isDisabled && disabledReason && (
          <p className="text-xs text-gray-500 mt-2">{disabledReason}</p>
        )}
      </CardFooter>
    </Card>
  );
}
continue