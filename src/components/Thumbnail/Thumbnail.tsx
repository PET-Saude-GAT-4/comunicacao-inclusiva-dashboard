import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  // Side of the square box in pixels, also the size requested from next/image.
  size: number;
  // Lets the box take its container's width, still square, instead of `size`.
  fluid?: boolean;
  // Border, radius or padding of the box.
  className?: string;
  draggable?: boolean;
};

// A pictogram or SignWriting shown whole inside a fixed white square.
//
// Tailwind's preflight sets `img { height: auto }`, which overrides the height
// next/image writes, so width/height plus object-contain alone lets a tall
// image grow downward and stretch whatever card or row holds it. Taking the
// image out of flow means only the box decides the size; object-contain then
// shrinks the image into it and leaves white space around it.
export default function Thumbnail({
  src,
  alt = "",
  size,
  fluid = false,
  className = "",
  draggable,
}: Props) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-white ${
        fluid ? "w-full aspect-square" : ""
      } ${className}`}
      style={fluid ? undefined : { width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        draggable={draggable}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
}
