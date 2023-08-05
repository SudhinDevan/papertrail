// const { Module } = require("module");
const nodemailer = require("nodemailer")
require("dotenv").config()


const verifyEmail = async (body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'papertrailsudhin@gmail.com',
                pass: 'bvpavxcaqgjlpkvd',
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        const mailOptions = {
            from: process.env.AU_EMAIL,
            to: body.email,
            subject: 'Welcome to papertrail',
            html: `<p>Hello <strong>${body.username}</strong>, Please click the link below to verify your papertrail account. If this is not done by you, you can safely ignore this email.</p><a href="http://localhost:3000/successemail/${body.username}">Verify now</a>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'error';
    }
};

// async function sendOTP(email, otp) {
//     try {
//         // Configure the email transport settings
//         const transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 465,
//             secure: true,
//             auth: {
//                 user: 'papertrailsudhin@gmail.com',
//                 pass: 'bvpavxcaqgjlpkvd',
//             },
//             tls: {
//                 rejectUnauthorized: false
//             }
//         });

//         // Compose the email message
//         const mailOptions = {
//             from: process.env.AU_EMAIL,
//             to: email,
//             subject: 'OTP Verification',
//             text: `Your OTP: ${otp}`
//         };

//         // Send the email
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.response);
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// }

// // Generate a random 4-digit OTP
// function generateOTP() {
//     return Math.floor(1000 + Math.random() * 9000).toString();
// }


module.exports = {
    verifyEmail,
    // sendOTP,
    // generateOTP,
}


// bvpavxcaqgjlpkvd