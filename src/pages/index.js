"use client";
import { useEffect, useState } from "react";
import SphereCanvas from "../components/SphereCanvas";
import useUsefulHooks from "../hooks/useWheel";
import { pages } from "../mixerblob/Text/data";

const Home = () => {
  const [current, setCurrent] = useState(7);
  const { prevPage, nextPage, lastAction } = useUsefulHooks();

  useEffect(() => {
    if (lastAction) {
      if (lastAction === "next") {
        if (current === pages.length - 1) {
          setCurrent(0);
        } else {
          setCurrent(current + 1);
        }
        console.log("next");
      }
      if (lastAction === "prev") {
        if (current === 0) {
          setCurrent(pages.length - 1);
        } else {
          setCurrent(current - 1);
        }
        console.log("prev");
      }
    }
  }, [prevPage, nextPage]);
  return (
    <main className="w-full h-screen relative ">
      <SphereCanvas current={current} setCurrent={setCurrent} />
    </main>
  );
};

export default Home;
