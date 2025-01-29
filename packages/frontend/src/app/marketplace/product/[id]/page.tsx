// pages/product/[id].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BrowserProvider, Contract, parseEther } from "ethers";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { Product } from "@/types/market";
import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  THRIFT_ADDRESS,
  THRIFT_ABI,
} from "@/blockchain/abis/thrift";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [exchangePref, setExchangePref] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(
          MARKETPLACE_ADDRESS,
          MARKETPLACE_ABI,
          provider
        );
        const productData = await contract.products(id);

        setProduct({
          id: productData.id.toString(),
          name: productData.name,
          description: productData.description,
          tokenPrice: productData.tokenPrice.toString(),
          ethPrice: productData.ethPrice.toString(),
          image: productData.image,
          seller: productData.seller,
          quantity: productData.quantity.toString(),
          size: productData.size,
          condition: productData.condition,
          brand: productData.brand,
          categories: productData.categories,
          gender: productData.gender,
          isAvailableForExchange: productData.isAvailableForExchange,
          exchangePreference: productData.exchangePreference,
          isSold: productData.isSold,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const handlePurchase = async (paymentMethod: "eth" | "token") => {
    if (!product) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      if (paymentMethod === "eth") {
        const tx = await contract.buyWithEth(product.id, quantity, {
          value: parseEther((Number(product.ethPrice) * quantity).toString()),
        });
        await tx.wait();
      } else {
        const tokenContract = new Contract(THRIFT_ADDRESS, THRIFT_ABI, signer);
        const approveTx = await tokenContract.approve(
          MARKETPLACE_ADDRESS,
          parseEther((Number(product.tokenPrice) * quantity).toString())
        );
        await approveTx.wait();

        const tx = await contract.buyWithToken(product.id, quantity);
        await tx.wait();
      }

      router.push("/");
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  const handleExchange = async () => {
    if (!product) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.proposeExchange(
        product.id,
        quantity,
        exchangePref
      );
      await tx.wait();

      router.push("/");
    } catch (error) {
      console.error("Exchange proposal failed:", error);
    }
  };

  const handleDonate = async () => {
    if (!product) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.donateItem(product.id, quantity);
      await tx.wait();

      router.push("/");
    } catch (error) {
      console.error("Donation failed:", error);
    }
  };

  if (!product) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative h-96">
            <Image
              src={product.image || "/placeholder-clothing.jpg"}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Brand:</span> {product.brand}
                </p>
                <p>
                  <span className="font-semibold">Size:</span> {product.size}
                </p>
                <p>
                  <span className="font-semibold">Condition:</span>{" "}
                  {product.condition}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {product.gender}
                </p>
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {product.categories}
                </p>
                <p>
                  <span className="font-semibold">Available:</span>{" "}
                  {product.quantity}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value)))
                  }
                  className="w-20 px-3 py-2 border rounded"
                />
                <button
                  onClick={() => addToCart({ ...product, quantity: 1 })}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handlePurchase("eth")}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Buy with ETH (
                  {(Number(product.ethPrice) * quantity).toFixed(4)} ETH)
                </button>

                <button
                  onClick={() => handlePurchase("token")}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Buy with Tokens (
                  {(Number(product.tokenPrice) * quantity).toFixed(2)} THRIFT)
                </button>

                {product.isAvailableForExchange && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={exchangePref}
                      onChange={(e) => setExchangePref(e.target.value)}
                      placeholder="Enter your exchange preferences"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <button
                      onClick={handleExchange}
                      className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Request Exchange
                    </button>
                  </div>
                )}

                <button
                  onClick={handleDonate}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Donate to Charity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
