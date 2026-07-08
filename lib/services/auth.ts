import { createClient } from "@supabase/supabase-js";
import { prisma } from "../db";

function createSupabaseAuthClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.VITE_SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

const client = createSupabaseAuthClient();

/**
 * Authenticates a request by verifying the Bearer token or falling back to the developer user.
 * Preserves identical behavior to the Express middleware.
 */
export async function authenticateUser(req: Request): Promise<string> {
  let token = req.headers.get("authorization") || req.headers.get("Authorization");

  if (token) {
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
              name: data.data.user?.user_metadata?.full_name ?? "",
            },
            create: {
              id: userId,
              supabaseId: userId,
              email: data.data.user?.email ?? "",
              provider: data.data.user?.app_metadata?.provider === "google" ? "Google" : "Github",
              name: data.data.user?.user_metadata?.full_name ?? "",
            },
          });
        } catch (e) {
          console.log("Failed to upsert user, proceeding anyway:", e);
        }
        return userId;
      }
    } catch (e) {
      console.log("Supabase token authentication failed:", e);
    }
  }

  console.log("No token or invalid token provided. Falling back to default developer user.");
  try {
    let devUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: "00000000-0000-0000-0000-000000000000" },
          { email: "dev@friday.ai" },
        ],
      },
    });

    if (!devUser) {
      devUser = await prisma.user.create({
        data: {
          id: "00000000-0000-0000-0000-000000000000",
          supabaseId: "00000000-0000-0000-0000-000000000000",
          email: "dev@friday.ai",
          provider: "Github",
          name: "Developer User",
        },
      });
    }

    return devUser.id;
  } catch (e) {
    console.error("Failed to create/use mock dev user", e);
    throw new Error("Incorrect inputs");
  }
}
