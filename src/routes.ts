import { Request, Response, Router, request, response } from "express";
import multer from "multer";

const multerConfig = multer();
const router = Router();

router.get("/", (request: Request, response: Response) => {
  return response.send("Aplicação ok!");
});

export { router };
