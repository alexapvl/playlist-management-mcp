import { User } from "../generated/prisma";
import prisma from "./prisma";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Hash password using crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

// Verify password
export function verifyPassword(
  storedPassword: string,
  suppliedPassword: string
): boolean {
  const [salt, storedHash] = storedPassword.split(":");
  const hash = crypto
    .pbkdf2Sync(suppliedPassword, salt, 1000, 64, "sha512")
    .toString("hex");
  return storedHash === hash;
}

// Generate a secure token for session
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Set auth cookie directly using the cookies() API
export async function setAuthCookie(userId: string) {
  console.log("Setting auth cookie with userId:", userId);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", userId, {
      expires,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    console.log("Auth cookie set successfully");
  } catch (error) {
    console.error("Error setting cookie:", error);
    throw error;
  }
}

// Get current user from cookie
export async function getCurrentUser(
  request?: NextRequest
): Promise<User | null> {
  try {
    let token;

    if (request) {
      // Get token from request cookies when in middleware
      token = request.cookies.get("auth_token")?.value;
      console.log("Reading cookie from request:", token);
    } else {
      // Get token from server component cookies
      try {
        // Get token from server cookies
        const cookieStore = await cookies();
        token = cookieStore.get("auth_token")?.value;
        console.log("Reading cookie from cookieStore:", token);
      } catch (error) {
        console.error("Error accessing cookieStore:", error);
      }
    }

    if (!token) {
      console.log("No auth token found in cookie");
      return null;
    }

    // In a real app, validate this token against a session store
    // For this demo, we're using the token as the userId directly
    try {
      // Check if we're in a browser/edge environment that can't use Prisma
      if (
        typeof window !== "undefined" ||
        process.env.NEXT_RUNTIME === "edge"
      ) {
        console.log(
          "Running in browser/edge environment, skipping Prisma query"
        );
        // In browser/edge, we just verify token exists but don't query DB
        return { id: token } as User; // Return minimal user object with just id
      }

      const user = await prisma.user.findUnique({
        where: { id: token },
      });

      if (user) {
        console.log("User found from token");
      } else {
        console.log("No user found for token:", token);
      }

      return user;
    } catch (error) {
      console.error("Error in prisma query:", error);

      // If we get a Prisma browser environment error, return a basic user
      if (
        error instanceof Error &&
        error.message.includes("unable to run in this browser environment")
      ) {
        console.log("Prisma browser error, returning basic user object");
        return { id: token } as User; // Return minimal user object
      }

      return null;
    }
  } catch (error) {
    console.error("Error in cookie reading:", error);
    return null;
  }
}

// Remove auth cookie using the cookies() API
export async function removeAuthCookie() {
  console.log("Removing auth cookie");

  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    console.log("Auth cookie removed successfully");
  } catch (error) {
    console.error("Error removing cookie:", error);
    throw error;
  }
}
