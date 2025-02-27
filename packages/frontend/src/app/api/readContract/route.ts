import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { sepolia } from 'viem/chains'; // Use the appropriate chain for your project

// Create a public client
const publicClient = createPublicClient({
  chain: sepolia, // Change to your specific blockchain
  transport: http(`https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`)
});

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { 
      contract: { address, abi }, 
      functionName, 
      args = [] 
    } = body;

    // Validate required fields
    if (!address || !functionName || !abi) {
      return NextResponse.json(
        { error: 'Missing required fields: address, abi, and functionName' },
        { status: 400 }
      );
    }

    // Perform the contract read operation
    const result = await publicClient.readContract({
      address: address as Address,
      abi,
      functionName,
      args,
    });

    // Serialize BigInt values to strings to avoid JSON serialization issues
    const serializedResult = JSON.parse(
      JSON.stringify(
        result,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value)
      )
    );

    // Return the result
    return NextResponse.json(serializedResult);
  } catch (error) {
    console.error('Contract read error:', error);
    
    // Detailed error logging
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
}

// Add GET handler to prevent CORS issues
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}