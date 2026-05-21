type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-3xl text-stone-900 sm:text-4xl">{title}</h2>
      {description ? (
        <p className="text-base leading-7 text-stone-600">{description}</p>
      ) : null}
    </div>
  );
}