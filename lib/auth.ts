import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { pool } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function loginUser(username: string, password: string) {
    const res = await pool.query("SELECT * FROM accounts WHERE username=$1", [username]);
    const user = res.rows[0];

    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error("Invalid password");

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    return token;
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function validateUser(username: string, password: string) {
    const res = await pool.query(
        "SELECT id, username, password_hash FROM accounts WHERE username = $1",
        [username]
    );

    const user = res.rows[0];
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // generate a token for the user
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "1d",
    });

    return { ...user, token };
}
