import express from "express"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDB from "./src/db/connectDb.js"
import cors from "cors"



const app = express()
dotenv.config({
  path: "./.env"
})


var corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())


connectDB()



// Routes imports
import userRouter from "./src/routes/user.route.js"
import medicineRouter from "./src/routes/medicine.routes.js"
import shipmentRouter from "./src/routes/shipment.routes.js"

// Route registration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/medicine", medicineRouter)
app.use("/api/v1/shipment", shipmentRouter)






const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is listening to the port ${API_BASE_URL}`)
})

app.get("/", (req, res) => {
  res.send("Server is ready");
});
