import { useGetLinkQuery } from "../../redux/apis/linkAPI";
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";

export const Test = () => {
  const { data, isFetching, isLoading } = useGetLinkQuery({});

  // Ref붙은거는 그냥 const로 선언한거랑 똑같다 생각하면 됨. 근데 값에 접근할 때 .current를 붙여줘야 함.
  const socketRef = useRef<any>();
  const deviceRef = useRef<any>();
  const producerTransportRef = useRef<any>();
  const consumerTransportRef = useRef<any>();
  const localStreamRef = useRef<any>();
  const localVideoRef = useRef<any>();

  const peer_info = {
    peer_name: "test",
    peer_id: "123",
    room_id: "123abcdswef",
    peer_audio: true,
    peer_video: true,
    peer_screen: false,
    peer_hand: false,
  };

  const peer_info_2 = {
    peer_name: "test2",
    peer_id: "1234",
    room_id: "123abcdswef",
    peer_audio: true,
    peer_video: true,
    peer_screen: false,
    peer_hand: false,
  };

  // useEffect()는 첫 렌더링 후 1회 실행 됨.
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  });

  // 방생성 버튼 누르면 동작
  const handleCreateClick = async () => {
    await socketRef.current.emit(
      "createRoom",
      { room_id: "123abcdswef" },
      (response: any) => {
        console.log("response", response);
        console.log(socketRef.current);
      }
    );

    await socketRef.current.emit("join", { peer_info }, (response: any) => {
      console.log("response", response);
    });

    // 서버 생각할 시간 1초 기다리기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await socketRef.current.emit(
      "getRouterRtpCapabilities",
      {},
      (response: any) => {
        deviceRef.current = new Device();
        deviceRef.current.load({ routerRtpCapabilities: response });
        console.log("deviceRef.current", deviceRef.current);
      }
    );

    // producer transport 생성
    await socketRef.current.emit(
      "createWebRtcTransport",
      {},
      (response: any) => {
        producerTransportRef.current =
          deviceRef.current.createSendTransport(response);

        producerTransportRef.current.on(
          "connect",
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            await socketRef.current.emit(
              "connectTransport",
              {
                transport_id: producerTransportRef.current.id,
                dtlsParameters: dtlsParameters,
              },
              (response: any) => {
                callback();
              }
            );
          }
        );

        producerTransportRef.current.on(
          "produce",
          async (
            { kind, rtpParameters, appData }: any,
            callback: any,
            errback: any
          ) => {
            await socketRef.current.emit(
              "produce",
              {
                producerTransportId: producerTransportRef.current.id,
                kind: kind,
                appData: appData,
                rtpParameters: rtpParameters,
              },
              (response: any) => {
                console.log("producer transport 생성 완료");
                callback({ id: response.id });
              }
            );
          }
        );
      }
    );

    // consumer transport 생성
    await socketRef.current.emit(
      "createWebRtcTransport",
      {},
      (response: any) => {
        consumerTransportRef.current =
          deviceRef.current.createRecvTransport(response);

        consumerTransportRef.current.on(
          "connect",
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            await socketRef.current.emit(
              "connectTransport",
              {
                transport_id: consumerTransportRef.current.id,
                dtlsParameters: dtlsParameters,
              },
              (response: any) => {
                console.log("consumer transport 생성 완료");
                callback();
              }
            );
          }
        );
      }
    );

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    localVideoRef.current.srcObject = localStreamRef.current;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    const producer = await producerTransportRef.current.produce({
      track: videoTrack,
      encodings: [
        { maxBitrate: 100000 },
        { maxBitrate: 300000 },
        { maxBitrate: 900000 },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
    });

    console.log("producer", producer);
  };

  // 참가 버튼 누르면 동작
  const handleJoinClick = async () => {
    socketRef.current.room_id = "123abcdswef";

    await socketRef.current.emit("join", { peer_info_2 }, (response: any) => {
      console.log("response", response);
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await socketRef.current.emit(
      "getRouterRtpCapabilities",
      {},
      (response: any) => {
        deviceRef.current = new Device();
        deviceRef.current.load({ routerRtpCapabilities: response });
        console.log("deviceRef.current", deviceRef.current);
      }
    );

    // producer transport 생성
    await socketRef.current.emit(
      "createWebRtcTransport",
      {},
      (response: any) => {
        producerTransportRef.current =
          deviceRef.current.createSendTransport(response);

        producerTransportRef.current.on(
          "connect",
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            await socketRef.current.emit(
              "connectTransport",
              {
                transport_id: producerTransportRef.current.id,
                dtlsParameters: dtlsParameters,
              },
              (response: any) => {
                callback();
              }
            );
          }
        );

        producerTransportRef.current.on(
          "produce",
          async (
            { kind, rtpParameters, appData }: any,
            callback: any,
            errback: any
          ) => {
            await socketRef.current.emit(
              "produce",
              {
                producerTransportId: producerTransportRef.current.id,
                kind: kind,
                appData: appData,
                rtpParameters: rtpParameters,
              },
              (response: any) => {
                console.log("producer transport 생성 완료");
                callback({ id: response.id });
              }
            );
          }
        );
      }
    );

    // consumer transport 생성
    await socketRef.current.emit(
      "createWebRtcTransport",
      {},
      (response: any) => {
        consumerTransportRef.current =
          deviceRef.current.createRecvTransport(response);

        consumerTransportRef.current.on(
          "connect",
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            await socketRef.current.emit(
              "connectTransport",
              {
                transport_id: consumerTransportRef.current.id,
                dtlsParameters: dtlsParameters,
              },
              (response: any) => {
                console.log("consumer transport 생성 완료");
                callback();
              }
            );
          }
        );
      }
    );

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    localVideoRef.current.srcObject = localStreamRef.current;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    const producer = await producerTransportRef.current.produce({
      track: videoTrack,
      encodings: [
        { maxBitrate: 100000 },
        { maxBitrate: 300000 },
        { maxBitrate: 900000 },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
    });

    console.log("producer", producer);
  };

  return (
    <>
      <button onClick={handleCreateClick}>방 생성</button>
      <button onClick={handleJoinClick}>방 참가</button>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        muted
        ref={localVideoRef}
        autoPlay
      ></video>
    </>
  );
};
