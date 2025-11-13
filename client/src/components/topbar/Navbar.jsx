import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [underlineStyle, setUnderlineStyle] = useState({});
  const linkRefs = useRef({});
  const navRef = useRef(null);

  const navItems = [
    { path: "/", label: "Trang chủ" },
    { path: "/verify", label: "Tra cứu" },
    { path: "/admin", label: "Quản trị" },
  ];

  // ✅ Hàm cập nhật vị trí underline
  const updateUnderline = () => {
    const activeItem = navItems.find((item) => item.path === location.pathname);
    if (!activeItem) return;

    const activeLink = linkRefs.current[activeItem.path];
    if (activeLink && navRef.current) {
      const rect = activeLink.getBoundingClientRect();
      const parentRect = navRef.current.getBoundingClientRect();
      setUnderlineStyle({
        width: `${rect.width}px`,
        transform: `translateX(${rect.left - parentRect.left}px)`,
      });
    }
  };

  // ✅ Gọi lại khi route thay đổi
  useEffect(() => {
    const timer = setTimeout(updateUnderline, 50); // đợi DOM cập nhật xong
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // ✅ Tự cập nhật nếu window resize
  useEffect(() => {
    const observer = new ResizeObserver(() => updateUnderline());
    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener("resize", updateUnderline);
    return () => {
      window.removeEventListener("resize", updateUnderline);
      observer.disconnect();
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/">EduChain</Link>
      </div>

      <ul className="navbar__links" ref={navRef}>
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              ref={(el) => (linkRefs.current[item.path] = el)}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.label}
            </Link>
          </li>
        ))}

        {/* underline động */}
        <span className="underline" style={underlineStyle} />
      </ul>

      <div className="navbar__auth">
        {user ? (
          <>
            <span className="navbar__welcome">👋 {user.name}</span>
            <button className="btn logout" onClick={logout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="btn login2">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
