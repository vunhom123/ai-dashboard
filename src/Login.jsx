import { useState } from "react";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = () => {
    if (user === "admin" && pass === "123") {
      alert("Login success");
      window.location.href = "/dashboard";
    } else {
      alert("Wrong username or password");
    }
  };

  return (
    <div className="flex h-screen">
      {/* LEFT IMAGE */}
      <div className="w-1/2 relative">
        <img src="/hang.jpg" className="w-full h-full object-cover" />
      </div>

      {/* RIGHT IMAGE */}
      <div className="w-1/2 relative">
        <img src="/utc.jpg" className="w-full h-full object-cover" />

        {/* LOGIN BOX */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-80">
            <h2 className="text-2xl font-bold mb-4 text-center">
              AI Dashboard
            </h2>

            <input
              placeholder="Username"
              className="border p-2 w-full mb-3"
              onChange={(e) => setUser(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="border p-2 w-full mb-4"
              onChange={(e) => setPass(e.target.value)}
            />

            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white w-full p-2 rounded-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
