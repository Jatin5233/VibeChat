"use client";
import { useTheme } from "@/context/themeContext";
import { themes } from "@/theme";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const t = themes[theme]; // Get current theme for the container

  return (
    <div className={`${t.sidebar} rounded-2xl p-6 shadow-lg w-full max-w-md`}>
      <h2 className={`text-lg font-semibold mb-4 ${t.text}`}>Choose Theme</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(themes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setTheme(key as keyof typeof themes)}
            className={`p-4 rounded-xl shadow-md text-center transition ${
              theme === key ? `ring-2 ${t.accent.replace('text-', 'ring-')}` : "ring-2 ring-transparent" // Use accent for ring
            } ${value.sidebar}`} // Show each button in its own theme color
          >
            <span className={`${value.text} font-medium`}>{value.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
