// components/ProductCard.tsx
import { useRouter } from "next/router";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { Product } from "@/types/market";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Image
        src={product.image || "/placeholder-clothing.jpg"}
        alt={product.name}
        width={400}
        height={300}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="mb-4">
          <p>Token Price: {product.tokenPrice} THRIFT</p>
          <p>ETH Price: {product.ethPrice} ETH</p>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => router.push(`/product/${product.id}`)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Details
          </button>
          <button
            onClick={() => addToCart(product)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
