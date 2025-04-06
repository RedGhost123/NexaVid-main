import { useState } from "react";
import { fetchPreview } from "../../utils/api";// Adjust the import path as needed

const PreviewGeneratorComponent = () => {
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    const result = await fetchPreview(text);
    if (result.error) {
      setError(result.error);
    } else {
      setVideoUrl(result.videoUrl);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to generate video"
      />
      <button onClick={handleGeneratePreview}>Generate Preview</button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {videoUrl && (
        <div>
          <video width="500" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default PreviewGeneratorComponent;
