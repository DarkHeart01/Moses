// app/api/setup-guacamole/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    
    // Here you would make a call to your GCP VM to set up Guacamole
    // This is a placeholder for the actual GCP API call
    const response = await fetch('https://your-gcp-function-url.cloudfunctions.net/setup-guacamole', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GCP_API_KEY}`
      },
      body: JSON.stringify({
        transcript,
        vmId: 'vm-id-from-session' // You would get this from session or previous request
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to set up Guacamole');
    }
    
    const data = await response.json();
    
    // Extract the Guacamole URL from the response
    // This assumes your GCP function returns the URL in a specific format
    const guacamoleUrl = `http://${data.externalIp}:8080/guacamole`;
    
    return NextResponse.json({
      success: true,
      guacamoleUrl,
      credentials: {
        username: 'guacadmin',
        password: 'guacadmin'
      }
    });
  } catch (error) {
    console.error('Error setting up Guacamole:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set up Guacamole' },
      { status: 500 }
    );
  }
}
