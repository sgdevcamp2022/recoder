import styled from "styled-components";
import { RoomBottomTab } from "../../components/Room/RoomBottomTab/RoomBottomTab";
import { RoomContent } from "../../components/Room/RoomContent/RoomContent";

const RoomBox = styled.div`
  background-color: black;
`;

export default function Room() {
  return (
    <RoomBox>
      <RoomContent />
      <RoomBottomTab />
    </RoomBox>
  );
}
