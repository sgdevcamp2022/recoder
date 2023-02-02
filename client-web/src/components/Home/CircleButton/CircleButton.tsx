import styled from "styled-components";
import { CircleButtonProps } from "./CircleButton.types";

const ButtonBox = styled.button`
  width: 48px;
  height: 48px;
  padding: 12px;
  border: none;
  border-radius: 50%;
  background-color: white;
  &:hover {
    background-color: #f2f2f2;
  }
  display: inline;
`;

const ButtonIcon = styled.img`
  width: 24px;
  height: 24px;
`;

export const CircleButton = ({ src }: CircleButtonProps) => {
  return (
    <ButtonBox>
      <ButtonIcon src={src} />
    </ButtonBox>
  );
};
