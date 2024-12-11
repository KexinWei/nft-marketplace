// src/components/Header.jsx
import React from "react";
import { Layout } from "antd";

const { Header: AntHeader } = Layout;

const Header = ({ children }) => {
  return (
    <AntHeader
      style={{
        background: "#fff",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {children}
    </AntHeader>
  );
};

export default Header;
