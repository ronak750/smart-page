import { NextResponse } from 'next/server';
import { stitch } from '@google/stitch-sdk';

export async function POST(req: Request) {
  try {
    const { prompt, amount } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    if (!process.env.STITCH_API_KEY) {
      return NextResponse.json({ error: 'STITCH_API_KEY is not configured in .env' }, { status: 500 });
    }

    // Enhance the prompt to require a payment section
    let finalPrompt = prompt;
    if (amount) {
      finalPrompt += `\n\nCRITICAL REQUIREMENT: You MUST include a mandatory prominent "Pay Now" or "Reserve Now" section. The section MUST explicitly display the amount of $${amount}. The section MUST include a highly visible Call-To-Action (CTA) button for the payment, and this button MUST link to an appropriate checkout page (for example, link it to a placeholder checkout page like '/checkout' or '#'). Ensure the payment section looks professional and trustworthy.`;
    }

    const projects = await stitch.projects();
    let project = projects[0];
    
    // Create a new project if none exists for this API key
    if (!project) {
      await stitch.callTool("create_project", { title: "AI Page Builder" });
      const updatedProjects = await stitch.projects();
      project = updatedProjects[0];
    }

    const screen = await project.generate(finalPrompt);
    let html = await screen.getHtml();
    
    // If the API returns a download URL instead of raw HTML, fetch the actual content
    if (typeof html === 'string' && (html.startsWith('//') || html.startsWith('http://') || html.startsWith('https://'))) {
      const fetchUrl = html.startsWith('//') ? `https:${html}` : html;
      try {
        const res = await fetch(fetchUrl);
        if (res.ok) {
          html = await res.text();
        }
      } catch (e) {
        console.error('Failed to fetch HTML from URL:', e);
      }
    }
    
    return NextResponse.json({ html });
  } catch (error: any) {
    console.error('Stitch generation error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
