const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Skipping email send: EMAIL_USER or EMAIL_PASS not set');
        return;
    }

    try {
        await transporter.sendMail({
            from: `"Sparkle Gift Shop" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error('Email send failed:', err);
    }
};

const sendWelcomeEmail = (user) => {
    const subject = `Welcome to Sparkle Gift Shop, ${user.name}! ✨`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #d946ef;">Welcome to Sparkle Gift Shop! 🎁</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for joining our community! We are thrilled to have you here.</p>
            <p>At Sparkle, we specialize in high-quality personalized gifts that turn moments into memories.</p>
            <div style="margin: 30px 0;">
                <a href="https://sparklegiftshop.netlify.app" style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold;">Start Shopping</a>
            </div>
            <p>If you have any questions, feel free to reply to this email or reach out to us on WhatsApp.</p>
            <p>Best regards,<br>The Sparkle Team</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};

const sendOrderConfirmation = (user, order) => {
    const subject = `Order Confirmed - ${order.invoiceId} 🧾`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #d946ef;">Order Confirmed! 🎉</h2>
            <p>Hi ${user.name},</p>
            <p>We've received your order <strong>${order.invoiceId}</strong> and are currently preparing it with care.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.total}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            </div>
            <p>You can track your order status here:</p>
            <a href="https://sparklegiftshop.netlify.app/order-details/${order.invoiceId}" style="color: #d946ef; font-weight: bold; text-decoration: underline;">View Order Details</a>
            <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Thank you for shopping with Sparkle!</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};

const sendTrackingEmail = (user, order) => {
    const subject = `Your order ${order.invoiceId} has been shipped! 🚚`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #d946ef;">Your package is on its way! 📦</h2>
            <p>Hi ${user.name},</p>
            <p>Great news! Your order <strong>${order.invoiceId}</strong> has been handed over to our courier partner.</p>
            <div style="background-color: #fdf4ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5d0fe;">
                <p style="margin: 5px 0;"><strong>Courier Partner:</strong> ${order.courierPartner}</p>
                <p style="margin: 5px 0;"><strong>Tracking ID:</strong> ${order.trackingId}</p>
            </div>
            <p>Track your package live here:</p>
            <a href="https://sparklegiftshop.netlify.app/order-details/${order.invoiceId}" style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin-top: 10px;">Live Tracking</a>
            <p style="margin-top: 30px;">Expected delivery soon!</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};

const sendDeliveryConfirmation = (user, order) => {
    const subject = `Delivered: Your order ${order.invoiceId} reached you! 🌸`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #22c55e;">Delivered! 🎁</h2>
            <p>Hi ${user.name},</p>
            <p>Your order <strong>${order.invoiceId}</strong> has been successfully delivered. We hope you love your purchase!</p>
            <p>Need help or want to share feedback? Just reply to this email or tag us on social media.</p>
            <p>Thank you for choosing Sparkle!</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};

const sendVerificationEmail = (user, token) => {
    const subject = "Verify your Sparkle account ✨";
    const verificationUrl = `https://sparklegiftshop.netlify.app/verify-email?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #d946ef;">Action Required: Verify your email 📧</h2>
            <p>Hi ${user.name},</p>
            <p>Welcome to Sparkle Gift Shop! Please verify your email address to activate your account and start shopping for magical moments.</p>
            <div style="margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, copy and paste this link: <br> ${verificationUrl}</p>
            <p>This link expires in 24 hours.</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};

const sendResetPasswordEmail = (user, token, isAdmin = false) => {
    const subject = "Reset your Sparkle account password 🔑";
    const resetUrl = `https://sparklegiftshop.netlify.app${isAdmin ? '/admin' : ''}/reset-password?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #64748b;">Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            <div style="margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset Password</a>
            </div>
            <p>This link expires in 1 hour.</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendTrackingEmail,
    sendDeliveryConfirmation,
    sendVerificationEmail,
    sendResetPasswordEmail
};
