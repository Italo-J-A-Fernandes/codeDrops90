import { Request, Response, Router, request, response } from "express";
import multer from "multer";

const multerConfig = multer();
const router = Router();

router.get("/", (request: Request, response: Response) => {
  return response.send("Aplicação ok!");
});

router.post(
  "/products",
  multerConfig.single("file"),
  (request: Request, response: Response) => {
    console.log(request.file?.buffer.toString("utf-8"));
    return response.send("Arquivo enviado com sucesso!");
  }
);

export { router };
