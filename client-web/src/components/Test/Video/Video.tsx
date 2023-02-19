import { useEffect, useRef } from "react";

export const Video = ({ stream }: any) => {
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
      }}
      ref={ref}
      autoPlay
    />
  );
};
