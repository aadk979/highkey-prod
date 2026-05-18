import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-6 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">
        Page not found
      </p>
      <h1 className="mb-4 font-heading text-4xl font-light text-foreground md:text-5xl">
        This piece is not here anymore.
      </h1>
      <p className="mb-8 max-w-md text-muted">
        Browse the current Highkey collection of upcycled denim keychains and
        customizable accessories.
      </p>
      <Link href="/shop">
        <Button className="rounded-full">Shop current pieces</Button>
      </Link>
    </section>
  );
}
