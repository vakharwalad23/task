import type { Express, Request, Response } from "express";
import { hash } from "bcrypt";
import fs from "fs";

const app: Express = require("express")();
app.use(require("body-parser").json());

app.post("/api/submit", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: "All fields are required" });
  }

  // validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
  }

  // validate the password length
  if (password.length < 8) {
    res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  // check if the user already exists
  if (fs.existsSync("userData.json")) {
    const existingData = JSON.parse(fs.readFileSync("userData.json", "utf-8"));
    if (existingData.email === email) {
      res.status(400).json({ error: "User with this email already exists" });
    }
  }

  // hashing the password
  const hashedPassword = await hash(password, 10);

  // store the data in json file
  const userData = {
    id: crypto.randomUUID(),
    username,
    email,
    password: hashedPassword,
  };
  fs.writeFileSync("userData.json", JSON.stringify(userData, null, 2), "utf-8");

  // send the userid as the response
  res
    .status(201)
    .json({ id: userData.id, message: "User created successfully" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
