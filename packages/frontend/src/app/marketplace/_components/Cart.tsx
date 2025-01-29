// components/Cart.tsx
import { useState } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { useCart } from "../context/CartContext";
import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  THRIFT_ADDRESS,
  THRIFT_ABI,
} from "@/blockchain/abis/thrift";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, tokenBalance } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"eth" | "token">("eth");

  const totalEth = cart.reduce(
    (sum, item) => sum + parseFloat(item.ethPrice) * item.quantity,
    0
  );

  const totalTokens = cart.reduce(
    (sum, item) => sum + parseFloat(item.tokenPrice) * item.quantity,
    0
  );

  const handleBulkPurchase = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const productIds = cart.map((item) => item.id);
      const quantities = cart.map((item) => item.quantity);

      if (paymentMethod === "eth") {
        const tx = await contract.buyWithEthBulk(productIds, quantities, {
          value: formatEther(totalEth.toString()),
        });
        await tx.wait();
      } else {
        const tokenContract = new Contract(THRIFT_ADDRESS, THRIFT_ABI, signer);
        const approveTx = await tokenContract.approve(
          MARKETPLACE_ADDRESS,
          formatEther(totalTokens.toString())
        );
        await approveTx.wait();

        const tx = await contract.buyWithTokensBulk(productIds, quantities);
        await tx.wait();
      }

      cart.forEach((item) => removeFromCart(item.id));
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg p-4 h-screen fixed right-0 top-0 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
      <div className="mb-4">
        <p>Token Balance: {tokenBalance} THRIFT</p>
      </div>

      {cart.map((item) => (
        <div key={item.id} className="border-b py-4">
          <h3 className="font-bold">{item.name}</h3>
          <p className="text-sm text-gray-600">
            {paymentMethod === "eth"
              ? `${item.ethPrice} ETH`
              : `${item.tokenPrice} THRIFT`}
          </p>
          <div className="flex items-center mt-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              -
            </button>
            <span className="mx-4">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              +
            </button>
            <button
              onClick={() => removeFromCart(item.id)}
              className="ml-4 text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as "eth" | "token")}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="eth">Pay with ETH</option>
          <option value="token">Pay with THRIFT</option>
        </select>

        <p className="mb-4">
          Total:{" "}
          {paymentMethod === "eth"
            ? `${totalEth.toFixed(6)} ETH`
            : `${totalTokens.toFixed(2)} THRIFT`}
        </p>

        <button
          onClick={handleBulkPurchase}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={cart.length === 0}
        >
          Complete Purchase
        </button>
      </div>
    </div>
  );
}
