"use client";

import { useState } from "react";
import { Upload, RefreshCw } from "lucide-react";
import styled from "styled-components";
import { useMarketplace } from "@/blockchain/hooks/useMarketplace";
import { parseEther } from "viem";
import { parseTokenAmount } from "@/utils/token-utils";
import Navbar from "../_components/navbar";
import type { ProductCondition, ProductGender } from "@/types/market";

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f4f6f8 100%);
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #162a2c;
  margin-bottom: 1rem;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #162a2c;
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #2563eb;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;

  &:checked {
    background: #2563eb;
    border-color: #2563eb;
  }
`;

interface FormData {
  name: string;
  description: string;
  size: string;
  condition: ProductCondition;
  brand: string;
  categories: string;
  gender: ProductGender;
  image: string;
  tokenPrice: string;
  ethPrice: string;
  quantity: string;
  isAvailableForExchange: boolean;
  exchangePreference: string;
}

const sizeOptions = {
  topsSizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  bottomsSizes: [
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
  ],
  shoesSizes: {
    men: ["6", "7", "8", "9", "10", "11", "12", "13", "14"],
    women: ["5", "6", "7", "8", "9", "10", "11"],
    kids: ["1", "2", "3", "4", "5", "6"],
  },
  dressSizes: [
    "0",
    "2",
    "4",
    "6",
    "8",
    "10",
    "12",
    "14",
    "16",
    "18",
    "20",
    "22",
    "24",
  ],
};

export default function CreateProduct() {
  const { createProduct } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedSizeType, setSelectedSizeType] = useState("tops");
  const [selectedShoeType, setSelectedShoeType] = useState("men");

  const initialFormState: FormData = {
    name: "",
    description: "",
    size: "",
    condition: "New",
    brand: "",
    categories: "",
    gender: "Unisex",
    image: "",
    tokenPrice: "",
    ethPrice: "",
    quantity: "1",
    isAvailableForExchange: false,
    exchangePreference: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Product name is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.size) return "Size is required";
    if (!formData.brand.trim()) return "Brand is required";
    if (!formData.categories.trim()) return "Categories are required";
    if (!formData.image.trim()) return "Image URL is required";
    if (!formData.tokenPrice && !formData.ethPrice)
      return "At least one price must be set";
    if (parseInt(formData.quantity) < 1) return "Quantity must be at least 1";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const tokenPriceValue = parseTokenAmount(formData.tokenPrice || "0");
      const ethPriceValue = parseEther(formData.ethPrice || "0");
      const categoriesArray = formData.categories
        .split(",")
        .map((cat) => cat.trim());

      await createProduct(
        formData.name,
        formData.description,
        formData.size,
        formData.condition,
        formData.brand,
        categoriesArray,
        formData.gender,
        formData.image,
        tokenPriceValue,
        ethPriceValue,
        BigInt(formData.quantity),
        formData.isAvailableForExchange,
        formData.exchangePreference
      );

      setFormData(initialFormState);
      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    if (name === "tokenPrice" || name === "ethPrice") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getSizeOptions = () => {
    switch (selectedSizeType) {
      case "tops":
        return sizeOptions.topsSizes;
      case "bottoms":
        return sizeOptions.bottomsSizes;
      case "shoes":
        return sizeOptions.shoesSizes[
          selectedShoeType as keyof typeof sizeOptions.shoesSizes
        ];
      case "dress":
        return sizeOptions.dressSizes;
      default:
        return [];
    }
  };

  return (
    <PageContainer>
      <Navbar />

      <MainContent>
        <Card>
          <Title>Create New Product Listing</Title>
          <p>
            Fill in the details below to list your product in the marketplace
          </p>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <Subtitle>Basic Information</Subtitle>
            <FormGroup>
              <Label>Product Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </FormGroup>
          </Card>

          <Card>
            <Subtitle>Product Details</Subtitle>
            <FormGrid>
              <FormGroup>
                <Label>Size Type</Label>
                <Select
                  value={selectedSizeType}
                  onChange={(e) => setSelectedSizeType(e.target.value)}
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="shoes">Shoes</option>
                  <option value="dress">Dress</option>
                </Select>
              </FormGroup>

              {selectedSizeType === "shoes" && (
                <FormGroup>
                  <Label>Shoe Type</Label>
                  <Select
                    value={selectedShoeType}
                    onChange={(e) => setSelectedShoeType(e.target.value)}
                  >
                    <option value="men">Men&apos;s</option>
                    <option value="women">Women&apos;s</option>
                    <option value="kids">Kids&apos;</option>
                  </Select>
                </FormGroup>
              )}

              <FormGroup>
                <Label>Size</Label>
                <Select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Size</option>
                  {getSizeOptions().map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Condition</Label>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Brand</Label>
                <Input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Categories (comma separated)</Label>
                <Input
                  type="text"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Streetwear, Vintage, Casual"
                />
              </FormGroup>

              <FormGroup>
                <Label>Gender</Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Kids">Kids</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </FormGroup>
            </FormGrid>
          </Card>

          <Card>
            <Subtitle>Image and Pricing</Subtitle>
            <FormGroup>
              <Label>Image URL</Label>
              <Input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                placeholder="https://"
              />
            </FormGroup>

            <FormGrid>
              <FormGroup>
                <Label>Token Price (Thrifts)</Label>
                <Input
                  type="text"
                  name="tokenPrice"
                  value={formData.tokenPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </FormGroup>

              <FormGroup>
                <Label>ETH Price</Label>
                <Input
                  type="text"
                  name="ethPrice"
                  value={formData.ethPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </FormGroup>
            </FormGrid>
          </Card>

          <Card>
            <Subtitle>Exchange Options</Subtitle>
            <FormGroup>
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  name="isAvailableForExchange"
                  checked={formData.isAvailableForExchange}
                  onChange={handleChange}
                />
                <span>Available for Exchange</span>
              </CheckboxContainer>
            </FormGroup>

            {formData.isAvailableForExchange && (
              <FormGroup>
                <Label>Exchange Preferences</Label>
                <Textarea
                  name="exchangePreference"
                  value={formData.exchangePreference}
                  onChange={handleChange}
                  placeholder="Describe what you'd like to exchange for..."
                />
              </FormGroup>
            )}
          </Card>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Creating Product...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Create Product</span>
              </>
            )}
          </Button>
        </form>
      </MainContent>
    </PageContainer>
  );
}
