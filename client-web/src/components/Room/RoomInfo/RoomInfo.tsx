import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

const RoomInfoBox = styled.div`
  margin-left: 12px;
  justify-content: flex-start;
  display: flex;
  text-align: center;
  align-items: center;
  flex: 1 1 25%;
`;

const TimeSpan = styled.span`
  padding-left: 12px;
  display: flex;
  align-items: center;
`;

const Seperator = styled.div`
  height: 1rem;
  border-left: 1px solid rgb(218, 220, 224);
  margin-left: 12px;
`;

const RoomCode = styled.div`
  margin: 0 12px;
`;

export const RoomInfo = () => {
  dayjs.locale("ko");
  const roomId = useSelector((state: any) => state.room.roomId);
  const [time, setTime] = useState(dayjs().format("h:mm A"));

  useEffect(() => {
    setInterval(() => {
      setTime(dayjs().format("h:mm A"));
    }, 10000);
  });

  return (
    <RoomInfoBox>
      <TimeSpan>
        {time}
        <Seperator />
      </TimeSpan>
      <RoomCode>{roomId}</RoomCode>
    </RoomInfoBox>
  );
};
