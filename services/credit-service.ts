import fetchApi from '@/lib/api';

interface CreditTransaction {
  id: string;
  amount: number;
  description: string;
  timestamp: string;
}

export const creditService = {
  async getCredits(): Promise<{ credits: number }> {
    return fetchApi('/user/credits');
  },
  
  async getCreditHistory(): Promise<CreditTransaction[]> {
    return fetchApi('/user/credits/history');
  },
  
  async purchaseCredits(amount: number, paymentDetails: any): Promise<{ message: string; credits: number }> {
    return fetchApi('/credits/purchase', {
      method: 'POST',
      body: {
        amount,
        paymentDetails,
      },
    });
  }
};
