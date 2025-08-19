import React from "react";

export default function Footer() {
  return (
    <footer className="py-6 mt-10 text-gray-200 bg-gray-900 ">
      <div className="container grid gap-6 px-6 mx-auto text-sm md:grid-cols-3">
        {/* Developer Info */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Developer</h2>
          <p className="mb-1">Name: <span className="font-medium">Sandipan Malick</span></p>
          <p>Contact: <span className="font-medium">7364853753</span></p>
        </div>

        {/* App Usage Hints */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">App Usage Hints</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>First add the product in <span className="font-medium text-green-400">Item</span> section.</li>
            <li>Then search the product by name.</li>
            <li>You can update the <span className="font-medium">price</span> , <span className="font-medium">quantity</span> and all items.</li>
            <li>Check the  history anytime.</li>
          </ul>
        </div>

        {/* Product Availability Guide */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Product Availability</h2>
          <ul className="space-y-1">
            <li><span className="font-medium text-red-400">0</span> → No product quantity available</li>
            <li><span className="font-medium text-green-400">Green</span> → Product available with stock</li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="pt-4 mt-6 text-xs text-center text-gray-400 border-t border-gray-700">
        © {new Date().getFullYear()} Sandipan Malick | All Rights Reserved
      </div>
    </footer>
  );
}
