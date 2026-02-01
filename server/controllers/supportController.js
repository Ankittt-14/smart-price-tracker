const nodemailer = require('nodemailer');

// Send Feedback Email
exports.sendFeedback = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Transporter (Use explicit SMTP settings for Railway/Docker)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address (server)
            to: process.env.EMAIL_USER,   // Receiver address (Admin - You)
            replyTo: email,               // Valid reply-to address (The user)
            subject: `📢 New Feedback from ${name}`,
            html: `
                <h3>New Feedback Received</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <br/>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Feedback sent successfully!' });

    } catch (error) {
        console.error('Feedback Error:', error);
        res.status(500).json({ message: 'Failed to send feedback' });
    }
};
