// Shown while a guide loads: title, lead and a few paragraphs in the shape of the page.
export default function Loading() {
  return (
    <div className="site" aria-busy="true" aria-label="טוען מדריך">
      <div className="gd">
        <div className="sk" style={{ width: 160, height: 12 }} />
        <div className="sk" style={{ width: "90%", height: 56, marginTop: 24 }} />
        <div className="sk" style={{ width: "60%", height: 56, marginTop: 8 }} />
        <div className="sk" style={{ width: "80%", height: 20, marginTop: 24 }} />
        <div className="sk" style={{ width: 200, height: 52, marginTop: 32, borderRadius: 999 }} />
        {Array.from({ length: 4 }, (_, i) => (
          <div className="sk" key={i} style={{ width: "100%", height: 18, marginTop: i ? 16 : 56 }} />
        ))}
      </div>
    </div>
  );
}
