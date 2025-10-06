// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/teacher" },
    { name: "Create Exam", path: "/teacher/exams/create" },
    // Add other teacher links as needed
  ];

  return (
    <nav className="bg-slate-800 text-white p-3 flex justify-between items-center shadow-md">
      <h2 className="text-xl font-bold">Teacher Portal</h2>
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`pb-1 transition-colors duration-200 ${
              location.pathname === item.path
                ? "text-sky-400 font-semibold border-b-2 border-sky-400"
                : "hover:text-sky-300"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};
export default Navbar;