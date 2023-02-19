import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import { Video } from "../../components/Test/Video/Video";

export const Test = () => {
  const [roomId, setRoomId] = useState<string>("zzz");
  const [peerName, setPeerName] = useState<string>("1");
  const [userStream, setUserStream] = useState<Array<any>>([]);

  // Ref붙은거는 그냥 const로 선언한거랑 똑같다 생각하면 됨. 근데 값에 접근할 때 .current를 붙여줘야 함.
  const socketRef = useRef<any>();
  const rtpCapabilitiesRef = useRef<any>();
  const deviceRef = useRef<any>();
  const producerTransportRef = useRef<any>();
  const producerRef = useRef<any>();
  const consumerTransportRef = useRef<any>();
  const consumerRef = useRef<any>();
  const localScreenStreamRef = useRef<any>();
  const localWebcamStreamRef = useRef<any>();
  const localScreenVideoRef = useRef<any>();
  const localWebcamVideoRef = useRef<any>();

  const peer_info = {
    peer_name: peerName,
    peer_id: "123",
    room_id: roomId,
    peer_audio: true,
    peer_video: true,
    peer_screen: false,
    peer_hand: false,
  };

  // useEffect()는 첫 렌더링 후 1회 실행 됨.
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("newProducers", (data: any) => {
      console.log("newProducer", data);
      producerRef.current = data[0].producer_id;

      consume(producerRef.current);
      console.log("producerRef", producerRef.current);
    });
  });

  const handleNameChange = (e: any) => {
    setPeerName(e.target.value);
  };
  const handleRoomChange = (e: any) => {
    setRoomId(e.target.value);
  };

  const handleWebcamVideo = async () => {
    localWebcamStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    localWebcamVideoRef.current.srcObject = localWebcamStreamRef.current;

    produce(localWebcamStreamRef);
  };

  const handleScreenVideo = async () => {
    localScreenStreamRef.current = await navigator.mediaDevices.getDisplayMedia(
      {
        video: true,
        audio: true,
      }
    );

    localScreenVideoRef.current.srcObject = localScreenStreamRef.current;

    produce(localScreenStreamRef);
  };

  const handleJoin = async () => {
    await socketRef.current.emit(
      "createRoom",
      { room_id: roomId },
      (response: any) => {
        console.log("방 생성 완료", response);
      }
    );

    await socketRef.current.emit("join", { peer_info }, (response: any) => {
      console.log("방 참가 완료", response);
    });

    await socketRef.current.emit(
      "getRouterRtpCapabilities",
      {},
      (response: any) => {
        rtpCapabilitiesRef.current = response;

        deviceRef.current = new Device();
        deviceRef.current.load({
          routerRtpCapabilities: rtpCapabilitiesRef.current,
        });
        console.log("create device", deviceRef.current);
      }
    );
  };

  const produce = async (stream: any) => {
    // producer transport 생성
    await socketRef.current.emit(
      "createWebRtcTransport",
      {},
      async (response: any) => {
        console.log("producer transport 생성", response);

        producerTransportRef.current =
          await deviceRef.current.createSendTransport(response);

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
                console.log("producer transport onConnect", response);
              }
            );

            callback();
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
                console.log("producer transport onProduce", response);
                producerRef.current = response.producer_id;
              }
            );

            callback({ response });
          }
        );

        const videoTrack = await stream.current.getVideoTracks()[0];

        new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });

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

        console.log("produce", producer);
      }
    );
  };

  const consume = async (producerId: any) => {
    await socketRef.current.emit(
      "createWebRtcTransport",
      {},
      async (response: any) => {
        console.log("consumer transport 생성", response);

        consumerTransportRef.current =
          await deviceRef.current.createRecvTransport(response);

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
                console.log("consumer transport onConnect", response);
                callback();
              }
            );
          }
        );

        new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });

        await socketRef.current.emit(
          "consume",
          {
            consumerTransportId: consumerTransportRef.current.id,
            producerId: producerId,
            rtpCapabilities: deviceRef.current.rtpCapabilities,
          },
          async (response: any) => {
            const { producerId, id, kind, rtpParameters } = response;

            consumerRef.current = await consumerTransportRef.current.consume({
              id,
              producerId,
              kind,
              rtpParameters,
            });

            console.log("consumer", consumerRef.current);

            const mediaStream = new MediaStream([consumerRef.current.track]);

            setUserStream([...userStream, mediaStream]);
          }
        );
      }
    );
  };

  const producerList = async () => {
    await socketRef.current.emit("getProducers", {}, (response: any) => {
      console.log("producerList", response);
    });
  };

  return (
    <>
      이름:{" "}
      <input
        type="text"
        onChange={handleNameChange}
        placeholder="name"
        value={peerName}
      />
      <br />
      방id:{" "}
      <input
        type="text"
        onChange={handleRoomChange}
        placeholder="room"
        value={roomId}
      />
      <br />
      <button onClick={handleJoin}>Join Room & rtp & device</button>
      <br />
      <button onClick={handleWebcamVideo}>produce Webcam</button>
      <button onClick={handleScreenVideo}>produce Screen</button>
      <br />
      <button onClick={consume} disabled>
        Create Recv Transport
      </button>
      <br />
      <button onClick={producerList}>Get Producer List</button>
      <br />
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={localWebcamVideoRef}
        muted
        autoPlay
      ></video>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={localScreenVideoRef}
        muted
        autoPlay
      ></video>
      <br />
      {userStream.map((video: any, index: number) => {
        return <Video key={index} stream={video}></Video>;
      })}
    </>
  );
};
