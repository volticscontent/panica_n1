import Image from "next/image";

type CommentType = {
  id: number;
  name: string;
  text: string;
  time: string;
  likes: number;
  avatar: string;
};

const MOCK_COMMENTS: CommentType[] = [
  {
    id: 1,
    name: "Renate Hoffmann",
    text: 'Leute, nach nur 10 Tagen mit dem Hafer-Ritual liegt mein Nüchternzucker zum ersten Mal seit Jahren unter 120! Ich musste dreimal auf das Messgerät schauen, weil ich es nicht glauben konnte!"',
    time: "53 min",
    likes: 28,
    avatar: "/images/woman_1.webp",
  },
  {
    id: 2,
    name: "Gertrud Weber",
    text: "Ich mache das Hafer-Ritual jetzt seit gut vier Wochen – und bei meiner letzten Blutabnahme war mein Hausarzt ehrlich überrascht. Er hat gesagt, so gute Werte hätte ich seit Langem nicht mehr gehabt. Und das Beste: Ich habe endlich wieder Energie für meine Enkel. Danke, dass ihr das so einfach erklärt!",
    time: "47 min",
    likes: 41,
    avatar: "/images/woman_2.webp",
  },
  {
    id: 3,
    name: "Klaus Meier",
    text: "Früher bin ich nach dem Mittagessen immer in ein totales Tief gefallen – müde, benebelt, keine Kraft mehr. Seit ich das Hafer-Ritual mache, ist das komplett weg. Ich schlafe nachts wieder durch und fühle mich morgens zum ersten Mal seit Jahren richtig wach. Mit 71 hätte ich das nicht mehr erwartet.",
    time: "47 min",
    likes: 35,
    avatar: "/images/man1.webp",
  },
  {
    id: 4,
    name: "Monika Krause",
    text: "Gertrud, das klingt ja großartig! Machst du das Ritual morgens oder abends? Ich möchte heute damit anfangen und will nichts falsch machen.",
    time: "42 min",
    likes: 18,
    avatar: "/images/man2.webp",
  },
  {
    id: 5,
    name: "Brigitte Lang",
    text: "Endlich erklärt das mal jemand so, dass man es auch versteht – ohne dieses ganze Fachchinesisch. Ich habe die Zutaten schon zu Hause und fange Morgen früh direkt an. Danke!",
    time: "24 min",
    likes: 31,
    avatar: "/images/woman_5.webp",
  },
];

export default function ProofComments() {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-4 mx-auto mt-10 mb-10">
      <section className="flex flex-col gap-6 bg-white rounded-3xl border border-black/10 shadow-sm p-4 md:p-6">
        <div className="text-base md:text-lg font-semibold text-neutral-900">
          Es werden 6 von 6.567 Kommentaren angezeigt
        </div>

        <div className="flex flex-col gap-6">
          {MOCK_COMMENTS.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-1">
              <article className="flex items-start gap-4">
                {/* Fallback caso falte a imagem */}
                <div className="w-10 h-10 shrink-0 bg-gray-300 rounded-full overflow-hidden relative">
                    <img src={comment.avatar} alt={comment.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col gap-2 rounded-2xl bg-neutral-100 border border-black/5 px-4 py-3">
                    <div className="font-semibold text-sky-700">{comment.name}</div>
                    <div className="text-[15px] leading-relaxed text-neutral-900">
                      {comment.text}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 pl-2">
                    <span>Genießen</span>
                    <span>·</span>
                    <span>Kommentar</span>
                    <span>·</span>
                    <span>{comment.time}</span>
                  </div>
                </div>
              </article>
              <div className="flex justify-end items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-black/10 shadow-sm">
                  <span className="flex -space-x-1">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">👍</span>
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center">❤</span>
                  </span>
                  <span className="text-xs text-neutral-700">{comment.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex justify-between items-center w-full px-4">
        <a href="privacy-policy.html">
          <p className="text-gray-500 text-sm hover:underline">Privacy Policy</p>
        </a>
        <a href="terms.html">
          <p className="text-gray-500 text-sm hover:underline">Terms of Service</p>
        </a>
      </section>
    </div>
  );
}
