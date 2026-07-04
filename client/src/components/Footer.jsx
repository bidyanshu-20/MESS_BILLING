import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Mess Billing. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Developed with ❤️ by BidyanshuPrachi & Rohit.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
