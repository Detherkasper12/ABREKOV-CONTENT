// Shown while the library loads: the shape of the page, not a spinner.
export default function Loading() {
  return (
    <div className="site" aria-busy="true" aria-label="טוען מדריכים">
      <div className="lw" style={{ paddingBlock: "88px 48px" }}>
        <div className="sk" style={{ width: 120, height: 12 }} />
        <div className="sk" style={{ width: "min(560px,80%)", height: 96, marginTop: 24 }} />
        <div style={{ marginTop: 64 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div className="sk-row" key={i}>
              <div>
                <div className="sk" style={{ width: "70%", height: 28 }} />
                <div className="sk" style={{ width: "90%", height: 16, marginTop: 16 }} />
              </div>
              <div className="sk" style={{ width: 48, height: 48, borderRadius: "50%" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
