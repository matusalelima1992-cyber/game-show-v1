export default function QuestionDisplay(props) {

  const { question, timer } = props;

  return (

    <div
      className="
      bg-[#111827]
      border-2
      border-yellow-400
      rounded-2xl
      p-8
      shadow-2xl
      "
    >

      <div
        className="
        text-6xl
        font-bold
        text-yellow-400
        mb-6
        text-center
        "
      >
        ⏱ {timer}
      </div>

      <h1 className="text-5xl font-extrabold text-center mb-10">
        {question.title}
      </h1>

      <div className="space-y-4">

        {question.options.map((option, index) => (

          <button
            key={index}
            className="
            w-full
            p-5
            rounded-2xl
            text-2xl
            font-bold
            "
            style={{
              background:
                index === 0 ? "#2563EB" :
                index === 1 ? "#9333EA" :
                index === 2 ? "#16A34A" :
                "#F97316"
            }}
          >
            {option}
          </button>

        ))}

      </div>

    </div>

  );

}