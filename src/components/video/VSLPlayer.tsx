"use client";

import { useEffect, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "vturb-smartplayer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function VSLPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject the VTurb script exactly inside the container 
    // to mimic the structure "script right after vturb-smartplayer"
    if (containerRef.current && !document.getElementById("vturb-player-js")) {
      const script = document.createElement("script");
      script.id = "vturb-player-js";
      script.src = "/js/player.js";
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <section className="relative flex flex-col gap-4 w-full">

      {/* Container que segura o Elemento VTurb e o Script nativo injetado pelo useEffect */}
      <div ref={containerRef}>
        <vturb-smartplayer
          id="vid-69dd5ac800f23bcc184f5800"
          style={{ display: "block", margin: "0 auto", width: "100%" }}
        />
      </div>
    </section>
  );
}
