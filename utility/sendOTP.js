const speakeasy = require('speakeasy');
const bcrypt = require('bcrypt');

const {sendMail} = require('./sendEmail');
const hash = require('./hashFunction');
require("dotenv").config()


const otpGenerate = async ()=>{

    try {

        const digits = "0123456789";
        let OTP =  '';

        for(let i=0;i<4;i++){
            OTP += digits[Math.floor(Math.random() * 10)];
        }

        const secret = await hash(OTP);

        return {secret, OTP}
        
    } catch (error) {
        console.log();
    }
    
    
}

const sendOtp = async (user)=>{

    const result = await otpGenerate();

    const option = {
        from: process.env.AU_EMAIL, // sender address
        to: user.email, // list of receivers
        subject: "OTP verification", // Subject line
        text: "Don't share the code", // plain text body
        html: `<p>Your OTP is <b>${result.OTP}</b></p>`, // html body
    }

    console.log("before",result.OTP);

    await sendMail(option);
    return result.secret;
}



module.exports = {
    sendOtp,
}