const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(async()=>{

    const user = await User.create({

        name:"Hasika",
        email:"hasika@gmail.com",
        password:"123456"

    });

    console.log(user);

    process.exit();

})
.catch(err=>console.log(err));