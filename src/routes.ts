import { Request, Response, Router, request, response } from "express";
import { Readable } from "stream";
import readLine from "readline";

import multer from "multer";

const multerConfig = multer();
const router = Router();

interface Product {
  code_bar: string;
  description: string;
  price: number;
  quantity: number;
}

router.get("/", (request: Request, response: Response) => {
  return response.send("Aplicação ok!");
});

router.post(
  "/products",
  multerConfig.single("file"),
  async (request: Request, response: Response) => {
    const { file } = request;
    const bufferFile = file?.buffer;

    const readableFile = new Readable();
    readableFile.push(bufferFile);
    readableFile.push(null);

    const productsLine = readLine.createInterface({
      input: readableFile,
    });

    const products: Product[] = [];

    for await (let line of productsLine) {
      const productsLineSplit = line.split(",");

      products.push({
        code_bar: productsLineSplit[0],
        description: productsLineSplit[1],
        price: Number(productsLineSplit[2]),
        quantity: Number(productsLineSplit[3]),
      });
    }

    return response.send("Arquivo enviado com sucesso!");
  }
);

export { router };
