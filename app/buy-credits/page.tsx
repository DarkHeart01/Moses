"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

// Mock payment processor - in a real app, you'd use Stripe, PayPal, etc.
const processMockPayment = async (amount: number): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Simulate successful payment 90% of the time
    return Math.random() < 0.9;
  };
  
  const creditPackages = [
    { id: 'basic', credits: 5, price: 4.99 },
    { id: 'standard', credits: 20, price: 14.99 },
    { id: 'premium', credits: 50, price: 29.99 },
  ];
  
  export default function BuyCreditsPage() {
    const router = useRouter();
    const { toast } = require("@/components/ui/use-toast");
    const [selectedPackage, setSelectedPackage] = useState(creditPackages[1].id);
    const [customCredits, setCustomCredits] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
  
    const handlePurchase = async () => {
      setIsProcessing(true);
      const packageToBuy = creditPackages.find(pkg => pkg.id === selectedPackage) || 
                           { credits: parseInt(customCredits), price: parseInt(customCredits) * 0.75 };
  
      try {
        const success = await processMockPayment(packageToBuy.price);
        
        if (success) {
          // In a real app, you'd call your backend API to add credits to the user's account
          toast({
            title: "Purchase Successful",
            description: `${packageToBuy.credits} credits have been added to your account.`,
            duration: 5000,
          });
          router.push("/profile");
        } else {
          throw new Error("Payment failed");
        }
      } catch (error) {
        toast({
          title: "Purchase Failed",
          description: "There was an error processing your payment. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    };
  
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Purchase Credits</CardTitle>
            <CardDescription>
              Choose a credit package or enter a custom amount to get started with lab sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPackage}
              onValueChange={setSelectedPackage}
              className="space-y-4"
            >
              {creditPackages.map((pkg) => (
                <div key={pkg.id} className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value={pkg.id} id={pkg.id} />
                  <Label htmlFor={pkg.id} className="flex flex-1 justify-between cursor-pointer">
                    <span>{pkg.credits} Credits</span>
                    <span>${pkg.price.toFixed(2)}</span>
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex flex-1 items-center justify-between cursor-pointer">
                  <span>Custom Amount</span>
                  <Input
                    type="number"
                    placeholder="Enter credits"
                    value={customCredits}
                    onChange={(e) => {
                      setCustomCredits(e.target.value);
                      setSelectedPackage('custom');
                    }}
                    className="w-24 text-right"
                    min="1"
                  />
                </Label>
              </div>
            </RadioGroup>
  
            <Separator className="my-6" />
  
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price per credit:</span>
                <span>$0.75</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total Price:</span>
                <span>
                  $
                  {selectedPackage === 'custom'
                    ? (parseInt(customCredits || '0') * 0.75).toFixed(2)
                    : creditPackages.find(pkg => pkg.id === selectedPackage)?.price.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handlePurchase}
              disabled={isProcessing || (selectedPackage === 'custom' && !customCredits)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase Credits
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  