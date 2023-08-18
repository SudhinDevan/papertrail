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



const sendMail = async (option)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.AU_EMAIL,
            pass: process.env.AU_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    })


    const info = await transporter.sendMail(option)
}


module.exports = {
    verifyEmail,
    sendMail,
   
}