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
  return (
    <RoomInfoBox>
      <TimeSpan>
        2:53 오후
        <Seperator />
      </TimeSpan>
      <RoomCode>asy-xity-brp</RoomCode>
    </RoomInfoBox>
  );
};
