/* ============================================================
   BLUR — Tweaks island
   Renders ONLY the floating panel; syncs values to CSS vars
   on <html> so the vanilla page reacts. Restraint: 4 knobs.
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "blur": 22,
  "gold": "Balanced",
  "motion": "Calm",
  "display": "Cormorant"
}/*EDITMODE-END*/;

const GOLD = {
  Quiet:    { strength: 0.5,  hex: "#C9A96E" },
  Balanced: { strength: 0.85, hex: "#C9A96E" },
  Bold:     { strength: 1,    hex: "#D6B374" }
};
const MOTION = { Slow: "880ms", Calm: "760ms", Brisk: "580ms" };

function BlurTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--blur", t.blur + "px");
    const g = GOLD[t.gold] || GOLD.Balanced;
    root.style.setProperty("--gold-strength", String(g.strength));
    root.style.setProperty("--gold", g.hex);
    root.style.setProperty("--reveal-dur", MOTION[t.motion] || MOTION.Calm);
    root.setAttribute("data-display", t.display === "Playfair" ? "playfair" : "cormorant");
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Atmosphere" />
      <TweakSlider label="Blur" value={t.blur} min={8} max={36} step={1} unit="px"
                   onChange={(v) => setTweak("blur", v)} />
      <TweakRadio label="Gold" value={t.gold} options={["Quiet", "Balanced", "Bold"]}
                  onChange={(v) => setTweak("gold", v)} />

      <TweakSection label="Motion" />
      <TweakRadio label="Reveal" value={t.motion} options={["Slow", "Calm", "Brisk"]}
                  onChange={(v) => setTweak("motion", v)} />

      <TweakSection label="Type" />
      <TweakRadio label="Display" value={t.display} options={["Cormorant", "Playfair"]}
                  onChange={(v) => setTweak("display", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<BlurTweaks />);
