import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "./db";

export interface User {
    id: number;
    username: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "s^aiBI%C#{(Y2zr3!@#5+8&L9$Xwqv";

export async function authenticateUser(username: string, password: string): Promise<User | null> {
    const res = await pool.query(
        "SELECT id, username, password_hash, is_banned FROM accounts WHERE username = $1",
        [username]
    );

    if (res.rows.length === 0) return null;

    const userRow = res.rows[0];
    const match = await bcrypt.compare(password, userRow.password_hash);
    if (!match) return null;

    if (userRow.is_banned) {
        const err: any = new Error("ACCOUNT_BANNED");
        err.code = "ACCOUNT_BANNED";
        throw err;
    }

    return { id: userRow.id, username: userRow.username };
}

export async function createUser(username: string, password: string): Promise<User> {
  const usrname = username.trim();

  if (!usrname) throw new Error("INVALID_USERNAME");

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const res = await pool.query(
      `INSERT INTO accounts (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username`,
      [usrname, passwordHash]
    );

    return { id: res.rows[0].id, username: res.rows[0].username };
  } catch (err: any) {
    //username already exists
    if (err?.code === "23505") {
      const e: any = new Error("USER_EXISTS");
      e.code = "USER_EXISTS";
      throw e;
    }
    throw err;
  }
}

export function generateToken(user: User): string {
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): User | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || typeof decoded !== "object") return null;
        const payload = decoded as JwtPayload & { id?: number | string; username?: string };

        if (typeof payload.id === "number" && typeof payload.username === "string") {
            return { id: payload.id, username: payload.username };
        }
        if (typeof payload.id === "string" && typeof payload.username === "string") {
            const idNum = Number(payload.id);
            if (!Number.isNaN(idNum)) return { id: idNum, username: payload.username };
        }
        return null;
    } catch {
        return null;
    }
}
