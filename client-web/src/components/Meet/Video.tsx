import { useEffect, useRef } from "react";
import styled from "styled-components";

const VideoBox = styled.div`
  background-color: #3c4043;
  border-radius: 8px;
  margin: 16px 16px 0 16px;
  width: ${(props: { width: number; height: number; isSound: boolean }) =>
    props.width}px;
  height: ${(props: { width: number; height: number; isSound: boolean }) =>
    props.height}px;
  display: ${(props: { isSound: boolean }) =>
    props.isSound ? "none" : "block"};
  box-sizing: border-box;
  position: relative;
`;

const NameBox = styled.div`
  position: absolute;
  bottom: -0.5px;
  padding: 12px 0 12px 16px;
  line-height: 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgb(0 0 0 / 60%), 0 0 2px rgb(0 0 0 / 30%);
`;

const MuteBox = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: rgba(32, 33, 36, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HandBox = styled.div`
  position: absolute;
  bottom: -0.5px;
  margin: 0 0 10px 12px;
  padding: 5px 8px;
  background-color: white;
  display: flex;
  align-items: center;
  border-radius: 12px;
  font-size: 12px;
`;

const MyVideo = styled.video`
  width: 100%;
  height: 100%;
  border-radius: 8px;
`;

export const Video = ({
  stream,
  isSound,
  width,
  height,
  isHand,
  isAudioOn,
  isScreen,
  name,
  isMe,
}: any) => {
  const ref = useRef<any>();

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <VideoBox width={width} height={height} isSound={isSound}>
      {!isScreen ? (
        isHand ? (
          <HandBox>
            <svg
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              enableBackground="new 0 0 24 24"
              focusable="false"
              height="14"
              viewBox="0 0 24 24"
              width="14"
              className="Hdh4hc cIGbvc NMm5M"
              style={{ marginRight: "4px" }}
            >
              <rect fill="none" height="24" width="24"></rect>
              <path
                d="M21,7c0-1.38-1.12-2.5-2.5-2.5c-0.17,0-0.34,0.02-0.5,0.05V4c0-1.38-1.12-2.5-2.5-2.5c-0.23,0-0.46,0.03-0.67,0.09 C14.46,0.66,13.56,0,12.5,0c-1.23,0-2.25,0.89-2.46,2.06C9.87,2.02,9.69,2,9.5,2C8.12,2,7,3.12,7,4.5v5.89 c-0.34-0.31-0.76-0.54-1.22-0.66L5.01,9.52c-0.83-0.23-1.7,0.09-2.19,0.83c-0.38,0.57-0.4,1.31-0.15,1.95l2.56,6.43 C6.49,21.91,9.57,24,13,24h0c4.42,0,8-3.58,8-8V7z M19,16c0,3.31-2.69,6-6,6h0c-2.61,0-4.95-1.59-5.91-4.01l-2.6-6.54l0.53,0.14 c0.46,0.12,0.83,0.46,1,0.9L7,15h2V4.5C9,4.22,9.22,4,9.5,4S10,4.22,10,4.5V12h2V2.5C12,2.22,12.22,2,12.5,2S13,2.22,13,2.5V12h2V4 c0-0.28,0.22-0.5,0.5-0.5S16,3.72,16,4v8h2V7c0-0.28,0.22-0.5,0.5-0.5S19,6.72,19,7L19,16z"
                fill="#202124"
              ></path>
            </svg>
            {isMe ? "나" : name}
          </HandBox>
        ) : (
          <NameBox>{isMe ? "나" : name}</NameBox>
        )
      ) : (
        <></>
      )}
      {isAudioOn || isScreen ? (
        <></>
      ) : (
        <MuteBox>
          <svg
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="#000000"
            className="Hdh4hc cIGbvc"
          >
            <path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none"></path>
            <path
              d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"
              fill="#FFFFFF"
            ></path>
          </svg>
        </MuteBox>
      )}
      <MyVideo ref={ref} autoPlay muted={isMe} />
    </VideoBox>
  );
};
