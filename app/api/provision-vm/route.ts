// app/api/provision-vm/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    
    // Here you would make a call to your GCP VM provisioning service
    // This is a placeholder for the actual GCP API call
    const response = await fetch('https://your-gcp-function-url.cloudfunctions.net/provision-vm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GCP_API_KEY}`
      },
      body: JSON.stringify({
        transcript,
        vmType: 'ubuntu',
        region: 'us-central1'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to provision VM');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      vmId: data.vmId,
      ipAddress: data.ipAddress
    });
  } catch (error) {
    console.error('Error provisioning VM:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to provision VM' },
      { status: 500 }
    );
  }
}
