const express= require('express');
const cors= require('cors');
const dotenv= require('dotenv');
const mongoose= require('mongoose');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')

dotenv.config();
const app = express();
app.use(cookieParser())
app.use(cors())

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

//Route


app.use("/v1/auth",authRouter)
app.use("/v1/user",userRouter)



app.listen(8000,()=>{
    console.log("Server is running");
})

//Authentication

//Authorization