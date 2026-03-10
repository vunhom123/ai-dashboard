import React from "react";

export default function Login() {
  return (
    <div className="relative h-screen flex">
      {/* LEFT IMAGE */}
      <div className="w-1/2">
        <img src="/hang.jpg" className="w-full h-full object-cover" />
      </div>

      {/* RIGHT IMAGE */}
      <div className="w-1/2">
        <img src="/utc.jpg" className="w-full h-full object-cover" />
      </div>

      {/* LOGIN FORM */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="bg-[#0b1b3b]/90 p-10 rounded-xl shadow-2xl flex flex-col items-center">
          <h1 className="text-white text-4xl font-bold mb-8">AI Factory</h1>

          <input placeholder="Username" className="w-72 p-3 mb-4 rounded" />

          <input
            type="password"
            placeholder="Password"
            className="w-72 p-3 mb-4 rounded"
          />

          <button className="w-72 p-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
