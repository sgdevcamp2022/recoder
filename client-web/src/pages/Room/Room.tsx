import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { RoomBottomTab } from "../../components/Room/RoomBottomTab/RoomBottomTab";
import { RoomContent } from "../../components/Room/RoomContent/RoomContent";
import { setRoomId } from "../../redux/slices/roomSlice";

const RoomBox = styled.div`
  background-color: black;
`;

export default function Room() {
  const dispatch = useDispatch();
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    dispatch(setRoomId({ data: roomId }));
  }, [dispatch, roomId]);

  return (
    <RoomBox>
      <RoomContent />
      <RoomBottomTab />
    </RoomBox>
  );
}
