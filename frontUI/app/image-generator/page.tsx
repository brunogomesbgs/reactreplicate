import { ImageGeneratorForm } from "@/components/ImageGeneratorForm";
import { title } from "@/components/primitives";

export default function ImageGeneratorPage() {
  return (
    <div>
      <h1 className={title()}>Image Generator</h1>
      <ImageGeneratorForm />
    </div>
  );
}
