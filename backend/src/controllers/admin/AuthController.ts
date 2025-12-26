import { Request, Response } from "express";

export const adminLogin = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (
    email === "admin@amora.com" &&
    password === "amora12345"
  ) {
    return res.json({
      success: true,
      token: "admin-token-123",
      user: {
        name: "Admin",
        role: "admin"
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Email atau password salah"
  });
};