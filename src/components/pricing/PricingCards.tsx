"use client";

import Image from "next/image";

// Definindo o tipo para cada oferta
type OfferProps = {
  id: number;
  months: number;
  bottles: number;
  productId: string; // ID da Digistore
  pricePerBottle: number;
  totalPrice: number;
  originalPrice?: number;
  isBestDeal: boolean;
  imageSrc: string;
  savings: number;
  orderClass: string; // Para reordenar no mobile vs desktop (Tailwind classes)
};

const OFFERS: OfferProps[] = [
  {
    id: 1,
    months: 2,
    bottles: 2,
    productId: "637960", // ID do Checkout 1 na HTML original
    pricePerBottle: 79,
    totalPrice: 158,
    isBestDeal: false,
    imageSrc: "/images/gveu2.webp",
    savings: 0,
    orderClass: "order-3 md:order-1",
  },
  {
    id: 2,
    months: 6,
    bottles: 6,
    productId: "632155", // ID do Checkout 2
    pricePerBottle: 49,
    totalPrice: 294,
    originalPrice: 594,
    isBestDeal: true,
    imageSrc: "/images/gveu6+ebook.webp",
    savings: 300,
    orderClass: "order-1 md:order-2 md:scale-[1.02] md:-translate-y-1 relative",
  },
  {
    id: 3,
    months: 3,
    bottles: 3,
    productId: "632154", // ID do Checkout 3
    pricePerBottle: 69,
    totalPrice: 207,
    originalPrice: 297,
    isBestDeal: false,
    imageSrc: "/images/gveu3.webp",
    savings: 90,
    orderClass: "order-2 md:order-3",
  },
];

export default function PricingCards() {
  
  // Constrói o link de checkout focado em afiliado Digistore
  const getCheckoutLink = (productId: string) => {
    // Caso seja apenas link direto sem param de afiliado estruturado
    return `https://www.checkout-ds24.com/product/${productId}/?aff=panicalicp`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {OFFERS.map((offer) => (
        <article
          key={offer.id}
          className={`flex-1 rounded-3xl p-6 flex flex-col text-center shadow-xl ${
            offer.isBestDeal
              ? "border border-white bg-gradient-to-b from-[#7dd3fc] to-[#1e3a8a] text-white shadow-2xl"
              : "border border-neutral-200 bg-white text-neutral-900"
          } ${offer.orderClass}`}
        >
          {offer.isBestDeal && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="rounded-full px-3 py-1 text-[11px] font-bold tracking-wide bg-yellow-500 text-white shadow">
                SPARE €780
              </div>
            </div>
          )}

          <header className="mb-4">
            <p className={`text-lg font-extrabold ${offer.isBestDeal ? "text-white" : "text-neutral-900"}`}>
              {offer.isBestDeal ? "Bester Deal" : offer.bottles === 3 ? "Am Beliebtesten" : "Eine Ausprobieren"}
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-wide">
              {offer.months * 30} Tage, {offer.bottles} Dose
            </h3>
          </header>

          <div className="relative mb-6 flex justify-center items-end h-[160px]">
            {/* Mantemos img classica para não quebrar referências externas ou usamos genérico simulado aqui */}
             <img src={offer.imageSrc} style={{ maxHeight: "100%", width: "auto" }} alt="Product Bottle" />
          </div>

          <div className="mb-4">
            <div className="text-4xl font-extrabold">
              €{offer.pricePerBottle} <span className="text-base font-semibold">Pro Dose</span>
            </div>
          </div>

          {offer.savings > 0 && (
            <ul className={`space-y-1 text-sm mb-6 ${offer.isBestDeal ? "" : "text-neutral-800"}`}>
              <li className="font-extrabold">DU SPARST €{offer.savings}</li>
              <li className={offer.isBestDeal ? "" : "text-neutral-700"}>+ KOSTENFREIE E-BOOKS</li>
            </ul>
          )}

          <div className={`${offer.savings === 0 ? "mb-5" : ""}`}>
             {offer.savings === 0 && <p className="mt-3 text-sm font-extrabold">GESAMT: €{offer.totalPrice}</p>}
          </div>

          <div>
            <a
              href={getCheckoutLink(offer.productId)}
              className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold py-3 shadow hover:bg-emerald-500 transition"
            >
              IN DEN WARENKORB
            </a>
          </div>

          <p className={`mt-4 text-sm ${offer.isBestDeal ? "" : "text-neutral-700"}`}>
            60 Tage Geld-zurück-Garantie
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <img src="/images/credit-cards.png" alt="Credit Cards" />
          </div>

          <p className="mt-3 text-sm font-extrabold whitespace-pre-line">
            {offer.savings > 0 ? (
               <>
                 GESAMT: <s className="opacity-60 font-bold">€{offer.originalPrice}</s> €{offer.totalPrice}
                 <span className={`block font-normal mt-1 ${offer.isBestDeal ? "" : "text-neutral-600"}`}>+ KOSTENLOSER VERSAND IN EUROPA</span>
               </>
            ) : "+ €20,00 VERSAND"}
          </p>
        </article>
      ))}
    </div>
  );
}
