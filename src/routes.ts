import { Request, Response, Router, request } from "express";
import { Readable } from "stream";
import { client } from "./database/client";
import readLine from "readline";
import multer from "multer";
import { hash } from "bcrypt";
import { v4 as uuidV4 } from "uuid";

const multerConfig = multer();
const router = Router();

interface Product {
  code_bar: string;
  description: string;
  price: number;
  quantity: number;
}

interface User {
  email: string;
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  institutionId: string | null;
  id: string;
  password: string;
  isActive: boolean;
  isBlocked: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface License {
  userId: string | null;
  userRole: string | null;
  assignedAt: Date | null;
  isUsed: boolean;
  isActive: boolean;
  updatedAt: Date;
}

interface UserLicense {
  user: User;
  license: License;
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

      const exist = products.findIndex(
        (prod) => prod.code_bar === productsLineSplit[0]
      );

      if (exist === -1) {
        products.push({
          code_bar: productsLineSplit[0],
          description: productsLineSplit[1],
          price: Number(productsLineSplit[2]),
          quantity: Number(productsLineSplit[3]),
        });
      }
    }

    await client.products
      .createMany({
        data: products,
        skipDuplicates: true,
      })
      .then((resp) => {
        console.log(resp);
        if (resp.count === 0) {
          return response.status(200).json({
            message: "Os dados enviados já encontram-se registrados no banco.",
          });
        }
        return response.status(200).json({
          message: `${resp.count} cadastros realizados com sucesso!`,
        });
      })
      .catch((error) => {
        console.log("Message", error.message);
        return response.status(500).json({
          message: "Não foi possivel realizar os cadastros!",
        });
      });
  }
);

router.post(
  "/user",
  multerConfig.single("file"),
  async (request: Request, response: Response) => {
    const { file } = request;
    const bufferFile = file?.buffer;

    const readableFile = new Readable();
    readableFile.push(bufferFile);
    readableFile.push(null);

    const usersLine = readLine.createInterface({
      input: readableFile,
    });

    const registers: UserLicense[] = [];

    for await (let line of usersLine) {
      const usersLineSplit = line.split(",");

      const id = uuidV4();
      const password = await hash("12345678", 15);
      const birthDay = new Date(
        `${usersLineSplit[3]
          .trim()
          .split("/")
          .reverse()
          .join("-")}T${new Date().toLocaleTimeString()}.000Z`
      );

      const user: User = {
        id: id,
        email: usersLineSplit[0],
        name: usersLineSplit[1],
        cpf: usersLineSplit[2],
        birthDate: birthDay,
        phone: usersLineSplit[4],
        institutionId: usersLineSplit[5],
        password: password,
        isActive: true,
        isBlocked: false,
        role: "student",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const license: License = {
        userId: id,
        userRole: "student",
        isUsed: true,
        isActive: true,
        assignedAt: new Date(),
        updatedAt: new Date(),
      };

      const userData = await client.user.create({
        data: { ...user },
      });

      const licenseData = await client.license.update({
        where: { contractId: usersLineSplit[6], code: usersLineSplit[7] },
        data: { ...license },
      });

      registers.push({ user: userData, license: licenseData });
    }
    response.json(registers);
  }
);

export { router };
