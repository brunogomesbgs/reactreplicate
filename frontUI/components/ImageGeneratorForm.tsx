"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

export const ImageGeneratorForm = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl("");

    try {
      const response = await fetch("http://localhost:4000/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.")
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          type="text"
          label="Image Prompt"
          placeholder="Enter a description for your image"
          value={prompt}
          onValueChange={setPrompt}
          fullWidth
        />
        <Button type="submit" color="primary" disabled={loading} isLoading={loading}>
          {loading ? "Generating..." : "Generate Image"}
        </Button>
      </form>

      {error && <div className="mt-4 text-red-500">{error}</div>}

      <div className="mt-8 w-full flex justify-center">
        {imageUrl && (
          <div className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">Generated Image:</h3>
            <img src={imageUrl} alt="Generated" className="w-full h-auto rounded-lg shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
};
