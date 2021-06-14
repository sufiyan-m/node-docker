const express = require("express");
const mongoose = require('mongoose');
const session = require('express-session');
const cors =  require('cors');
const redis = require('redis');
let RedisStore = require("connect-redis")(session);


const { 
    MONGO_USER, 
    MONGO_PASSWORD, 
    MONGO_IP, 
    MONGO_PORT, 
    REDIS_URL, 
    SESSION_SECRET,
    REDIS_PORT,
} = require("./config/config");

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
});

const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
.then(() => console.log("sucessfully connected to DB"))
.catch((e) => {
    
    console.log(e)
    setTimeout(connectWithRetry, 5000)

}); 
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30000,
    }
}))

app.use(express.json());

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
.then(() => console.log("sucessfully connected to DB"))
.catch((e) => console.log(e)); 

app.get("/api/v1", (req,res)=> {
    res.send("<h2>Hi There, How are ya :) !!!!!!! </h2>");
    console.log("Yes it is working")
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));