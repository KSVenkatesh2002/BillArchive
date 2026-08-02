import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    // Configure the SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      console.warn('SMTP credentials missing. Cannot send email.');
      return NextResponse.json({ success: false, error: 'Server email configuration is missing.' }, { status: 500 });
    }

    // Set up email data
    const mailOptions = {
      from: `"${CONFIG.SITE_NAME} Contact Form" <${process.env.SMTP_USER}>`,
      to: 'kotavenkatesh2002@gmail.com', // Target email as requested
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #ea580c; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">New Message from ${CONFIG.SITE_NAME}</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px; white-space: pre-wrap;">
            ${message}
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
  }
}
