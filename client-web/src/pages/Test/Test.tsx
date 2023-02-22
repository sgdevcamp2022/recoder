import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import { Video } from "../../components/Test/Video/Video";

export const Test = () => {
  const [roomId, setRoomId] = useState<string>("zzz");
  const [peerName, setPeerName] = useState<string>(
    (Math.floor(Math.random() * 10000) + 1).toString()
  );

  const [newUserStream, setNewUserStream] = useState<Map<any, any>>(new Map());

  const [isVideoOn, setIsVideoOn] = useState<boolean>(false);
  const [isScreenOn, setIsScreenOn] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [isHandOn, setIsHandOn] = useState<boolean>(false);

  const [isInRoom, setIsInRoom] = useState<boolean>(false);
  const [isBeforeVideo, setIsBeforeVideo] = useState<boolean>(false);
  const [isBeforeAudio, setIsBeforeAudio] = useState<boolean>(false);

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);

  const socketRef = useRef<any>();
  const rtpCapabilitiesRef = useRef<any>();
  const deviceRef = useRef<any>();

  const sendTransportRef = useRef<any>();
  const recvTransportRef = useRef<any>();

  const producerMapRef = useRef<Map<any, any>>(
    new Map([
      ["video", undefined],
      ["screen", undefined],
      ["audio", undefined],
    ])
  );

  const localScreenStreamRef = useRef<any>();
  const localWebcamStreamRef = useRef<any>();
  const localAudioStreamRef = useRef<any>();
  const localScreenVideoRef = useRef<any>();
  const localWebcamVideoRef = useRef<any>();

  const peerMapRef = useRef<Map<any, any>>(new Map());

  const peer_info = {
    peer_name: peerName,
    peer_id: "",
    room_id: roomId,
    peer_audio: isAudioOn,
    peer_video: isVideoOn,
    peer_screen: isScreenOn,
    peer_hand: isHandOn,
  };

  const beforeVideo = () => {
    setIsBeforeVideo(!isBeforeVideo);
  };

  const beforeAudio = () => {
    setIsBeforeAudio(!isBeforeAudio);
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
            JSON.stringify({
              peer_info: peer_info,
              room_id: roomId,
              id: socketRef.current.id,
            }),
            (response: any) => {
              console.log("방 참가 인원");
              for (let peer of response.peers) {
                if (peer.id === socketRef.current.id) continue;

                console.log(peer);

                const peer_info = peer.peer_info;

                peerMapRef.current.set(peer.id, {
                  peer_name: peer_info.peer_name,
                  video: peer_info.peer_video,
                  video_producer: undefined,
                  video_consumer: undefined,
                  screen: peer_info.peer_screen,
                  screen_producer: undefined,
                  screen_consumer: undefined,
                  audio: peer_info.peer_audio,
                  audio_producer: undefined,
                  audio_consumer: undefined,
                  hand: peer_info.peer_hand,
                });

                setNewUserStream((prev) => {
                  return new Map(prev).set(peer.id, {
                    peer_name: peer_info.peer_name,
                    video_stream: undefined,
                    screen_stream: undefined,
                    audio_stream: undefined,
                    hand: peer_info.peer_hand,
                  });
                });
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

    await new Promise(async (resolve) => {
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

          resolve("");
        }
      );
    });

    setIsInRoom(true);
    if (isBeforeAudio) {
      handleAudio();
    }
    if (isBeforeVideo) {
      handleWebcamVideo();
    }
  };

  const exitRoom = async () => {
    socketRef.current.emit("exitRoom", {}, (response: any) => {
      console.log("방 나가기 완료", response);
    });

    window.location.reload();
  };

  const handleNameChange = (e: any) => {
    setPeerName(e.target.value);
  };

  const handleRoomChange = (e: any) => {
    setRoomId(e.target.value);
  };

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  };

  const handleMessageKeyDown = (e: any) => {
    if (e.key === "Enter") {
      socketRef.current.emit("message", {
        to_peer_id: "all",
        peer_name: peerName,
        peer_msg: message,
      });

      setMessages([...messages, { peer_name: peerName, peer_msg: message }]);

      setMessage("");
    }
  };

  const updateMyInfo = (type: string, status: boolean) => {
    socketRef.current.emit("updatePeerInfo", {
      id: socketRef.current.id,
      peer_name: peerName,
      type: type,
      status: status,
    });
  };

  const handleWebcamVideo = async () => {
    if (!isVideoOn) {
      localWebcamStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      localWebcamVideoRef.current.srcObject = localWebcamStreamRef.current;

      await produce(localWebcamStreamRef.current, "video");

      updateMyInfo("video", true);
      setIsVideoOn(true);
    } else {
      socketRef.current.emit("producerClosed", {
        id: socketRef.current.id,
        producer_id: producerMapRef.current.get("video"),
        peer_name: peerName,
        type: "video",
        status: false,
      });

      localWebcamStreamRef.current.getVideoTracks()[0].stop();
      localWebcamVideoRef.current.srcObject = null;

      setIsVideoOn(false);
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

      updateMyInfo("screen", true);
      setIsScreenOn(true);
    } else {
      socketRef.current.emit("producerClosed", {
        id: socketRef.current.id,
        producer_id: producerMapRef.current.get("screen"),
        peer_name: peerName,
        type: "screen",
        status: false,
      });

      localScreenStreamRef.current.getVideoTracks()[0].stop();
      localScreenVideoRef.current.srcObject = null;

      setIsScreenOn(false);
    }
  };

  const handleAudio = async () => {
    if (!isAudioOn) {
      localAudioStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      await produce(localAudioStreamRef.current, "audio");

      updateMyInfo("audio", true);
      setIsAudioOn(true);
    } else {
      socketRef.current.emit("producerClosed", {
        id: socketRef.current.id,
        producer_id: producerMapRef.current.get("audio"),
        peer_name: peerName,
        type: "audio",
        status: false,
      });

      localAudioStreamRef.current.getAudioTracks()[0].stop();

      setIsAudioOn(false);
    }
  };

  const handleHand = () => {
    if (!isHandOn) {
      updateMyInfo("hand", true);
      setIsHandOn(true);
    } else {
      updateMyInfo("hand", false);
      setIsHandOn(false);
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
                  switch (appData.mediaType) {
                    case "video":
                      producerMapRef.current.set("video", response.producer_id);
                      break;
                    case "screen":
                      producerMapRef.current.set(
                        "screen",
                        response.producer_id
                      );
                      break;
                    case "audio":
                      producerMapRef.current.set("audio", response.producer_id);
                      break;
                  }
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

    if (videoTrack.length !== 0) {
      const producer = await sendTransportRef.current.produce({
        appData: { mediaType: type },
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
      await sendTransportRef.current.produce({
        appData: { mediaType: type },
        track: audioTrack[0],
      });
    }
  };

  const consume = async (peerId: any, type: string, producerId: any) => {
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

        const mediaStream = new MediaStream([myConsumer.track]);

        switch (type) {
          case "audio":
            peerMapRef.current.get(peerId).audio_consumer = myConsumer.id;
            setNewUserStream((prev) => {
              const newMap = new Map(prev);
              newMap.get(peerId).audio_stream = mediaStream;
              return newMap;
            });
            break;
          case "video":
            peerMapRef.current.get(peerId).video_consumer = myConsumer.id;
            setNewUserStream((prev) => {
              const newMap = new Map(prev);
              newMap.get(peerId).video_stream = mediaStream;
              return newMap;
            });
            break;
          case "screen":
            peerMapRef.current.get(peerId).screen_consumer = myConsumer.id;
            setNewUserStream((prev) => {
              const newMap = new Map(prev);
              newMap.get(peerId).screen_stream = mediaStream;
              return newMap;
            });
            break;
        }
      }
    );
  };

  // useEffect()는 첫 렌더링 후 1회 실행 됨.
  useEffect(() => {
    async function myConsume(peerId: any, type: string, id: any) {
      await consume(peerId, type, id);
    }

    socketRef.current = io("http://localhost:5000");
    peer_info.peer_id = socketRef.current.id;

    socketRef.current.on("newMemberJoined", async (data: any) => {
      console.log("newMemberJoined", data);
      const peer_info = data.peer_info;

      peerMapRef.current.set(data.id, {
        peer_name: peer_info.peer_name,
        video: peer_info.peer_video,
        video_producer: undefined,
        video_consumer: undefined,
        screen: peer_info.peer_screen,
        screen_producer: undefined,
        screen_consumer: undefined,
        audio: peer_info.peer_audio,
        audio_producer: undefined,
        audio_consumer: undefined,
        hand: peer_info.peer_hand,
      });

      setNewUserStream((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.id, {
          peer_name: peer_info.peer_name,
          video_stream: undefined,
          screen_stream: undefined,
          audio_stream: undefined,
          hand: peer_info.peer_hand,
        });
        return newMap;
      });
    });

    socketRef.current.on("newProducers", async (data: any) => {
      console.log("newProducer", data);

      for (const producer of data) {
        switch (producer.type) {
          case "audio":
            peerMapRef.current.get(producer.id).audio_producer =
              producer.producer_id;
            break;
          case "video":
            peerMapRef.current.get(producer.id).video_producer =
              producer.producer_id;
            break;
          case "screen":
            peerMapRef.current.get(producer.id).screen_producer =
              producer.producer_id;
            break;
        }

        await myConsume(producer.id, producer.type, producer.producer_id);
      }
    });

    socketRef.current.on("removeMe", async (data: any) => {
      peerMapRef.current.delete(data.peer_id);
      setNewUserStream((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.peer_id);
        return newMap;
      });
    });

    socketRef.current.on("updatePeerInfo", async (data: any) => {
      console.log("updatePeerInfo", data);
      switch (data.type) {
        case "audio":
          peerMapRef.current.get(data.id).audio = data.status;
          setNewUserStream((prev) => {
            const newMap = new Map(prev);
            newMap.get(data.id).audio_stream = undefined;
            return newMap;
          });
          break;
        case "video":
          peerMapRef.current.get(data.id).video = data.status;
          setNewUserStream((prev) => {
            const newMap = new Map(prev);
            newMap.get(data.id).video_stream = undefined;
            return newMap;
          });
          break;
        case "screen":
          peerMapRef.current.get(data.id).screen = data.status;
          setNewUserStream((prev) => {
            const newMap = new Map(prev);
            newMap.get(data.id).screen_stream = undefined;
            return newMap;
          });
          break;
        case "hand":
          peerMapRef.current.get(data.id).hand = data.status;
          setNewUserStream((prev) => {
            const newMap = new Map(prev);
            newMap.get(data.id).hand = data.status;
            return newMap;
          });
          break;
      }
    });

    socketRef.current.on("message", async (data: any) => {
      setMessages((prev) => [
        ...prev,
        { peer_name: data.peer_name, peer_msg: data.peer_msg },
      ]);
    });
  }, []);

  const newRender = () => {
    const userStreamArray = Array.from(newUserStream);

    return userStreamArray.map(([key, value], index) => {
      return (
        <div key={index}>
          <br />
          <div>
            {value.peer_name} {value.hand ? "🤘" : ""}
          </div>
          <Video stream={value.video_stream} />
          {value.screen_stream && <Video stream={value.screen_stream} />}
          {value.audio_stream && (
            <Video stream={value.audio_stream} isSound={true} />
          )}
        </div>
      );
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
        disabled={isInRoom}
      />
      방id:{" "}
      <input
        type="text"
        onChange={handleRoomChange}
        placeholder="room"
        value={roomId}
        disabled={isInRoom}
      />
      <br />
      <button onClick={joinRoom} disabled={isInRoom}>
        방 입장
      </button>
      <button onClick={exitRoom} disabled={!isInRoom}>
        방 나가기
      </button>
      <br />
      <div style={{ display: isInRoom ? "none" : "block" }}>
        <button onClick={beforeVideo}>
          비디오 {isBeforeVideo ? "끄고 입장하기" : "켜고 입장하기"}
        </button>
        <button onClick={beforeAudio}>
          오디오 {isBeforeAudio ? "끄고 입장하기" : "켜고 입장하기"}
        </button>
      </div>
      <div style={{ display: isInRoom ? "block" : "none" }}>
        <button onClick={handleWebcamVideo}>
          비디오 공유 {isVideoOn ? "종료하기" : "시작하기"}
        </button>
        <button onClick={handleScreenVideo}>
          화면 공유 {isScreenOn ? "종료하기" : "시작하기"}
        </button>
        <button onClick={handleAudio}>
          소리 공유 {isAudioOn ? "종료하기" : "시작하기"}
        </button>
        <button onClick={handleHand}>
          {isHandOn ? "손 내리기" : "손 들기"}
        </button>
        <br />
        <br />
        <div>나 {isHandOn ? "🤘" : ""}</div>
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
            display: isScreenOn ? "inline" : "none",
          }}
          ref={localScreenVideoRef}
          muted
          autoPlay
        ></video>
        <br />
        {newRender()}
        <div>메시지</div>
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleMessageKeyDown}
          placeholder="메시지 입력"
        />
        {messages.map((m: any, index: number) => {
          return (
            <div key={index}>
              {m.peer_name} : {m.peer_msg}
            </div>
          );
        })}
      </div>
    </>
  );
};
