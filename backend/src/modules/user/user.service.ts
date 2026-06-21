import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

const getUserProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employer: true,
      worker: true,
    },
  });

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  return {
    user,
    employer: user.employer,
    worker: user.worker,
  };
};

const listUsers = async (): Promise<never[]> => {
  return [];
};

export const userService = {
  listUsers,
  getUserProfile,
};
