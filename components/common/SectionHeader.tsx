type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
};

export default function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = "left",
  dark = false,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={
        centered
          ? "mx-auto max-w-[780px] text-center"
          : "max-w-[680px]"
      }
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
          dark ? "text-white/55" : "text-[#4c775a]"
        }`}
      >
        {eyebrow}
      </p>

      <h2
        className={`mt-5 text-[clamp(2.35rem,4.4vw,4.8rem)] font-medium leading-[1.06] tracking-[-0.05em] ${
          dark ? "text-white" : "text-[#1d2c23]"
        }`}
      >
        {title}

        {highlight && (
          <span
            className={`block ${
              dark ? "text-[#b8d6bf]" : "text-[#4a7659]"
            }`}
          >
            {highlight}
          </span>
        )}
      </h2>

      {description && (
        <p
          className={`mt-6 text-[14px] font-light leading-8 sm:text-[15px] ${
            centered ? "mx-auto max-w-[650px]" : "max-w-[590px]"
          } ${dark ? "text-white/60" : "text-[#707c74]"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}