import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { eventRoute } from "./routes/event.js";
import { nftRoutes } from "./routes/nft.js";
dotenv.config();
//import "./EventListenerService/NFTEthereumEvents";
import eventListener from "./EventListenerService/NFTEthereumEvents";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  //allow cross origin requests
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, PUT, OPTIONS, DELETE, GET"
  );
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// Routes
app.use(eventRoute);
app.use(nftRoutes);
let on = false;
app.get("/", function (req, res) {
  //when we get an http get request to the root/homepage
  if (!on) {
    // res.send("Bridge Service is up and running by True Analogy!");
    res.status(200).json({ message: "Setup the listeners" });
    try {
      on = true;
      eventListener();
    } catch (error) {
      on = false;
      console.log("Errorr", error);
    }
  } else {
    res.status(200).json({ message: "Already operating" });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port:${PORT}`))
  )
  .catch((error) => console.log(error.message));
