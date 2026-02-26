import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBoardInvitationEmail({
  to,
  inviterName,
  boardName,
  role,
  acceptUrl,
}: {
  to: string;
  inviterName: string;
  boardName: string;
  role: string;
  acceptUrl: string;
}) {
  await resend.emails.send({
    from: "Kanban <noreply@yourdomain.com>",
    to,
    subject: `${inviterName} invited you to "${boardName}"`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <div style="background:#032147;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">Board Invitation</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>${inviterName} has invited you to collaborate on <strong>${boardName}</strong> as a <strong>${role}</strong>.</p>
          <a href="${acceptUrl}" style="display:inline-block;background:#753991;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Accept Invitation</a>
          <p style="color:#888;font-size:12px">This invitation expires in 7 days.</p>
        </div>
      </div>
    `,
  });
}
