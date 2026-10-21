import { Request, Response } from "express";
import { AuthRequest, generateToken } from "../middleware/auth";
import { userRepository, DuplicateEmailError } from "../repository/userRepository";
import { User } from "../types";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (value: unknown) => (typeof value === "string" ? value : "");

const toPublicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const name = str(req.body?.name).trim();
      const email = str(req.body?.email).trim();
      const password = str(req.body?.password);

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Name, email and password are required" });
      }
      if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ error: "Enter a valid email address" });
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return res
          .status(400)
          .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }

      const user = await userRepository.create({ name, email, password });

      res.status(201).json({ token: generateToken(user), user: toPublicUser(user) });
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        return res.status(409).json({ error: error.message });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const email = str(req.body?.email).trim();
      const password = str(req.body?.password);

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await userRepository.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ error: "Incorrect email or password" });
      }

      res.json({ token: generateToken(user), user: toPublicUser(user) });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await userRepository.findById(req.user!.id);
      if (!user) {
        return res.status(401).json({ error: "Account no longer exists" });
      }

      res.json(toPublicUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(401).json({ error: "Account no longer exists" });
      }

      const name = str(req.body?.name).trim() || user.name;
      const email = str(req.body?.email).trim() || user.email;
      const oldPassword = str(req.body?.oldPassword);
      const newPassword = str(req.body?.newPassword);
      const confirmPassword = str(req.body?.confirmPassword);

      if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ error: "Enter a valid email address" });
      }

      let password: string | undefined;

      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword || !newPassword || !confirmPassword) {
          return res
            .status(400)
            .json({ error: "Fill in all password fields to change your password" });
        }
        if (!(await userRepository.verifyPasswordById(userId, oldPassword))) {
          return res.status(400).json({ error: "Current password is incorrect" });
        }
        if (newPassword !== confirmPassword) {
          return res.status(400).json({ error: "New passwords do not match" });
        }
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
          return res
            .status(400)
            .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }
        password = newPassword;
      }

      const updated = await userRepository.update({ id: userId, name, email, password });

      // Name and email are in the token claims, so hand back a fresh one.
      return res.status(200).json({
        message: "Profile updated",
        token: generateToken(updated),
        user: toPublicUser(updated),
      });
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        return res.status(409).json({ error: error.message });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
