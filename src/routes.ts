import { Request, Response, Router, request, response } from "express";
import { Readable } from "stream";

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
    const { file } = request;
    const bufferFile = file?.buffer;

    const readableFile = new Readable();
    readableFile.push(bufferFile);
    readableFile.push(null);

    return response.send("Arquivo enviado com sucesso!");
  }
);

export { router };
