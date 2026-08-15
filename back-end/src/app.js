import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'


// import configs
import { connectDB } from './config/mongooDB.js'


// import routes
import authRouter from "./routes/auth.routes.js"
import decisionRouter from "./routes/decision.routes.js"

const app = express() 
dotenv.config()
app.set('trust proxy', true); // for get real ip


////////////////////////////////////////////////////  cors
const allowedOrigins = (process.env.ORIGINS || "").split(',').filter(Boolean);
app.use(cors({
    origin: (origin, callBack) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) 
            return callBack(null, true)
        
        else return callBack(new Error("NOT allowed by CORS"))
    },
    methods:["POST", "GET", "PUT", "PATCH","DELETE"],
    credentials:true
}))

/////// middlewares
app.use(express.json())
app.use(cookieParser())


////////// connect with DB
connectDB()


////////////////////////////////////////////////////  test route
app.get('/', (req, res) => {
    return res.status(200).json({status:'success', message:"ThetaHack server is running", data: null})
})


/////////////////////// use routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/decide', decisionRouter)


// not found routes
app.use((req, res) => {
    return res.status(404).json({status:'fail', data:null, message:`Route ${req.originalUrl} not found.`})
})

// error middleWare
app.use((err, req, res, next) => {
    console.log(err)
    return res.status(500).send({status:'fail', message:err.message, data: null})
})


if (process.env.NODE_ENV !== 'production') { 
  const Port = process.env.PORT || 5000
  app.listen(Port, () => console.log(`Server running on port ${Port}...`))
}

// when deploy on vercel 
export default app   