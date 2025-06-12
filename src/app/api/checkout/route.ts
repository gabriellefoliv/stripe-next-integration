import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

export async function POST(req: NextRequest) {
  const { amount, recurrence } = await req.json(); 

  try {
    let session;

    if (recurrence === 'single') {
      //  Doação única
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'pix'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Doação única',
              },
              unit_amount: Math.round(amount * 100), 
            },
            quantity: 1,
          },
        ],
        success_url: `${req.nextUrl.origin}/success`,
        cancel_url: `${req.nextUrl.origin}/cancel`,
      });
    } else if (recurrence === 'monthly') {
      //  Assinatura mensal

      const product = await stripe.products.create({
        name: 'Doação mensal',
      });

      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency: 'brl',
        recurring: { interval: 'month' },
        product: product.id,
      });

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        success_url: `${req.nextUrl.origin}/success`,
        cancel_url: `${req.nextUrl.origin}/cancel`,
      });
    } else {
      return NextResponse.json({ error: 'Tipo de doação inválido' }, { status: 400 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
