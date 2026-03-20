import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Product } from "@/types";

/**
 * GET /api/products
 * Returns the full product catalogue from the database.
 */
export async function GET() {
  try {
    const products = await query<Product>(
      "SELECT id, name, price::float AS price, color, discountable FROM products ORDER BY id"
    );
    return NextResponse.json(products);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
