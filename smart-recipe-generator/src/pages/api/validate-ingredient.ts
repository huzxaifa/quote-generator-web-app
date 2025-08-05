import type { NextApiRequest, NextApiResponse } from "next";
import { openRouterChat } from "../../lib/openRouter";
import Ingredient from "../../models/ingredient";
import { validateIngredientWithHF } from "../../lib/huggingFace";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const name = req.body.ingredientName?.trim().toLowerCase();
  if (!name) return res.status(400).json({ message: "Ingredient name is required" });

  try {
    // 1. Validate with Hugging Face
    const { isValid, suggested } = await validateIngredientWithHF(name);

    // 2. Already in DB?
    const exists = await Ingredient.findOne({ name });
    if (exists) {
      return res.json({ message: "Error: This ingredient already exists" });
    }

    // 3. Invalid?
    if (!isValid) {
      return res.json({ message: "Invalid", suggested });
    }

    // 4. Add new
    const newIngredient = await Ingredient.create({ name });
    return res.json({ message: "Success", newIngredient, suggested });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add ingredient" });
  }
}