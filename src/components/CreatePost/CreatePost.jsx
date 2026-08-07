import { useState } from "react";
import { FaImage } from "react-icons/fa";

function CreatePost({ addPost }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handlePost = () => {
  // Dono khaali hain to kuch mat karo
  if (!text.trim() && !image) return;

  addPost(text, image);

  setText("");
  setImage(null);
};

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="border-b border-gray-800 p-4">

      <div className="flex gap-4">

        <img
          src="https://i.pravatar.cc/150?img=10"
          className="w-12 h-12 rounded-full"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          className="flex-1 bg-black outline-none resize-none text-lg"
          rows="3"
        />

      </div>

      {image && (
        <img
          src={image}
          className="w-full mt-4 rounded-xl max-h-96 object-cover"
        />
      )}

      <div className="flex justify-between items-center mt-4">

        <label className="cursor-pointer">
          <FaImage className="text-blue-500 text-2xl" />

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImage}
          />
        </label>

        <button
          onClick={handlePost}
          className="bg-blue-500 px-6 py-2 rounded-full"
        >
          Post
        </button>

      </div>

    </div>
  );
}

export default CreatePost;