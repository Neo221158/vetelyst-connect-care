import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportEmailRequest {
  reportNumber: string;
  recipientEmail: string;
  recipientName: string;
  caseId: string;
  patientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      reportNumber, 
      recipientEmail, 
      recipientName, 
      caseId, 
      patientName 
    }: ReportEmailRequest = await req.json();

    console.log("Sending report email:", { reportNumber, recipientEmail });

    const emailResponse = await resend.emails.send({
      from: "Vetelyst Reports <reports@vetelyst.com>",
      to: [recipientEmail],
      subject: `Consultation Report ${reportNumber} - ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Vetelyst</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Veterinary Consultation Platform</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e40af; margin-top: 0;">Consultation Report Available</h2>
            
            <p>Dear ${recipientName},</p>
            
            <p>The consultation report for <strong>${patientName}</strong> is now available for review.</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Report Details</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Report Number:</strong> ${reportNumber}</li>
                <li><strong>Patient:</strong> ${patientName}</li>
                <li><strong>Case ID:</strong> ${caseId.slice(-8).toUpperCase()}</li>
                <li><strong>Generated:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://vetelyst.lovable.app/dashboard" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Report in Dashboard
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Security Notice:</strong> This report contains confidential medical information. 
                Please ensure secure handling and storage according to your practice's privacy policies.
              </p>
            </div>
            
            <p>If you have any questions about this consultation, please don't hesitate to contact our specialists through the Vetelyst platform.</p>
            
            <p>Best regards,<br>
            <strong>The Vetelyst Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <div style="text-align: center; color: #64748b; font-size: 12px;">
              <p>Vetelyst Veterinary Consultation Platform</p>
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Vetelyst. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-report-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);