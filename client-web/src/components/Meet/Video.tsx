import { useEffect, useRef } from "react";

export const Video = ({ stream, isSound }: any) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      style={{
        width: 240,
        height: 240,
        margin: 5,
        backgroundColor: "black",
        display: isSound ? "none" : "inline-block",
      }}
      ref={ref}
      autoPlay
    />
  );
};
