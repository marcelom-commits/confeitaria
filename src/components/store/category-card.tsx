import Image from "next/image";
import Link from "next/link";

type CategoryCardProps = {
  name: string;
  description: string;
  image: string;
};

export function CategoryCard({
  name,
  description,
  image,
}: CategoryCardProps) {
  return (
    <Link href={`/catalogo?categoria=${encodeURIComponent(name)}`} className="block">
      <article className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-64">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-3 p-6">
          <h3 className="font-serif text-2xl text-stone-900">{name}</h3>
          <p className="text-sm leading-6 text-stone-600">{description}</p>
          <span className="inline-flex text-sm font-semibold text-rose-700 group-hover:underline">
            Explorar categoria
          </span>
        </div>
      </article>
    </Link>
  );
}