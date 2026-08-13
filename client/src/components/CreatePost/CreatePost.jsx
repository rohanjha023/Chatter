// src/components/CreatePost/CreatePost.jsx
// This file was MISSING from the uploaded project — Feed.jsx already
// imported it, but it didn't exist, so the app couldn't even compile.
// Built fresh here: text + up to 4 images, posts via multipart/form-data
// to POST /api/posts (see server/controllers/postController.js).
import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // object URLs for preview
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - images.length);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) return;
    setPosting(true);
    try {
      // FormData is required because we're sending files, not just JSON.
      const formData = new FormData();
      formData.append("content", text);
      images.forEach((file) => formData.append("images", file));

      await onPostCreated(formData);

      setText("");
      setImages([]);
      setPreviews([]);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="border-b border-app p-4">
      <div className="flex gap-3">
        <img
          src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.username}`}
          alt={user?.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            rows={2}
            className="w-full bg-transparent outline-none resize-none text-lg placeholder-gray-500"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  <img src={src} alt="" className="w-full h-40 object-cover rounded-xl border border-app" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 4}
              className="text-blue-400 hover:text-blue-500 disabled:opacity-40"
              title="Add image"
            >
              🖼️ Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileSelect}
            />

            <button
              onClick={handleSubmit}
              disabled={posting || (!text.trim() && images.length === 0)}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-5 py-2 rounded-full font-semibold"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
