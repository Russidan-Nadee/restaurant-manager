import { createOrder, InvalidOrderError } from "@/lib/order-repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A JSON request body is required." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "An order object is required." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  try {
    const id = await createOrder(input.tableId, input.items);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidOrderError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Order storage is unavailable.");
    return Response.json({ error: "Unable to place your order. Please try again." }, { status: 503 });
  }
}
