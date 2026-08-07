function Explore() {
  const trends = [
    "#React",
    "#NodeJS",
    "#MongoDB",
    "#SocketIO",
    "#JavaScript",
    "#TailwindCSS",
    "#MERN",
    "#OpenAI",
  ];

  return (
    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-8">
        Explore
      </h1>

      <div className="grid grid-cols-2 gap-5">

        {trends.map((trend, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 cursor-pointer"
          >
            <h2 className="text-xl font-bold">
              {trend}
            </h2>

            <p className="text-gray-400 mt-2">
              {Math.floor(Math.random()*100)}K Posts
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Explore;