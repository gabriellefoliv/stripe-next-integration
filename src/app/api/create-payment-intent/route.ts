import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { amount, nome, email } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      metadata: {
        nome,
        email
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
