import React, { useRef, useState } from "react";
import "./CreepyButton.css";
import { LogOut } from "lucide-react";

export default function CreepyButton({ collapsed, onClick, children, color = "blue" }) {
  const eyesRef = useRef(null);
  const [eyeCoords, setEyeCoords] = useState({ x: 0, y: 0 });

  // 🔥 MÀU LOGIN = XANH, LOGOUT = ĐỎ
  const colorVars =
    color === "red"
      ? { "--primary5": "hsl(0 85% 55%)", "--primary6": "hsl(0 85% 45%)" }
      : { "--primary5": "hsl(223 90% 55%)", "--primary6": "hsl(223 90% 45%)" };

  const updateEyes = (e) => {
    const userEvent = "touches" in e ? e.touches[0] : e;

    const rect = eyesRef.current?.getBoundingClientRect();
    if (!rect) return;

    const eyes = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const cursor = {
      x: userEvent.clientX,
      y: userEvent.clientY,
    };

    const dx = cursor.x - eyes.x;
    const dy = cursor.y - eyes.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;

    const visionRangeX = 180;
    const visionRangeY = 75;
    const distance = Math.hypot(dx, dy);

    const x = (Math.sin(angle) * distance) / visionRangeX;
    const y = (Math.cos(angle) * distance) / visionRangeY;

    setEyeCoords({ x, y });
  };

  const eyeStyle = {
    transform: `translate(${(-50 + eyeCoords.x * 50)}%, ${(-50 + eyeCoords.y * 50)}%)`,
  };

  return (
    <button
      className="creepy-btn"
      type="button"
      onClick={onClick}
      onMouseMove={updateEyes}
      onTouchMove={updateEyes}
      style={colorVars}          // <-- 🔥 QUAN TRỌNG: áp màu động
    >
      <span className="creepy-btn__eyes" ref={eyesRef}>
        <span className="creepy-btn__eye">
          <span className="creepy-btn__pupil" style={eyeStyle}></span>
        </span>

        <span className="creepy-btn__eye">
          <span className="creepy-btn__pupil" style={eyeStyle}></span>
        </span>
      </span>

      <span className="creepy-btn__cover">{children}</span>
    </button>
  );
}
