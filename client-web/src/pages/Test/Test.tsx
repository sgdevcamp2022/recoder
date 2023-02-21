import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import { Video } from "../../components/Test/Video/Video";

export const Test = () => {
  const [roomId, setRoomId] = useState<string>("zzz");
  const [peerName, setPeerName] = useState<string>(
    (Math.floor(Math.random() * 10000) + 1).toString()
  );
  const [userStream, setUserStream] = useState<Array<any>>([]);
  const [isWebcamOn, setIsWebcamOn] = useState<boolean>(false);
  const [isScreenOn, setIsScreenOn] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);

  // Ref붙은거는 그냥 const로 선언한거랑 똑같다 생각하면 됨. 근데 값에 접근할 때 .current를 붙여줘야 함.
  const socketRef = useRef<any>();
  const rtpCapabilitiesRef = useRef<any>();
  const deviceRef = useRef<any>();

  const sendTransportRef = useRef<any>();
  const recvTransportRef = useRef<any>();

  const producerMapRef = useRef<Map<any, any>>(
    new Map([
      ["webcam", undefined],
      ["screen", undefined],
      ["audio", undefined],
    ])
  );

  // 이거 잘 생각해야댐..
  const consumerMapRef = useRef<Map<any, any>>(new Map());

  const localScreenStreamRef = useRef<any>();
  const localWebcamStreamRef = useRef<any>();
  const localScreenVideoRef = useRef<any>();
  const localWebcamVideoRef = useRef<any>();

  const peer_info = {
    peer_name: peerName,
    peer_id: peerName,
    room_id: roomId,
    peer_audio: false,
    peer_video: false,
    peer_screen: false,
    peer_hand: false,
  };

  const joinRoom = async () => {
    await new Promise(async (resolve) => {
      await socketRef.current.emit(
        "createRoom",
        { room_id: roomId },
        async (response: any) => {
          const isHost = response?.room_id;

          await socketRef.current.emit(
            "join",
            { peer_info },
            (response: any) => {
              console.log("방 참가 인원", response);

              for (let peer of response.peers) {
                console.log("socket id", peer.id);
                console.log("peer info", peer.peer_info);
                console.log("producers", peer.producers);
              }
            }
          );

          if (isHost) {
            await socketRef.current.emit("setHost", (response: any) => {
              console.log("방장 설정 완료", response);
            });
          }

          resolve("");
        }
      );
    });

    await socketRef.current.emit(
      "getRouterRtpCapabilities",
      {},
      async (response: any) => {
        rtpCapabilitiesRef.current = response;

        deviceRef.current = new Device();
        deviceRef.current.load({
          routerRtpCapabilities: rtpCapabilitiesRef.current,
        });

        await createMySendTransport();
        await createMyRecvTransport();

        await socketRef.current.emit("getProducers");
      }
    );
  };

  const exitRoom = async () => {
    socketRef.current.emit("exitRoom", {}, (response: any) => {
      console.log("방 나가기 완료", response);
    });
  };

  const handleNameChange = (e: any) => {
    setPeerName(e.target.value);
  };

  const handleRoomChange = (e: any) => {
    setRoomId(e.target.value);
  };

  const updateMyInfo = () => {
    console.log("updateMyInfo");
    // socketRef.current.emit("updateMyInfo", { peer_info });
  };

  const handleWebcamVideo = async () => {
    if (!isWebcamOn) {
      localWebcamStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      localWebcamVideoRef.current.srcObject = localWebcamStreamRef.current;

      await produce(localWebcamStreamRef.current, "webcam");

      updateMyInfo();
      setIsWebcamOn(true);
    } else {
      socketRef.current.emit("closeProducer", { peer_info });

      updateMyInfo();
      setIsWebcamOn(false);
    }
  };

  const handleScreenVideo = async () => {
    if (!isScreenOn) {
      localScreenStreamRef.current =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

      localScreenVideoRef.current.srcObject = localScreenStreamRef.current;

      await produce(localScreenStreamRef.current, "screen");

      updateMyInfo();
      setIsScreenOn(true);
    } else {
      socketRef.current.emit("producerClosed", { peer_info });
      producerMapRef.current.get("screen").close();
      producerMapRef.current.set("screen", undefined);

      updateMyInfo();
      setIsScreenOn(false);
    }
  };

  const handleAudio = async () => {
    if (!isAudioOn) {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      await produce(audioStream, "audio");

      updateMyInfo();
      setIsAudioOn(true);
    } else {
      updateMyInfo();
      setIsAudioOn(false);
    }
  };

  const createMySendTransport = async () => {
    return new Promise(async (resolve) => {
      await socketRef.current.emit(
        "createWebRtcTransport",
        {},
        async (response: any) => {
          console.log("send transport ID -", response.id);

          sendTransportRef.current =
            await deviceRef.current.createSendTransport(response);

          resolve("");

          sendTransportRef.current.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
              await socketRef.current.emit(
                "connectTransport",
                {
                  transport_id: sendTransportRef.current.id,
                  dtlsParameters: dtlsParameters,
                },
                (response: any) => {
                  callback();
                }
              );
            }
          );

          sendTransportRef.current.on(
            "produce",
            async (
              { kind, rtpParameters, appData }: any,
              callback: any,
              errback: any
            ) => {
              await socketRef.current.emit(
                "produce",
                {
                  producerTransportId: sendTransportRef.current.id,
                  kind: kind,
                  appData: appData,
                  rtpParameters: rtpParameters,
                },
                (response: any) => {
                  console.log("producer id", response);
                }
              );

              callback({ response });
            }
          );
        }
      );
    });
  };

  const createMyRecvTransport = async () => {
    return new Promise(async (resolve) => {
      await socketRef.current.emit(
        "createWebRtcTransport",
        {},
        async (response: any) => {
          console.log("receive transport id -", response.id);

          recvTransportRef.current =
            await deviceRef.current.createRecvTransport(response);

          resolve("");

          recvTransportRef.current.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
              await socketRef.current.emit(
                "connectTransport",
                {
                  transport_id: recvTransportRef.current.id,
                  dtlsParameters: dtlsParameters,
                },
                (response: any) => {
                  callback();
                }
              );
            }
          );
        }
      );
    });
  };

  const produce = async (stream: any, type: string) => {
    const videoTrack = await stream.getVideoTracks();
    const audioTrack = await stream.getAudioTracks();
    let producer;

    if (videoTrack.length !== 0) {
      producer = await sendTransportRef.current.produce({
        appData: { mediaType: "videoType" },
        track: videoTrack[0],
        encodings: [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      });
    }

    if (audioTrack.length !== 0) {
      producer = await sendTransportRef.current.produce({
        appData: { mediaType: "audioType" },
        track: audioTrack[0],
      });
    }

    producerMapRef.current.set(type, producer);
  };

  const consume = async (producerId: any) => {
    await socketRef.current.emit(
      "consume",
      {
        consumerTransportId: recvTransportRef.current.id,
        producerId: producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
      },
      async (response: any) => {
        const { producerId, id, kind, rtpParameters } = response;

        const myConsumer = await recvTransportRef.current.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        });

        console.log("consumer id", myConsumer.id);
        console.log("consumer", myConsumer);

        const mediaStream = new MediaStream([myConsumer.track]);
        setUserStream((userStream): any => [...userStream, mediaStream]);

        consumerMapRef.current.set("consumer", myConsumer);
      }
    );
  };

  const producerList = async () => {
    await socketRef.current.emit("getProducers");
  };

  // useEffect()는 첫 렌더링 후 1회 실행 됨.
  useEffect(() => {
    async function myConsume(id: any) {
      await consume(id);
    }

    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("newProducers", async (data: any) => {
      console.log("newProducer", data);

      for (const producer of data) {
        await myConsume(producer.producer_id);
      }
    });

    socketRef.current.on("removeMe", async (data: any) => {
      console.log("removeMe", data);
    });

    socketRef.current.on("updatePeerInfo", async (data: any) => {
      console.log("updatePeerInfo", data);
    });
  }, []);

  return (
    <>
      이름:{" "}
      <input
        type="text"
        onChange={handleNameChange}
        placeholder="name"
        value={peerName}
      />
      방id:{" "}
      <input
        type="text"
        onChange={handleRoomChange}
        placeholder="room"
        value={roomId}
      />
      <br />
      <button onClick={joinRoom}>방 입장</button>
      <button onClick={exitRoom}>방 나가기</button>
      <br />
      <button onClick={handleWebcamVideo}>
        웹캠 공유 {isWebcamOn ? "종료하기" : "시작하기"}
      </button>
      <button onClick={handleScreenVideo}>
        화면 공유 {isScreenOn ? "종료하기" : "시작하기"}
      </button>
      <button onClick={handleAudio} value="video">
        소리 공유 {isAudioOn ? "종료하기" : "시작하기"}
      </button>
      <br />
      <br />
      유저 목록
      <br />
      <br />
      부가 기능
      <br />
      <button onClick={producerList}>emit getProducers</button>
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
      <br />
      {userStream.map((video: any, index: number) => {
        return <div key={index}>{video.id}</div>;
      })}
    </>
  );
};
