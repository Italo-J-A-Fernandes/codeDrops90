import { Request, Response, Router, request, response } from "express";
import { Readable } from "stream";
import readLine from "readline";

import multer from "multer";
import { client } from "./database/client";

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

    // for await (let { code_bar, description, price, quantity } of products) {
    //   await client.products.create({
    //     data: {
    //       code_bar,
    //       description,
    //       price,
    //       quantity,
    //     },
    //   });
    // }

    await client.products
      .createMany({
        data: products,
      })
      .then(() => {
        return response.status(200).json({
          message: "Arquivo enviado com sucesso e os dados inseridos no banco.",
          data: products,
        });
      })
      .catch(() => {
        return response.status(500).json({
          message:
            "Ocorreu um erro ao inserir os dados no banco, revise seu arquivo.",
        });
      });
  }
);

export { router };
