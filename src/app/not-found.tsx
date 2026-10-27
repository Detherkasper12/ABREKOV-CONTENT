import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-[560px] justify-items-start gap-4 px-4 py-24">
      <p className="ltr font-mono text-[13px] text-muted">404</p>
      <h1 className="font-display text-[72px] leading-[0.9] text-forest">הדף לא נמצא</h1>
      <p>אולי הקישור השתנה, או שהמשאב הוסר.</p>
      <Link href="/" className="btn-primary inline-flex items-center">
        לכל המשאבים
      </Link>
    </div>
  );
}
