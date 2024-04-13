import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVericationEmail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    const exisitngVerifiedUserWithUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (exisitngVerifiedUserWithUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    let verificationCode = Math.floor(
      100000 + Math.random() * 800000
    ).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verificationCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationExpiryDate = new Date();
      verificationExpiryDate.setHours(verificationExpiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: verificationCode,
        verifyCodeExpiry: verificationExpiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        message: [],
      });

      await newUser.save();
    }

    // TODO: send verification code email

    const sendVerificationCodeEmail = await sendVerificationEmail(
      email,
      username,
      verificationCode
    );

    if (!sendVerificationCodeEmail.success) {
      return Response.json({
        success: false,
        message: sendVerificationCodeEmail.message,
      });
    }

    return Response.json(
      {
        success: true,
        message:
          "User registered successfully. Please check your email to verify",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while registering. Sad!", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
