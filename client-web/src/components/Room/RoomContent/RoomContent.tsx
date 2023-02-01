import styled from "styled-components";
import { Participant } from "../Participant/Participant";

const MainBox = styled.div`
  width: 100vw;
  height: calc(100vh - 80px);
  background: rgb(32, 33, 36);
`;

const ContentBox = styled.div`
  width: calc(100% - 32px);
  height: calc(100% - 96px);
  position: absolute;
  inset: 16px 16px 80px;
  background: rgb(32, 33, 36);
`;

export const RoomContent = () => {
  return (
    <MainBox>
      <ContentBox>
        <Participant />
      </ContentBox>
    </MainBox>
  );
};
