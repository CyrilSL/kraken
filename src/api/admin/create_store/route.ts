import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import UserService from "src/services/user";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const userService = req.scope.resolve("userService") as UserService;
    const { userId, storeDetails } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const newStore = await userService.createStoreForUser(userId, storeDetails);

    res.status(200).json({ message: "Store created successfully", store: newStore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};