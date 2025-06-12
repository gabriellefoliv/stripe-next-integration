// app/api/create-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // ou como parâmetro
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        name,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de assinatura." },
      { status: 500 }
    );
  }
}
