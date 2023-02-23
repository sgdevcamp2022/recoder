import { io } from "socket.io-client";
import { Fragment, useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import { Video } from "../../components/Meet/Video";
import {
  BlueButton,
  CommonButton,
  GrayButton,
  InfoBox,
  MeetBottomTab,
  MeetBox,
  MeetButtonBox,
  MeetContent,
  MessageBox,
  MessageCloseButton,
  MessageContentBox,
  MessageInput,
  MessageInputBox,
  MessageSendButton,
  MessageTitle,
  MessageTitleBox,
  OtherButtonBox,
  RedButton,
  RedLongButton,
  RoomText,
  Seperator,
  TimeText,
  VideoBox,
} from "../../components/Meet/MeetWrapper";
import { Message } from "../../components/Meet/Message";
import { useParams } from "react-router-dom";

export const Test = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [peerName, setPeerName] = useState<string>(
    `user-${(Math.floor(Math.random() * 10000) + 1).toString()}`
  );

  const [newUserStream, setNewUserStream] = useState<Map<any, any>>(new Map());

  const [isVideoOn, setIsVideoOn] = useState<boolean>(false);
  const [isScreenOn, setIsScreenOn] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [isHandOn, setIsHandOn] = useState<boolean>(false);
  const [isMessageOn, setIsMessageOn] = useState<boolean>(false);

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);

  const [videoSize, setVideoSize] = useState<any>({ width: 0, height: 0 });
  const videoBoxRef = useRef<HTMLDivElement>(null);

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

  const joinRoom = async () => {
    await new Promise(async (resolve) => {
      await socketRef.current.emit(
        "createRoom",
        { room_id: roomId },
        async (response: any) => {
          const isHost = response?.room_id;

          await new Promise(async (resolve) => {
            await socketRef.current.emit(
              "join",
              JSON.stringify({
                peer_info: peer_info,
                room_id: roomId,
                id: socketRef.current.id,
              }),
              (response: any) => {
                console.log("방 참가 인원", response);
                for (let peer of response.peers) {
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

                resolve("");
              }
            );
          });

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
  };

  const exitRoom = async () => {
    // root 주소로 이동
    window.location.href = "/";
  };

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  };

  const handleMessageKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();

      socketRef.current.emit("message", {
        to_peer_id: "all",
        peer_name: peerName,
        peer_msg: message,
      });

      setMessages([...messages, { peer_name: peerName, peer_msg: message }]);

      setMessage("");
    }
  };

  const handleMessageClick = (e: any) => {
    socketRef.current.emit("message", {
      to_peer_id: "all",
      peer_name: peerName,
      peer_msg: message,
    });

    setMessages([...messages, { peer_name: peerName, peer_msg: message }]);

    setMessage("");
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

      setIsVideoOn(true);

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).video_stream =
        localWebcamStreamRef.current;
      setNewUserStream(newMap);

      await produce(localWebcamStreamRef.current, "video");

      updateMyInfo("video", true);
    } else {
      socketRef.current.emit("producerClosed", {
        id: socketRef.current.id,
        producer_id: producerMapRef.current.get("video"),
        peer_name: peerName,
        type: "video",
        status: false,
      });

      localWebcamStreamRef.current.getVideoTracks()[0].stop();

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).video_stream = undefined;
      setNewUserStream(newMap);

      setIsVideoOn(false);
    }
  };

  const handleScreenVideo = async () => {
    if (!isScreenOn) {
      localScreenStreamRef.current =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).screen_stream =
        localScreenStreamRef.current;
      setNewUserStream(newMap);

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

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).screen_stream = undefined;
      setNewUserStream(newMap);

      setIsScreenOn(false);
    }
  };

  const handleAudio = async () => {
    if (!isAudioOn) {
      localAudioStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setIsAudioOn(true);

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).audio_stream =
        localAudioStreamRef.current;
      setNewUserStream(newMap);

      await produce(localAudioStreamRef.current, "audio");

      updateMyInfo("audio", true);
    } else {
      socketRef.current.emit("producerClosed", {
        id: socketRef.current.id,
        producer_id: producerMapRef.current.get("audio"),
        peer_name: peerName,
        type: "audio",
        status: false,
      });

      localAudioStreamRef.current.getAudioTracks()[0].stop();

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).audio_stream = undefined;
      setNewUserStream(newMap);

      setIsAudioOn(false);
    }
  };

  const handleHand = () => {
    if (!isHandOn) {
      updateMyInfo("hand", true);

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).hand = true;
      setNewUserStream(newMap);

      setIsHandOn(true);
    } else {
      updateMyInfo("hand", false);

      const newMap = new Map(newUserStream);
      newMap.get(socketRef.current.id).hand = false;
      setNewUserStream(newMap);

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
      await sendTransportRef.current.produce({
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

  const handleResize = () => {
    let width = 0;
    let height = 0;

    if (videoBoxRef.current) {
      const userStreamArray = Array.from(newUserStream);
      let newVideoCount = userStreamArray.length;

      userStreamArray.forEach(([key, value]) => {
        if (value.screen_stream) {
          newVideoCount++;
        }
      });

      const rowCount = Math.floor((newVideoCount + 1) / 2);

      const videoBoxWidth = videoBoxRef.current.offsetWidth;
      const videoBoxHeight = videoBoxRef.current.offsetHeight;

      if (newVideoCount === 1) {
        width = videoBoxWidth - 32;
      } else {
        width = videoBoxWidth / 2 - 32;
      }
      height = videoBoxHeight / rowCount - 16;

      // 너무 가로로 길어지는 것을 방지
      width = width > height * 1.78 ? height * 1.78 : width;
      width = width + 32 > videoBoxWidth ? videoBoxWidth - 32 : width;

      // 너무 세로로 길어지는 것을 방지
      height = height > width / 1.34 ? width / 1.34 : height;
      height =
        (height + 16) * rowCount > videoBoxHeight
          ? videoBoxHeight / rowCount - 16
          : height;
    }

    setVideoSize({
      width: width,
      height: height,
    });
  };

  // isMessageOn이 바뀔 때마다 실행 되는 로직
  useEffect(() => {
    handleResize();
  }, [isMessageOn]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [newUserStream]);

  // 첫 렌더링 후 1회 실행 되는 로직들
  useEffect(() => {
    async function myJoinRoom() {
      await joinRoom();
    }

    async function myConsume(peerId: any, type: string, id: any) {
      await consume(peerId, type, id);
    }

    socketRef.current = io("http://localhost:5000");
    peer_info.peer_id = socketRef.current.id;

    myJoinRoom();

    socketRef.current.on("newMemberJoined", async (data: any) => {
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

    return () => {
      window.removeEventListener("resize", handleResize);
      socketRef.current.disconnect();
    };
  }, []);

  const videoRendering = () => {
    const userStreamArray = Array.from(newUserStream);

    return userStreamArray.map(([key, value], index) => {
      return (
        <Fragment key={index}>
          <Video
            stream={value.video_stream}
            width={videoSize.width}
            height={videoSize.height}
            name={value.peer_name}
            isAudioOn={value.audio_stream ? true : false}
            isHand={value.hand}
            isScreen={false}
            isSound={false}
            isMe={value.peer_name === peerName}
          ></Video>
          {value.screen_stream && (
            <Video
              stream={value.screen_stream}
              width={videoSize.width}
              height={videoSize.height}
              name={value.peer_name}
              isAudioOn={false}
              isHand={false}
              isScreen={true}
              isSound={false}
              isMe={value.peer_name === peerName}
            ></Video>
          )}
          {value.audio_stream && (
            <Video
              stream={value.audio_stream}
              width={videoSize.width}
              height={videoSize.height}
              name={value.peer_name}
              isAudioOn={false}
              isHand={false}
              isScreen={false}
              isSound={true}
              isMe={value.peer_name === peerName}
            ></Video>
          )}
        </Fragment>
      );
    });
  };

  return (
    <MeetBox>
      <MeetContent>
        <VideoBox ref={videoBoxRef} isChat={isMessageOn}>
          {videoRendering()}
        </VideoBox>
        {isMessageOn ? (
          <MessageBox>
            <MessageTitleBox>
              <MessageTitle>회의 중 메시지</MessageTitle>
              <MessageCloseButton
                onClick={(e) => {
                  setIsMessageOn(false);
                }}
              >
                <span className="material-icons">close</span>
              </MessageCloseButton>
            </MessageTitleBox>
            <MessageContentBox>
              {messages.map((message, index) => {
                return (
                  <Message
                    key={index}
                    peer={message.peer_name}
                    message={message.peer_msg}
                    myName={peerName}
                  ></Message>
                );
              })}
            </MessageContentBox>
            <MessageInputBox>
              <MessageInput
                rows={1}
                onChange={handleMessageChange}
                onKeyPress={handleMessageKeyDown}
                value={message}
              ></MessageInput>
              <MessageSendButton onClick={handleMessageClick}>
                <span className="material-icons">send</span>
              </MessageSendButton>
            </MessageInputBox>
          </MessageBox>
        ) : (
          <></>
        )}
      </MeetContent>
      <MeetBottomTab>
        <InfoBox>
          <TimeText>12:47 오전</TimeText>
          <Seperator />
          <RoomText>wzy-jqmk-aad</RoomText>
        </InfoBox>
        <MeetButtonBox>
          {isAudioOn ? (
            <GrayButton onClick={handleAudio}>
              <svg
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="Hdh4hc cIGbvc NMm5M"
              >
                <path
                  d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                  fill="#FFFFFF"
                ></path>
                <path
                  d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                  fill="#FFFFFF"
                ></path>
              </svg>
            </GrayButton>
          ) : (
            <RedButton onClick={handleAudio}>
              <svg
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            </RedButton>
          )}
          {isVideoOn ? (
            <GrayButton onClick={handleWebcamVideo}>
              <svg
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="Hdh4hc cIGbvc NMm5M"
              >
                <path
                  d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"
                  fill="#FFFFFF"
                ></path>
              </svg>
            </GrayButton>
          ) : (
            <RedButton onClick={handleWebcamVideo}>
              <svg
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="Hdh4hc cIGbvc NMm5M"
              >
                <path
                  d="M18 10.48V6c0-1.1-.9-2-2-2H6.83l2 2H16v7.17l2 2v-1.65l4 3.98v-11l-4 3.98zM16 16L6 6 4 4 2.81 2.81 1.39 4.22l.85.85C2.09 5.35 2 5.66 2 6v12c0 1.1.9 2 2 2h12c.34 0 .65-.09.93-.24l2.85 2.85 1.41-1.41L18 18l-2-2zM4 18V6.83L15.17 18H4z"
                  fill="#FFFFFF"
                ></path>
              </svg>
            </RedButton>
          )}
          {!isHandOn ? (
            <GrayButton onClick={handleHand}>
              <svg
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                enableBackground="new 0 0 24 24"
                focusable="false"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                className="Hdh4hc cIGbvc NMm5M"
              >
                <rect fill="none" height="24" width="24"></rect>
                <path
                  d="M21,7c0-1.38-1.12-2.5-2.5-2.5c-0.17,0-0.34,0.02-0.5,0.05V4c0-1.38-1.12-2.5-2.5-2.5c-0.23,0-0.46,0.03-0.67,0.09 C14.46,0.66,13.56,0,12.5,0c-1.23,0-2.25,0.89-2.46,2.06C9.87,2.02,9.69,2,9.5,2C8.12,2,7,3.12,7,4.5v5.89 c-0.34-0.31-0.76-0.54-1.22-0.66L5.01,9.52c-0.83-0.23-1.7,0.09-2.19,0.83c-0.38,0.57-0.4,1.31-0.15,1.95l2.56,6.43 C6.49,21.91,9.57,24,13,24h0c4.42,0,8-3.58,8-8V7z M19,16c0,3.31-2.69,6-6,6h0c-2.61,0-4.95-1.59-5.91-4.01l-2.6-6.54l0.53,0.14 c0.46,0.12,0.83,0.46,1,0.9L7,15h2V4.5C9,4.22,9.22,4,9.5,4S10,4.22,10,4.5V12h2V2.5C12,2.22,12.22,2,12.5,2S13,2.22,13,2.5V12h2V4 c0-0.28,0.22-0.5,0.5-0.5S16,3.72,16,4v8h2V7c0-0.28,0.22-0.5,0.5-0.5S19,6.72,19,7L19,16z"
                  fill="#FFFFFF"
                ></path>
              </svg>
            </GrayButton>
          ) : (
            <RedButton onClick={handleHand}>
              <svg
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                enableBackground="new 0 0 24 24"
                focusable="false"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                className="Hdh4hc cIGbvc NMm5M"
              >
                <rect fill="none" height="24" width="24"></rect>
                <g fill="#FFFFFF">
                  <path
                    d="M12,24c-3.26,0-6.19-1.99-7.4-5.02l-3.03-7.61c-0.31-0.79,0.43-1.58,1.24-1.32l0.79,0.26c0.56,0.18,1.02,0.61,1.24,1.16 L6.25,15H7V3.25C7,2.56,7.56,2,8.25,2C8.94,2,9.5,2.56,9.5,3.25V12h1V1.25C10.5,0.56,11.06,0,11.75,0S13,0.56,13,1.25V12h1V2.75 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25V12h1V5.75c0-0.69,0.56-1.25,1.25-1.25S20,5.06,20,5.75V16 C20,20.42,16.42,24,12,24z"
                    fill="#FFFFFF"
                  ></path>
                </g>
              </svg>
            </RedButton>
          )}
          {isScreenOn ? (
            <BlueButton onClick={handleScreenVideo}>
              <span className="material-icons">present_to_all</span>
            </BlueButton>
          ) : (
            <GrayButton onClick={handleScreenVideo}>
              <span className="material-icons">present_to_all</span>
            </GrayButton>
          )}
          <RedLongButton onClick={exitRoom}>
            <span className="material-icons">call_end</span>
          </RedLongButton>
        </MeetButtonBox>
        <OtherButtonBox>
          <CommonButton
            onClick={(e) => {
              setIsMessageOn(!isMessageOn);
            }}
          >
            <span className="material-icons">chat</span>
          </CommonButton>
          <CommonButton>
            <span className="material-icons">info</span>
          </CommonButton>
          <CommonButton>
            <span className="material-icons">people_outline</span>
          </CommonButton>
        </OtherButtonBox>
      </MeetBottomTab>
    </MeetBox>
  );
};
