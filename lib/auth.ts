import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "./db";

export interface User {
    id: number;
    username: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function authenticateUser(username: string, password: string): Promise<User | null> {
    const res = await pool.query(
        "SELECT id, username, password_hash FROM accounts WHERE username = $1",
        [username]
    );

    if (res.rows.length === 0) return null;

    const userRow = res.rows[0];
    const match = await bcrypt.compare(password, userRow.password_hash);
    if (!match) return null;

    return { id: userRow.id, username: userRow.username };
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
