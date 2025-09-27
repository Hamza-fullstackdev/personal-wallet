import { config } from "@/app/api/utils/env-config";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const verifyUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const decoded = jwt.verify(token, config.jwtSecretKey as string) as {
    id: string;
  };
  if (!decoded.id) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }
  return decoded.id;
};
