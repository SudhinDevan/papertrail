const bcrypt = require('bcrypt');


const hash = async (password) => {
    try {
        const hashed = await bcrypt.hash(password, 10);
        return hashed;
    }
    catch (err) {
        console.log(err.message);
    }
}


module.exports = hash;