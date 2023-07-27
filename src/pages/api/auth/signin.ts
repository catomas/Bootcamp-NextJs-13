import { NextApiRequest, NextApiResponse } from "next";
import validator from "validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as jose from "jose";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const erros: string[] = [];
    const { email, password } = req.body;

    const validationSchema = [
      {
        valid: validator.isEmail(email),
        errorMessage: "Email is not valid",
      },
      {
        valid: validator.isLength(password, { min: 8 }),
        errorMessage: "Password is invalid",
      },
    ];

    validationSchema.forEach((item) => {
      if (!item.valid) {
        erros.push(item.errorMessage);
      }
    });

    if (erros.length) {
      return res.status(400).json({ errorMessages: erros });
    }
    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userWithSameEmail) {
      return res.status(400).json({ errorMessages: ["Invalid credentials"] });
    }

    const isMatch = await bcrypt.compare(password, userWithSameEmail.password);

    if (!isMatch) {
      return res.status(400).json({ errorMessages: ["Invalid credentials"] });
    }

    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessages: ["Email and password are required"] });
    }
    const alg = "HS256";

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new jose.SignJWT({ userWithSameEmail })
      .setProtectedHeader({ alg })
      .setExpirationTime("2h")
      .sign(secret);

    return res.status(200).json({ token });
  }
}
