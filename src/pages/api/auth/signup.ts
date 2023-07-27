import { NextApiRequest, NextApiResponse } from "next";
import validator from "validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as jose from "jose";

const prisma = new PrismaClient();

export default async function signup(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { firstName, lastName, email, phone, city, password } = req.body;
    const errors: string[] = [];

    const validationShema = [
      {
        valid: validator.isLength(firstName, { min: 3, max: 20 }),
        errorMessage: "First name must be between 3 and 20 characters",
      },
      {
        valid: validator.isLength(lastName, { min: 3, max: 20 }),
        errorMessage: "Last name must be between 3 and 20 characters",
      },
      {
        valid: validator.isEmail(email),
        errorMessage: "Email is not valid",
      },
      {
        valid: validator.isMobilePhone(phone, "any"),
        errorMessage: "Phone number is not valid",
      },
      {
        valid: validator.isLength(city, { min: 3, max: 20 }),
        errorMessage: "City must be between 3 and 20 characters",
      },
      {
        valid: validator.isStrongPassword(password),
        errorMessage: "Password is not strong enough",
      },
    ];

    validationShema.forEach((item) => {
      if (!item.valid) {
        errors.push(item.errorMessage);
      }
    });

    if (errors.length) {
      return res.status(400).json({ errorMessages: errors });
    }

    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      return res.status(400).json({ errorMessages: ["Email already exists"] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        city,
        password: hashedPassword,
      },
    });

    const alg = "HS256";

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new jose.SignJWT({ email: user.email })
      .setProtectedHeader({ alg })
      .setExpirationTime("2h")
      .sign(secret);

    return res.status(200).json({ token });
  }
}
