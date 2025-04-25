const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!options || !options.email || !options.subject || !options.message) {
        throw new Error('Missing required email options');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // Message object
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        // Verify connection
        await transporter.verify();
        
        // Send email
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Email error:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;



