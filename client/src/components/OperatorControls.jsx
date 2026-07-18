import socket from "../socket";

export default function OperatorControls() {

  function nextQuestion() {

    socket.emit("nextQuestion");

  }

  function revealAnswer() {

    socket.emit("toggleScoreboard");

  }

  function showQuestion() {

    socket.emit("showQuestion");

  }

  return (

    <div
      className="
      flex
      justify-center
      gap-4
      flex-wrap
      "
    >

      <button
        onClick={showQuestion}
        className="
        bg-blue-600
        px-8
        py-4
        rounded-2xl
        text-xl
        font-bold
        "
      >
        MOSTRAR
      </button>

      <button
        onClick={revealAnswer}
        className="
        bg-purple-600
        px-8
        py-4
        rounded-2xl
        text-xl
        font-bold
        "
      >
        REVELAR
      </button>

      <button
        onClick={nextQuestion}
        className="
        bg-yellow-500
        text-black
        px-8
        py-4
        rounded-2xl
        text-xl
        font-bold
        "
      >
        PRÓXIMA
      </button>

    </div>

  );

}