import { connectToDatabase } from "@/app/api/utils/db";
import User from "@/app/model/User";
import { NextResponse } from "next/server";
import { hashedPassword } from "@/app/api/utils/hashing";
import { verifyUser } from "@/app/api/utils/verify-user";

export async function PATCH(req: Request) {
  await connectToDatabase();
  const { name, email, password, currency } = await req.json();
  const userId = await verifyUser();
  try {
    const findUser = await User.findById(userId);
    if (!findUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    let encryptedPassword = findUser.password;
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { message: "Password should be at least 8 characters" },
          { status: 400 }
        );
      }
      encryptedPassword = await hashedPassword(password);
    }
    const updatedUser = await User.findByIdAndUpdate(
      findUser._id,
      {
        name,
        email,
        currency,
        password: encryptedPassword,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Error updating user" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}