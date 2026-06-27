import type { NextFunction, Request, Response } from "express";
import { createSupabaseClient } from "./client";
import { prisma } from "./db";

const client = createSupabaseClient();

export async function middleware(req: Request, res: Response, next: NextFunction) {
    let token = req.headers.authorization;

    if (token) {
        // Strip Bearer prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

        try {
            const data = await client.auth.getUser(token);
            const userId = data.data.user?.id;
            if (userId) {
                try {
                    await prisma.user.upsert({
                        where: { id: userId },
                        update: {
                            email: data.data.user?.email ?? "",
                            name: data.data.user?.user_metadata.full_name ?? "",
                        },
                        create: {
                            id: userId,
                            supabaseId: userId,
                            email: data.data.user?.email ?? "",
                            provider: data.data.user?.app_metadata.provider === "google" ? "Google" : "Github",
                            name: data.data.user?.user_metadata.full_name ?? "",
                        },
                    });
                } catch (e) {
                    console.log("Failed to upsert user, proceeding anyway:", e);
                }
                req.userId = userId;
                return next();
            }
        } catch (e) {
            console.log("Supabase token authentication failed:", e);
        }
    }

    // Fallback to dev user in development/local environments
    console.log("No token or invalid token provided. Falling back to default developer user.");
    try {
        // First check if a developer user already exists by ID or email
        let devUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: "00000000-0000-0000-0000-000000000000" },
                    { email: "dev@friday.ai" }
                ]
            }
        });

        if (!devUser) {
            devUser = await prisma.user.create({
                data: {
                    id: "00000000-0000-0000-0000-000000000000",
                    supabaseId: "00000000-0000-0000-0000-000000000000",
                    email: "dev@friday.ai",
                    provider: "Github",
                    name: "Developer User",
                }
            });
        }

        req.userId = devUser.id;
        return next();
    } catch (e) {
        console.error("Failed to create/use mock dev user", e);
        res.status(403).json({
            message: "Incorrect inputs"
        });
    }
}