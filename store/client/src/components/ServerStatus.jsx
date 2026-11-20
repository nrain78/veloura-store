import { useEffect, useState } from "react";
import api from "../api.js";

// Website khulte hi server ko jagane ke liye ping karta hai (free hosting par server soya hota hai).
// Der lage to customer ko batata hai ke intezar kyun hai.
export default function ServerStatus() {
  const [state, setState] = useState("checking"); // checking | waking | ok | degraded | down

  useEffect(() => {
    let done = false;
    const slow = setTimeout(() => {
      if (!done) setState("waking");
    }, 3500);

    api
      .get("/health", { timeout: 90000 })
      .then(() => {
        done = true;
        setState("ok");
      })
      .catch((err) => {
        done = true;
        if (!err.response) setState("down");
        else setState(err.response.status === 503 ? "degraded" : "ok");
      });

    return () => {
      done = true;
      clearTimeout(slow);
    };
  }, []);

  if (state === "waking") {
    return (
      <div className="status-banner" role="status">
        Warming up the store... this can take up to a minute the first time. You can keep browsing.
      </div>
    );
  }
  if (state === "degraded" || state === "down") {
    return (
      <div className="status-banner status-banner--down" role="status">
        We're having trouble reaching the store. You can keep browsing, but ordering is unavailable
        for the moment. Please try again shortly.
      </div>
    );
  }
  return null;
}
