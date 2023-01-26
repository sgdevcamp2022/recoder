import styled from "styled-components";
import HelpIcon from "../../assets/images/help.png";
import FeedbackIcon from "../../assets/images/feedback.png";
import SettingsIcon from "../../assets/images/settings.png";
import DateTime from "../DateTime/DateTime";
import { CircleButton } from "../CircleButton/CircleButton";

const HeaderInfoBox = styled.div`
  flex: 0 0 auto;
  justify-content: space-between;
  height: 48px;
  vertical-align: middle;
  white-space: nowrap;
  align-items: center;
  display: block;
  line-height: 0;
`;

const HeaderIconBox = styled.div`
  display: table-cell;
  vertical-align: middle;
  height: 48px;
  text-align: initial;
  padding-left: 16px;
`;

export const HeaderInfo = () => {
  return (
    <HeaderInfoBox>
      <DateTime />
      <HeaderIconBox>
        <CircleButton src={HelpIcon} />
        <CircleButton src={FeedbackIcon} />
        <CircleButton src={SettingsIcon} />
      </HeaderIconBox>
    </HeaderInfoBox>
  );
};
