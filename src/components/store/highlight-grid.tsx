import { highlights } from "@/lib/site-config";

export function HighlightGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {highlights.map((item) => (
        <article
          key={item.title}
          className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
        >
          <h3 className="font-serif text-2xl text-stone-900">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {item.description}
          </p>
        </article>
      ))}
    </div>
  );
}