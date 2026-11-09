"use client";

import { useState, useEffect } from "react";

type Region = "Australia" | "UK" | "US";
type Topic = "Length" | "Weight" | "Temperature" | "Cooking" | "Speed" | "Area" | "Fuel";

type Conversion = {
  id: string;
  topic: Topic;
  from: string;
  to: string;
  forward: (x: number, r: Region) => number;
  backward: (x: number, r: Region) => number;
  one?: string; // singular name, used for the cooking note
};

// Most conversions are just "multiply by a number", so this saves repeating ourselves.
// The number can change by region (e.g. tablespoons).
function byFactor(f: number | ((r: Region) => number)) {
  const get = (r: Region) => (typeof f === "function" ? f(r) : f);
  return {
    forward: (x: number, r: Region) => x * get(r),
    backward: (x: number, r: Region) => x / get(r),
  };
}

const conversions: Conversion[] = [
  // Length
  { id: "mm-in", topic: "Length", from: "Millimetres", to: "Inches", ...byFactor(1 / 25.4) },
  { id: "cm-in", topic: "Length", from: "Centimetres", to: "Inches", ...byFactor(1 / 2.54) },
  { id: "m-ft", topic: "Length", from: "Metres", to: "Feet", ...byFactor(1 / 0.3048) },
  { id: "m-yd", topic: "Length", from: "Metres", to: "Yards", ...byFactor(1 / 0.9144) },
  { id: "km-mi", topic: "Length", from: "Kilometres", to: "Miles", ...byFactor(1 / 1.609344) },

  // Weight
  { id: "lb-kg", topic: "Weight", from: "Pounds", to: "Kilograms", ...byFactor(0.45359237) },
  { id: "oz-g", topic: "Weight", from: "Ounces", to: "Grams", ...byFactor(28.349523) },
  { id: "st-kg", topic: "Weight", from: "Stone", to: "Kilograms", ...byFactor(6.350293) },

  // Temperature (not a simple multiply, so written out in full)
  {
    id: "temp",
    topic: "Temperature",
    from: "Degrees Celsius",
    to: "Degrees Fahrenheit",
    forward: (c) => (c * 9) / 5 + 32,
    backward: (f) => ((f - 32) * 5) / 9,
  },

  // Cooking (these change by country)
  {
    id: "tbsp-ml",
    topic: "Cooking",
    from: "Tablespoons",
    to: "Millilitres",
    one: "tablespoon",
    ...byFactor((r) => (r === "Australia" ? 20 : r === "UK" ? 15 : 14.7868)),
  },
  {
    id: "tsp-ml",
    topic: "Cooking",
    from: "Teaspoons",
    to: "Millilitres",
    one: "teaspoon",
    ...byFactor((r) => (r === "US" ? 4.92892 : 5)),
  },
  {
    id: "cup-ml",
    topic: "Cooking",
    from: "Cups",
    to: "Millilitres",
    one: "cup",
    ...byFactor((r) => (r === "US" ? 236.588 : 250)),
  },
  {
    id: "floz-ml",
    topic: "Cooking",
    from: "Fluid ounces",
    to: "Millilitres",
    one: "fluid ounce",
    ...byFactor((r) => (r === "US" ? 29.5735 : 28.4131)),
  },

  // Litres to gallons for water and other liquids (gallon size changes by country)
  {
    id: "l-gal-cooking",
    topic: "Cooking",
    from: "Litres",
    to: "Gallons",
    ...byFactor((r) => 1 / (r === "US" ? 3.78541 : 4.54609)),
  },

  // Fuel
  {
    id: "l-gal-fuel",
    topic: "Fuel",
    from: "Litres",
    to: "Gallons",
    ...byFactor((r) => 1 / (r === "US" ? 3.78541 : 4.54609)),
  },

    // Fuel economy. Not a simple multiply: a lower L/100km is better, a higher MPG is better.
  // The gallon size changes by country, so the answer matches the picked country.
  {
    id: "l100-mpg",
    topic: "Fuel",
    from: "Litres per 100 km",
    to: "Miles per gallon",
    forward: (x, r) =>
      x === 0 ? 0 : (100 * (r === "US" ? 3.78541 : 4.54609)) / (x * 1.609344),
    backward: (x, r) =>
      x === 0 ? 0 : (100 * (r === "US" ? 3.78541 : 4.54609)) / (x * 1.609344),
  },

  // Speed
  { id: "kmh-mph", topic: "Speed", from: "Kilometres per hour", to: "Miles per hour", ...byFactor(1 / 1.609344) },

  // Area
  { id: "m2-ft2", topic: "Area", from: "Square metres", to: "Square feet", ...byFactor(10.7639104) },
  { id: "ha-ac", topic: "Area", from: "Hectares", to: "Acres", ...byFactor(2.47105381) },
];

const topics: { name: Topic; hint: string }[] = [
  { name: "Length", hint: "Millimetres, inches, feet, metres, miles" },
  { name: "Weight", hint: "Pounds, ounces, stone, kilograms" },
  { name: "Temperature", hint: "Celsius and Fahrenheit" },
  { name: "Cooking", hint: "Spoons, cups, millilitres" },
  { name: "Speed", hint: "Kilometres and miles per hour" },
   { name: "Area", hint: "Square metres, hectares, acres" },
  { name: "Fuel", hint: "Litres, gallons, litres per 100 km, miles per gallon" },
];

const regions: Region[] = ["Australia", "UK", "US"];

// Shows up to 3 decimal places, with commas for big numbers
function fmt(n: number): string {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 3 });
}

const bigButton =
  "w-full text-left bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] rounded-xl px-5 py-4 shadow-md hover:shadow-lg transition-all";

const backButton =
  "inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all mb-6";

export default function ConverterPage() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [reversed, setReversed] = useState(false);
  const [input, setInput] = useState("");
  const [region, setRegion] = useState<Region>("Australia");

  // Remember which country's spoons and cups the person uses
  useEffect(() => {
    const saved = localStorage.getItem("measureRegion");
    if (saved === "Australia" || saved === "UK" || saved === "US") {
      setRegion(saved);
    }
  }, []);

  function chooseRegion(r: Region) {
    setRegion(r);
    localStorage.setItem("measureRegion", r);
  }

  function pickTopic(t: Topic) {
    setTopic(t);
    setConversion(null);
  }

  function pickConversion(c: Conversion) {
    setConversion(c);
    setReversed(false);
    setInput("");
  }

  // Only lets through numbers: digits, one decimal point, and a minus at the start
  function handleInput(value: string) {
    let v = value.replace(/[^0-9.-]/g, "");
    const negative = v.startsWith("-");
    v = v.replace(/-/g, "");
    const parts = v.split(".");
    if (parts.length > 1) v = parts[0] + "." + parts.slice(1).join("");
    setInput((negative ? "-" : "") + v.slice(0, 12));
  }

  // The country picker, only shown for Cooking
  const regionPicker =
    topic === "Cooking" || topic === "Fuel" ? (
      <div className="mb-6">
        <p className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            {topic === "Fuel" ? "Whose gallons?" : "Whose spoons and cups?"}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => chooseRegion(r)}
              className={`h-16 rounded-xl text-xl font-semibold shadow-md bg-[var(--bg-card)] text-[var(--text-primary)] ${
                region === r
                  ? "border-4 border-[var(--accent-button-bg)]"
                  : "border-2 border-[var(--border-default)]"
              }`}
            >
              {region === r ? "✓ " : ""}
              {r}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  // ---- Step 3: the converter itself ----
  if (topic && conversion) {
    const fromLabel = reversed ? conversion.to : conversion.from;
    const toLabel = reversed ? conversion.from : conversion.to;
    const number = parseFloat(input);
    const valid = !isNaN(number);
    const result = valid
      ? reversed
        ? conversion.backward(number, region)
        : conversion.forward(number, region)
      : null;

    return (
      <main className="min-h-screen bg-[var(--bg-page)] p-4 sm:p-8 max-w-md mx-auto w-full">
        <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
          Converter
        </h1>

        <button onClick={() => setConversion(null)} className={backButton}>
          ← Back to {topic}
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
          {fromLabel} to {toLabel}
        </h2>

        {regionPicker}

        <label className="block text-xl font-semibold mb-2 text-[var(--text-primary)]">
          Type your number of {fromLabel.toLowerCase()}:
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="0"
          className="w-full h-16 rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] text-3xl font-bold px-4 mb-4"
        />

        <div
          aria-live="polite"
          className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl shadow-md p-5 mb-4 text-right"
        >
          <p className="text-[var(--text-secondary)] text-xl">{toLabel}</p>
          <p className="text-5xl font-bold text-[var(--text-primary)] break-all">
            {result !== null ? fmt(result) : "—"}
          </p>
        </div>

         {(conversion.id === "l-gal-cooking" ||
          conversion.id === "l-gal-fuel" ||
          conversion.id === "l100-mpg") && (
          <p className="text-[var(--text-secondary)] text-lg mb-4">
            {region === "US"
              ? "In US, 1 gallon is the US gallon (3.785 litres)."
              : `In ${region}, 1 gallon is the Imperial gallon (4.546 litres).`}
          </p>
        )}

        {conversion.topic === "Cooking" && conversion.one && (
          <p className="text-[var(--text-secondary)] text-lg mb-4">
            In {region}, 1 {conversion.one} is {fmt(conversion.forward(1, region))} millilitres.
          </p>
        )}

        <button
          onClick={() => {
            setReversed(!reversed);
            setInput("");
          }}
          className="w-full h-16 rounded-xl text-xl font-semibold shadow-md bg-[var(--bg-card)] border-4 border-[var(--accent-button-bg)] text-[var(--accent-text)]"
        >
          Swap direction: {toLabel} to {fromLabel}
        </button>
      </main>
    );
  }

  // ---- Step 2: pick a conversion within the topic ----
  if (topic) {
    return (
      <main className="min-h-screen bg-[var(--bg-page)] p-4 sm:p-8 max-w-md mx-auto w-full">
        <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
          Converter
        </h1>

        <button onClick={() => setTopic(null)} className={backButton}>
          ← Back to all topics
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
          {topic}: what do you want to convert?
        </h2>

        {regionPicker}

        <div className="space-y-3">
          {conversions
            .filter((c) => c.topic === topic)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => pickConversion(c)}
                className={`${bigButton} text-xl font-semibold`}
              >
                {c.from} to {c.to}
              </button>
            ))}
        </div>
      </main>
    );
  }

  // ---- Step 1: pick a topic ----
  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-4 sm:p-8 max-w-md mx-auto w-full">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Converter
      </h1>

      <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
        What do you want to convert?
      </h2>

      <div className="space-y-3">
        {topics.map((t) => (
          <button
            key={t.name}
            onClick={() => pickTopic(t.name)}
            className={bigButton}
          >
            <span className="block text-2xl font-bold">{t.name}</span>
            <span className="block text-[var(--text-secondary)] text-lg">
              {t.hint}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}