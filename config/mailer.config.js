import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email, otp) {
    try {
        const { data, error } = await resend.emails.send({
            from: "Luxe Scent <luxescent@fitandcore.shop>",
            to: email,
            subject: "Verify your account for sign up to Luxe Scent",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #333;">Luxe Scent Verification</h2>
                    <p>Thank you for signing up! Use the code below to verify your account:</p>
                    <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f4f4f4; display: inline-block;">
                        ${otp}
                    </div>
                </div>
            `
        });

        if (error) {
            console.error("Resend Error:", error);
            return false;
        }

        return true;

    } catch (error) {
        console.error("Critical error in sendVerificationEmail:", error)
        return false;
    }
}