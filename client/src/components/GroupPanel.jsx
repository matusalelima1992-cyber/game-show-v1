export default function GroupPanel({
  title,
  votes
}) {

  return (

    <div
      className="
      bg-[#111827]
      rounded-2xl
      p-5
      border-2
      border-gray-700
      h-[700px]
      overflow-y-auto
      "
    >

      <h2 className="text-3xl font-bold text-center mb-6">
        {title}
      </h2>

      <div className="mb-6">

        <div className="text-yellow-400 text-xl font-bold">
          ⚡ Mais rápido:
        </div>

        {votes[0] ? (

          <div className="mt-2 text-lg">
            {votes[0].name}
            {" - "}
            {votes[0].option}
          </div>

        ) : (

          <div className="text-gray-400 mt-2">
            Nenhum voto ainda
          </div>

        )}

      </div>

      <div className="space-y-3">

        {votes.map((vote, index) => (

          <div
            key={index}
            className="
            bg-[#1F2937]
            p-4
            rounded-xl
            flex
            justify-between
            "
          >

            <span>
              {index + 1}º {vote.name}
            </span>

            <span className="font-bold">
              {vote.option}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}
