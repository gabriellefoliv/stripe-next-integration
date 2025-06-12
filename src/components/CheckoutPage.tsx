"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";

const CheckoutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "payment">("form");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: convertToSubcurrency(amount),
        nome,
        email,
      }),
    });

    const data = await res.json();
    setClientSecret(data.clientSecret);
    setStep("payment");
    setLoading(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `http://localhost:3000/payment-success?amount=${amount}`,
      },
    });

    if (error) setErrorMessage(error.message);
    setLoading(false);
  };

  if (step === "form") {
    return (
      <form onSubmit={handleFormSubmit} className="bg-white p-2 rounded-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="nome">
            Nome
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full text-black p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-black p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50"
        >
          {loading ? "Carregando..." : "Continuar para pagamento"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePaymentSubmit} className="bg-white p-2 rounded-md">
      <PaymentElement />
      {errorMessage && <div>{errorMessage}</div>}
      <button
        disabled={!stripe || loading}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50"
      >
        {!loading ? `Pagar R$${amount}` : "Processando..."}
      </button>
    </form>
  );
};

export default CheckoutPage;