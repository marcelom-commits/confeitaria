import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";

type ProductCardProps = {
  id?: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
};

export function ProductCard({
  id,
  name,
  category,
  price,
  description,
  image,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-72">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">
            {category}
          </p>
          <h3 className="font-serif text-2xl text-stone-900">{name}</h3>
          <p className="text-sm leading-6 text-stone-600">{description}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-lg font-semibold text-stone-900">{price}</span>
          {id ? <AddToCartButton productId={id} /> : null}
        </div>
      </div>
    </article>
  );
}