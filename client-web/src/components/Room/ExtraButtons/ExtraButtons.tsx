import styled from "styled-components";
import { CircleButton } from "../../Home/CircleButton/CircleButton";
import FeedBack from "../../../assets/images/feedback.png";

const ButtonBox = styled.div`
  display: flex;
  flex: 1 1 25%;
  align-items: center;
  justify-content: flex-end;
  margin-right: 18px;
`;

export const ExtraButtons = () => {
  return (
    <ButtonBox>
      <CircleButton src={FeedBack} />
      <CircleButton src={FeedBack} />
      <CircleButton src={FeedBack} />
      <CircleButton src={FeedBack} />
      <CircleButton src={FeedBack} />
    </ButtonBox>
  );
};
