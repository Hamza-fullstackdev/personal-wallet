import { connectToDatabase } from "@/app/api/utils/db";
import User from "@/app/model/User";
import { NextResponse } from "next/server";
import { hashedPassword } from "@/app/api/utils/hashing";

export async function POST(req: Request) {
  await connectToDatabase();
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Please fill all fields" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json(
      { message: "Please enter a valid email address" },
      { status: 400 }
    );
  }
  if (name.length < 3) {
    return NextResponse.json(
      { message: "Name must be at least 3 characters long" },
      { status: 400 }
    );
  }
  try {
    const isExisted = await User.find({ email });
    if (isExisted.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    } else {
      const encryptedPassword = await hashedPassword(password);
      await User.create({
        name,
        email,
        password: encryptedPassword,
      });
      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Error creating user", error: err },
      { status: 500 }
    );
  }
}
