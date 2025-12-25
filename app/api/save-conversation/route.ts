// app/api/save-conversation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { conversationData, filename } = data;
    
    // Define the save path
    const savePath = path.join(
      process.cwd(),
      'app',
      '(dashboard)',
      'stage3',
      'summary',
      filename
    );
    
    // Create directory if it doesn't exist
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save the file
    fs.writeFileSync(savePath, JSON.stringify(conversationData, null, 2));
    
    // Log for debugging
    console.log(`✅ File saved to: ${savePath}`);
    
    return NextResponse.json({
      success: true,
      message: 'Conversation saved successfully',
      path: savePath,
      filename: filename
    });
    
  } catch (error: any) {
    console.error('Error saving conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Failed to save conversation'
      },
      { status: 500 }
    );
  }
}