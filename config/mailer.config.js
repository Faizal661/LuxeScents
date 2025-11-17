import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: "mohammedfaizal.t.bca.2@gmail.com",
        pass: "uzsd xbey dlox ehbx"
    }
})