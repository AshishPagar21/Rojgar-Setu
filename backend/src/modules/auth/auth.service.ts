import type { Employer, Worker } from "@prisma/client";

import { prisma } from "../../config/prisma";
import type { AuthResult } from "../../types/common.types";
import { HTTP_STATUS } from "../../utils/constants";
import { generateToken } from "../../utils/jwt";
import {
  canResendOtp,
  consumeOtp,
  generateOtp,
  getResendWaitTime,
  verifyOtpWithMode,
} from "../../utils/otp";
import { ApiError } from "../../utils/response";
import type { SendOtpRequestBody, VerifyOtpRequestBody } from "./auth.types";

const sendOtp = async (payload: SendOtpRequestBody) => {
  const { mobileNumber } = payload;

  const otpData = await generateOtp(mobileNumber);

  return {
    mobileNumber,
    expiresInSeconds: otpData.expiresInSeconds,
    otp: process.env.NODE_ENV === "production" ? undefined : otpData.otp,
  };
};

const resendOtp = async (payload: SendOtpRequestBody) => {
  const { mobileNumber } = payload;

  // Check if resend is allowed
  if (!canResendOtp(mobileNumber)) {
    const waitTime = getResendWaitTime(mobileNumber);
    const waitSeconds = Math.ceil(waitTime / 1000);

    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Please wait ${waitSeconds} seconds before requesting a new OTP`,
    );
  }

  // Generate and send new OTP
  const otpData = await generateOtp(mobileNumber);

  return {
    mobileNumber,
    expiresInSeconds: otpData.expiresInSeconds,
    otp: process.env.NODE_ENV === "production" ? undefined : otpData.otp,
  };
};

const verifyOtpAndLogin = async (
  payload: VerifyOtpRequestBody,
): Promise<AuthResult> => {
  const { mobileNumber, otp, role, name, age, gender } = payload;

  const isOtpValid = verifyOtpWithMode(mobileNumber, otp, false);

  if (!isOtpValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired OTP");
  }

  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: { mobileNumber },
      include: {
        employer: true,
        worker: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Can't reach database") ||
      message.includes("connection")
    ) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Database connection failed. Please try again later.",
      );
    }
    throw error;
  }

  if (existingUser) {
    const token = generateToken({
      userId: existingUser.id,
      role: existingUser.role,
      mobileNumber: existingUser.mobileNumber,
    });

    consumeOtp(mobileNumber);

    return {
      token,
      user: existingUser,
      employer: existingUser.employer,
      worker: existingUser.worker,
    };
  }

  if (!role) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Role is required for new user registration",
    );
  }

  if (role === "EMPLOYER" && !name) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Name is required for employer registration",
    );
  }

  if (role === "WORKER" && (!name || typeof age !== "number" || !gender)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Name, age, and gender are required for worker registration",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        mobileNumber,
        role,
      },
    });

    let employer: Employer | null = null;
    let worker: Worker | null = null;

    if (role === "EMPLOYER") {
      employer = await tx.employer.create({
        data: {
          userId: user.id,
          name: name as string,
        },
      });
    }

    if (role === "WORKER") {
      worker = await tx.worker.create({
        data: {
          userId: user.id,
          name: name as string,
          age: age as number,
          gender: gender as NonNullable<typeof gender>,
        },
      });
    }

    return {
      user,
      employer,
      worker,
    };
  });

  const token = generateToken({
    userId: result.user.id,
    role: result.user.role,
    mobileNumber: result.user.mobileNumber,
  });

  consumeOtp(mobileNumber);

  return {
    token,
    user: result.user,
    employer: result.employer,
    worker: result.worker,
  };
};

export const authService = {
  sendOtp,
  resendOtp,
  verifyOtpAndLogin,
};
