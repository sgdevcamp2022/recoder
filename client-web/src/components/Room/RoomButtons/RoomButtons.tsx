import styled from "styled-components";

const ButtonBox = styled.div`
  display: flex;
  flex: 1 1 25%;
  justify-content: center;
  align-items: center;
`;

const GridBox = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 12px;
  padding: 0 6px;
`;

const RedCircleButton = styled.button`
  background-color: rgb(234, 67, 53);
  border: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 100px;
`;

export const RoomButtons = () => {
  return (
    <ButtonBox>
      <GridBox>
        <RedCircleButton></RedCircleButton>
        <RedCircleButton></RedCircleButton>
        <RedCircleButton></RedCircleButton>
        <RedCircleButton></RedCircleButton>
        <RedCircleButton></RedCircleButton>
        <RedCircleButton></RedCircleButton>
        <RedCircleButton></RedCircleButton>
        <RedCircleButton></RedCircleButton>
      </GridBox>
    </ButtonBox>
  );
};
