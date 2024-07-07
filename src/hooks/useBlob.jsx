// import { useEffect, useMemo, useState } from "react";
// import { BlobSetting, Titles } from "../utils/blobSetting";
// import useWheel from "./useWheel";

// const useBlob = () => {
//   const { prevPage, nextPage, setNextPage, setPrevPage } = useWheel();
//   const [current, setCurrent] = useState(0);
//   const [change, setChange] = useState(true);

//   // const length = Titles.length;
//   // const rest = useMemo(
//   //   () => BlobSetting[Titles[current]],
//   //   [nextPage, prevPage, current]
//   // );
//   const pageToFalse = () =>
//     !change && (setNextPage(false), setPrevPage(false), setChange(true));

//   const clickHandler = (num) => {
//     if (current == 0) {
//       setCurrent(length - 1);
//       return;
//     }
//     if (current == length - 1) {
//       setCurrent(0);
//       return;
//     }
//     setCurrent((current + num) % length);
//   };

//   useEffect(() => {
//     if (nextPage) {
//       clickHandler(-1);
//       return;
//     }
//     if (prevPage) {
//       clickHandler(1);
//       return;
//     }
//     console.log("test");
//   }, [nextPage, prevPage]);

//   pageToFalse();

//   return { setChange, ...rest };
// };

// export default useBlob;
