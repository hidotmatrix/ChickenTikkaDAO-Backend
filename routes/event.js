import express from "express";
import { eventHandler } from "../controller/event.js";

export const eventRoute = express.Router();

eventRoute.post('/',eventHandler);