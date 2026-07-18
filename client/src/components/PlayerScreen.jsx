import { useState, useEffect } from "react";

import socket from "../socket";
import OfficialLogo from "./OfficialLogo";

export default function PlayerScreen() {

  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [voted, setVoted] = useState(false);

  const [question, setQuestion] = useState({
    title: "",
    options: []
  });
  const [timer, setTimer] = useState(20);

  const [questionVisible, setQuestionVisible] = useState(false);

  useEffect(() => {
socket.on("timerUpdate", (time) => {

  setTimer(time);

});
socket.on("questionUpdate", (data) => {

  setQuestion(data);

  setVoted(false);

});

socket.on("questionVisibility", (visible) => {

  setQuestionVisible(visible);

  if (visible) {
    setVoted(false);
  }

});

socket.on("timerUpdate", (time) => {

  setTimer(time);

});

    return () => {

      socket.off("questionUpdate");
      socket.off("questionVisibility");

    };

  }, []);

  function vote(option) {

    if (voted) return;

    if (!name || !group) {
      alert("Digite nome e escolha grupo");
      return;
    }

    setVoted(true);

   socket.emit("vote", {
  id: socket.id,
  name,
  group,
  option,
  time: Date.now()
});

  }

  return (

    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">

      <div className="bg-[#111827] p-8 rounded-2xl w-[400px]">

        {group && (

          <div className="text-center mb-6">

            <OfficialLogo compact className="mb-3 justify-center" />

            <div className="text-yellow-400 text-xl">
              ⏱ {timer}s
            </div>

          </div>

        )}

        {!group && (

          <h1 className="text-4xl font-bold text-center mb-8">
            ENTRAR
          </h1>

        )}

        <input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
          w-full
          p-4
          rounded-xl
          bg-[#1F2937]
          mb-4
          "
        />

        {!group ? (

          <div className="grid grid-cols-2 gap-4 mb-6">

            <button
              onClick={() => setGroup("HOMENS")}
              className="
              bg-blue-600
              p-4
              rounded-xl
              font-bold
              "
            >
              HOMENS
            </button>

            <button
              onClick={() => setGroup("MULHERES")}
              className="
              bg-pink-600
              p-4
              rounded-xl
              font-bold
              "
            >
              MULHERES
            </button>

          </div>

        ) : (

          <div
            className={`
              mb-6
              p-4
              rounded-xl
              text-center
              text-2xl
              font-bold
              ${group === "HOMENS"
                ? "bg-blue-600"
                : "bg-pink-600"}
            `}
          >
            GRUPO: {group}
          </div>

        )}

        {group && (

          questionVisible ? (

            <div className="space-y-4">

              <div className="text-2xl font-bold mb-5 text-center">
                {question.title}
              </div>

              {question.options.map((option, index) => (

                <button
                  key={index}
                  onClick={() => vote(option[0])}
                  className={`
                  w-full
                  p-4
                  rounded-xl
                  text-xl
                  font-bold
                  ${index === 0
                    ? "bg-blue-600"
                    : index === 1
                    ? "bg-purple-600"
                    : index === 2
                    ? "bg-green-600"
                    : "bg-orange-500"}
                  `}
                >
                  {option}
                </button>

              ))}

            </div>

          ) : (

            <div
              className="
              text-center
              text-3xl
              font-bold
              text-yellow-400
              mt-20
              "
            >
              AGUARDANDO PRÓXIMA RODADA...
            </div>

          )

        )}

        {voted && (

          <div className="mt-6 text-center text-green-400 font-bold">
            Voto enviado com sucesso!
          </div>

        )}

      </div>

    </div>

  );

}
