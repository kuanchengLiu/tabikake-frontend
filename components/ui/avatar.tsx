import Image from "next/image";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: 24,
  md: 32,
  lg: 48,
};

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const px = sizes[size];
  const initial = name.charAt(0).toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-amber-500 flex items-center justify-center text-black font-semibold flex-shrink-0"
      style={{ width: px, height: px, fontSize: px * 0.45 }}
    >
      {initial}
    </div>
  );
}
