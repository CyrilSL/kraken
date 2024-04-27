import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import UserService from "src/services/user";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
   // console.log("Request Parameters:", req.params); // Log the req.params object

    const userService = req.scope.resolve("userService") as UserService;
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const stores = await userService.fetchUsersStores(userId);
    res.status(200).json({ stores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};