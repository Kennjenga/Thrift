import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 text-gray-900">
      {/* Navigation Bar */}
      <nav className="shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {/* Ace Logo */}
            <Image
              src="/ace-logo.png" // Replace with your logo path
              alt="Ace Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <h1 className="text-2xl font-bold text-green-700">Ace</h1>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-green-700 hover:text-green-500">
              Home
            </a>
            <a href="#" className="text-green-700 hover:text-green-500">
              Shop
            </a>
            <a href="#" className="text-green-700 hover:text-green-500">
              About
            </a>
            <a href="#" className="text-green-700 hover:text-green-500">
              Contact
            </a>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-green-700 mb-4">
          Sustainable Fashion for a Better Tomorrow
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          Discover eco-friendly and stylish clothing that cares for the planet.
        </p>
        <a
          href="#"
          className="bg-green-700 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
        >
          Shop Now
        </a>
      </section>

      {/* Footer */}
      <footer className=" shadow-md mt-auto py-6">
        <div className="container mx-auto text-center text-gray-700">
          <p>&copy; 2023 Ace. All rights reserved.</p>
          <p className="text-sm mt-2">Made with ❤️ for a sustainable future.</p>
        </div>
      </footer>
    </div>
  );
}
