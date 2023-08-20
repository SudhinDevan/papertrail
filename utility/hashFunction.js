const bcrypt = require('bcrypt');


const hash = async (password) => {
    try {
        const hashed = await bcrypt.hash(password, 10);
        return hashed;
    }
    catch (error) {
        res.render('User/404page')
    }
}


module.exports = hash;