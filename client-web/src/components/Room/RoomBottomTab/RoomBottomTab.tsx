import styled from "styled-components";
import { RoomInfo } from "../RoomInfo/RoomInfo";
import { RoomButtons } from "../RoomButtons/RoomButtons";
import { ExtraButtons } from "../ExtraButtons/ExtraButtons";

const BottomTabBox = styled.div`
  width: 100vw;
  height: 5rem;
  background: rgb(32, 33, 36);
  display: flex;
  color: white;
  position: fixed;
  bottom: 0;
`;

export const RoomBottomTab = () => {
  return (
    <BottomTabBox>
      <RoomInfo></RoomInfo>
      <RoomButtons></RoomButtons>
      <ExtraButtons></ExtraButtons>
    </BottomTabBox>
  );
};
